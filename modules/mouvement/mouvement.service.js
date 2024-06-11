var dbServices = require('../database/database.service');
var mongodb = require('mongodb');


const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('../user/user.service').User;
require('dotenv').config();

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

mongoose.connect(process.env.CONNECTION_STRING_DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    bufferTimeoutMS: 60000, // Set bufferTimeoutMS to 60 seconds
    useFindAndModify: false,
});

function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function formatDateEnglish(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
}   

exports.insertMouvement = async (req) => {
    var date = "";
    if (req.day == "" || req.day == null) {
        date = req.year + "-" + req.month + "-01";
    } else {
        date = req.year + "-" + req.month + "-" + req.day;
    }
    console.log("date", date);

    if (req.type == "input") {
        var montant = req.montant;
    
        var quotient = montant / 10000;
    
        try {
            var month = Number.parseInt(req.month);
            while (quotient > 0) {
                // date = req.year + "-" + req.month + "-01";
                const mouvement = new Mouvement({
                        date: new Date(date),
                        montant: 10000,
                        type: req.type,
                        description: req.description,
                        user_id: req.user_id ? new mongodb.ObjectId(req.user_id) : null,
                    });
            
                    const result = await mouvement.save();
                    console.log('Inserted mouvement:', result.toObject());
    
                    quotient = quotient - 1;
                    var next_month = month + 1;
                    if (next_month < 10) {
                        date = req.year + "-0" + next_month.toString() + "-01";
                    } else {
                        date = req.year + "-" + next_month.toString() + "-01";
                    }
                    console.log ("ici date next month",date)
                    month = month + 1;
                    // return "insertion mouvement";   
            }
        } catch (error) {
            console.error('Error inserting mouvement:', error);
            return { error: error };
        }
    }

    else{
        const mouvement = new Mouvement({
            date: new Date(date),
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
    }
};

exports.getById = async (id) => {
    try {
        // Récupérer le mouvement par son _id
        const movement = await Mouvement.findById(id).exec();
        if (!movement) {
            throw new Error('Mouvement non trouvé');
        } 

        // Formater la date en format anglais (DD/MM/YYYY)
        const formattedDate = formatDateEnglish(movement.date);

        return {
            _id: movement._id,
            date: formattedDate,
            montant: movement.montant,
            type: movement.type,
            description: movement.description,
            user_id: movement.user_id
        };
    } catch (error) {
        console.error('Error formatting movement date by ID:', error);
        throw error;
    }
};

exports.UpdateMouvement = async (req) => {
    try {
        const updatedMouvement = await Mouvement.findOneAndUpdate(
            {_id:new mongodb.ObjectId(req._id)}, {
                $set:{
            date: req.date,
            montant: req.montant,
            type: req.type,
            description: req.description,
            user_id: req.user_id ? new mongodb.ObjectId(req.user_id) : null,
        }}, { new: true });

        if (!updatedMouvement) {
            throw new Error('Mouvement not found');
        }

        console.log('Updated mouvement:', updatedMouvement);

        return updatedMouvement;
    } catch (error) {
        console.error('Error updating mouvement:', error);
        throw error;
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
        var totalAnnexe = 0;
        console.log("result total", result);

        result.forEach(item => {
            if (item.type === 'input') {
                totalInput = item.totalMontant;
            } else if (item.type === 'output') {
                totalOutput = item.totalMontant;
            }
            else if (item.type === 'annexe') {
                totalAnnexe = item.totalMontant;
            }
        });

        return {
            totalInput: totalInput,
            totalOutput: totalOutput,
            totalAnnexe: totalAnnexe
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
                    },
                    totalAnnexe: {
                        $reduce: {
                            input: '$totals',
                            initialValue: 0,
                            in: {
                                $cond: [
                                    { $eq: ['$$this.type', 'annexe'] },
                                    { $add: ['$$value', '$$this.totalMontant'] },
                                    '$$value'
                                ]
                            }
                        }
                    }
                }
            },
            {
                $sort: { year: -1 }  // Sort by year in descending order
            }
        ]);

        console.log('Totals by year:', result);

        return result;
    } catch (error) {
        console.error('Error calculating totals by year:', error);
        throw error;
    }
};

exports.getSingleUserMovements = async (userId, year) => {
    try {
        // Récupérer les informations de l'utilisateur
        const user = await User.findById(userId).exec();
        if (!user) {
            throw new Error('Utilisateur non trouvé');
        }

        const startDate = new Date(year, 0, 1); // 1er janvier de l'année
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999); // 31 décembre de l'année

        // Récupérer les mouvements de l'utilisateur de type "input" pour l'année spécifiée
        const movements = await Mouvement.find({
            user_id: userId,
            date: { $gte: startDate, $lte: endDate },
            type: 'input'
        }).select('_id date montant').sort({ date: 1 });

        // Formater les dates en format français (DD/MM/YYYY)
        const formattedMovements = movements.map(movement => ({
            _id: movement._id,
            date: formatDate(movement.date),
            montant: movement.montant
        }));

        return {
            year:year,
            user: {
                _id: user._id,
                name: user.name,
                prenom: user.prenom,
                matricule: user.matricule
            },
            movements: formattedMovements
        };
    } catch (error) {
        console.error('Error getting user input movements:', error);
        throw error;
    }
}; 


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

exports.getAnnexeByYear = async (year) => {
    try {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

        var result = await Mouvement.find({
            date: { $gte: startDate, $lte: endDate },
            type: 'annexe'
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

        console.log('Anneexe by year:', formattedResult);

        return {
            year: year,
            annexes: formattedResult
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
                            format: '%d/%m/%Y',
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