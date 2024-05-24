var dbServices = require('../database/database.service');
var mongodb = require('mongodb');


const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('../user/user.service').User;

const mouvementSchema = new Schema({
    date: {
        type: Date,
        required: true,
    },
    montant: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: false,
    },
  });

const Mouvement = mongoose.model('mouvement', mouvementSchema);

mongoose.connect("mongodb://localhost:27017/gestion_argent", {
  useNewUrlParser: true,
  bufferTimeoutMS: 60000, // Set bufferTimeoutMS to 60 seconds
});

exports.insertMouvement = async (req) => {
    const mouvement = new Mouvement({
        date: !(req.date) ? Date.now() : new Date(req.date),
        montant: req.montant,
        type: req.type,
        description: req.description,
        user_id: req.user_id ? new mongodb.ObjectId(req.user_id) : null,
        });
    const {db, client} = await dbServices.connectToDatabase();
    // const collection = db.collection('users');
   try {
     const result = await mouvement.save();
     console.log('Inserted mouvement:', result.toObject());
     return result.toObject();
    } catch (error) {
        console.error('Error inserting mouvement:', error);
        return { error: error };
    }
};

exports.getTotalInputsAndOutputs = async (year = null) => {
    try {
        const matchStage = year
            ? { $match: { date: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31, 23, 59, 59, 999) } } }
            : { $match: {} };

        const result = await Mouvement.aggregate([
            matchStage,
            {
                $group: {
                    _id: '$type',
                    totalMontant: { $sum: '$montant' }
                }
            },
            {
                $project: {
                    _id: 0,
                    type: '$_id',
                    totalMontant: 1
                }
            }
        ]);

        var totalInput = 0;
        var totalOutput = 0;
        console.log("result total", result);

        result.forEach(item => {
            if (item.type === 'input') {
                totalInput = item.totalMontant;
            } else if (item.type === 'output') {
                totalOutput = item.totalMontant;
            }
        });

        return {
            totalInput: totalInput,
            totalOutput: totalOutput
        };
    } catch (error) {
        console.error('Error calculating totals:', error);
        throw error;
    }
}

exports.getTotalInputsOutputsByYear = async () => {
    try {
        const result = await Mouvement.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        type: '$type'
                    },
                    totalMontant: { $sum: '$montant' }
                }
            },
            {
                $group: {
                    _id: '$_id.year',
                    totals: {
                        $push: {
                            type: '$_id.type',
                            totalMontant: '$totalMontant'
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    year: '$_id',
                    totalInput: {
                        $reduce: {
                            input: '$totals',
                            initialValue: 0,
                            in: {
                                $cond: [
                                    { $eq: ['$$this.type', 'input'] },
                                    { $add: ['$$value', '$$this.totalMontant'] },
                                    '$$value'
                                ]
                            }
                        }
                    },
                    totalOutput: {
                        $reduce: {
                            input: '$totals',
                            initialValue: 0,
                            in: {
                                $cond: [
                                    { $eq: ['$$this.type', 'output'] },
                                    { $add: ['$$value', '$$this.totalMontant'] },
                                    '$$value'
                                ]
                            }
                        }
                    }
                }
            }
        ]);

        return result;
    } catch (error) {
        console.error('Error calculating totals by year:', error);
        throw error;
    }
}

exports.getSingleUserMovements = async (userId, year) => {
    const startDate = new Date(year, 0, 1); // 1er janvier de l'année
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999); // 31 décembre de l'année

    // Récupérer les informations de l'utilisateur
    const user = await User.findById(userId).exec();
    if (!user) {
        throw new Error('Utilisateur non trouvé');
    }

    // Récupérer les mouvements de l'utilisateur pour l'année spécifiée
    const movements = await Mouvement.aggregate([
        {
            $match: {
                user_id: mongoose.Types.ObjectId(userId),
                date: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: {
                    month: { $month: "$date" },
                    type: "$type"
                },
                totalMontant: { $sum: "$montant" }
            }
        },
        {
            $group: {
                _id: "$_id.month",
                movements: {
                    $push: {
                        type: "$_id.type",
                        totalMontant: "$totalMontant"
                    }
                }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]);

    // Préparer les résultats avec tous les mois de l'année
    const months = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const result = months.map((month, index) => {
        const monthData = movements.find(m => m._id === index + 1);
        let totalInput = 0;
        let totalOutput = 0;

        if (monthData) {
            const inputData = monthData.movements.find(m => m.type === 'input');
            const outputData = monthData.movements.find(m => m.type === 'output');
            if (inputData) totalInput = inputData.totalMontant;
            if (outputData) totalOutput = outputData.totalMontant;
        }

        const difference = totalInput - totalOutput;

        return {
            month,
            totalInput,
            totalOutput,
            difference
        };
    });

    return {
        user: {
            user_id: user._id,
            name: user.name,
            prenom: user.prenom,
            matricule: user.matricule,
        },
        year: year,
        movements: result
    };
}

exports.getDepensesByYear = async (year) => {
    try {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

        var result = await Mouvement.find({
            date: { $gte: startDate, $lte: endDate },
            type: 'output'
        }).sort({ date: 1 });

        //format date in result
        const formattedResult = result.map(expense => {
            const date = new Date(expense.date);
            const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

            return {
                ...expense._doc,
                date: formattedDate
            };
        });

        console.log('Depenses by year:', formattedResult);

        return {
            year: year,
            depenses: formattedResult
        };
    } catch (error) {
        console.error('Error getting expenses by year:', error);
        throw error;
    }
};

exports.getAllCotisationsByYear = async (year) => {
    try {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

        const result = await Mouvement.aggregate([
            {
                $match: {
                    date: { $gte: startDate, $lte: endDate },
                    type: 'input'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    _id: 1,
                    date: {
                        $dateToString: {
                            format: '%d-%m-%Y',
                            date: '$date'
                        }
                    },
                    montant: 1,
                    type: 1,
                    description: 1,
                    user_id: 1,
                    'user.name': 1,
                    'user.prenom': 1,
                    'user.matricule': 1
                }
            },
            {
                $sort: { date: 1 }
            }
        ]);

        console.log('Cotisations by year:', result);

        return {
            year: year,
            cotisations: result
        };
    } catch (error) {
        console.error('Error getting inputs by year with user:', error);
        throw error;
    }
};