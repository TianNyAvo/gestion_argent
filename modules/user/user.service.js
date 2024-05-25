var dbServices = require('../database/database.service');
var mongodb = require('mongodb');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    role: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: false,
    },
    prenom:{
        type: String,
        required: false
    },
    mdp: {
        type: String,
        required: false,
    },
    matricule: {
        type: String,
        required: true,
        unique: true
    },
    last_year:{
        type: Number,
        required: false,
        default: null
    },
    last_month:{
        type: Number,
        required: false,
        default: null
    }
  });

const User = mongoose.model('users', userSchema);
mongoose.connect("mongodb+srv://tandriatoavina:<password>@tiancluster.1h72rz3.mongodb.net/?retryWrites=true&w=majority&appName=TianCluster/gestion_argent", {
  useNewUrlParser: true,
  bufferTimeoutMS: 60000, // Set bufferTimeoutMS to 60 seconds
});

exports.User = User;

exports.insertUser = async (req) => {
    const user = new User({
        role: "guest",
        name: req.name,
        prenom: req.prenom,
        mdp: req.mdp ? req.mdp : "fgk$yergpojf",
        matricule: req.matricule,
        last_year: req.last_year? req.last_year : null,
        last_month: req.last_month? req.last_month : null
    });
    const {db, client} = await dbServices.connectToDatabase();
    // const collection = db.collection('users');
   try {
     const result = await user.save();
     console.log('Inserted user:', result.toObject());
     return result;
    } catch (error) {
        console.error('Error inserting customer:', error);
        return { error: error };
    }
    finally{client.close();}
    
};

exports.loginUser = async (user) => {
    const {db, client} = await dbServices.connectToDatabase();
    const collection = db.collection('users');
    console.log('Logging in customer:', user);
    try {
        console.log('Logging in customer:', user);
        const result = await collection.findOne({ matricule: user.matricule});
        if (result) {
            if (result.mdp === user.mdp) {
                console.log('Logged in user:', result);
                client.close();
                return result;
            }
        
            else {
                console.log('Incorrect matricule or password');
                client.close();
                return  "incorrect";
            }
        }
        else {
            console.log('Incorrect matricule or password');
            client.close();
            return "incorrect";
        }
    } catch (error) {
        console.error('Error logging in customer:', error);
        client.close();
        throw error;
    }

};

exports.listUser = async () => {
    const {db, client} = await dbServices.connectToDatabase();
    const collection = db.collection('users');
    try {
        const result = await collection.find().toArray();
        console.log('Listed users:', result);
        return result;
    } catch (error) {
        console.error('Error listing users:', error);
        throw error;
    }
    finally{client.close();}
};

exports.getAllUserCotisation = async (year) => {
    try {
        const results = await User.aggregate([
            {
                $lookup: {
                    from: 'mouvements',
                    let: { userId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$user_id', '$$userId'] },
                                        { $eq: [{ $year: '$date' }, year] },
                                        { $eq: ['$type', 'input'] }
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: { month: { $month: '$date' } },
                                totalMontant: { $sum: '$montant' }
                            }
                        }
                    ],
                    as: 'mouvements'
                }
            },
            {
                $addFields: {
                    monthlyInputs: {
                        $map: {
                            input: { $range: [1, 13] },
                            as: 'month',
                            in: {
                                month: '$$month',
                                total: {
                                    $reduce: {
                                        input: '$mouvements',
                                        initialValue: 0,
                                        in: {
                                            $cond: [
                                                { $eq: ['$$this._id.month', '$$month'] },
                                                { $add: ['$$value', '$$this.totalMontant'] },
                                                '$$value'
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    user_id: '$_id',
                    name: 1,
                    prenom: 1,
                    matricule: 1,
                    last_year: 1,
                    last_month: 1,
                    monthlyInputs: 1
                }
            }
        ]);

        console.log('All user cotisations:', results[0].monthlyInputs);
        return {
            year: year,
            results: results
        };
    } catch (error) {
        console.error('Error fetching user movements:', error);
        throw error;
    }
};

exports.getUserCotisation = async (userId, year) => {
    console.log('year:', year);
    try {
        const results = await User.aggregate([
            {
                $match: { _id: mongoose.Types.ObjectId(userId) }
            },
            {
                $lookup: {
                    from: 'mouvements',
                    let: { userId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$user_id', '$$userId'] },
                                        { $eq: [{ $year: '$date' }, year] },
                                        { $eq: ['$type', 'input'] }
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: { month: { $month: '$date' } },
                                totalMontant: { $sum: '$montant' }
                            }
                        }
                    ],
                    as: 'mouvements'
                }
            },
            {
                $addFields: {
                    monthlyInputs: {
                        $map: {
                            input: { $range: [1, 13] },
                            as: 'month',
                            in: {
                                month: '$$month',
                                total: {
                                    $reduce: {
                                        input: '$mouvements',
                                        initialValue: 0,
                                        in: {
                                            $cond: [
                                                { $eq: ['$$this._id.month', '$$month'] },
                                                { $add: ['$$value', '$$this.totalMontant'] },
                                                '$$value'
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    user_id: '$_id',
                    name: 1,
                    prenom: 1,
                    matricule: 1,
                    last_year: 1,
                    last_month: 1,
                    monthlyInputs: 1
                }
            }
        ]);

        console.log('User cotisations:', results[0]);

        return {
            year: year,
            results: results[0]
        };
    } catch (error) {
        console.error('Error fetching user movements:', error);
        throw error;
    }
};

exports.getUserMovementsByMonthYear = async (month, year) => {
    var resultat = {};
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Dernier jour du mois

    try {
        const result = await User.aggregate([
            {
                $lookup: {
                    from: 'mouvements',
                    let: { userId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$user_id', '$$userId'] },
                                        { $gte: ['$date', startDate] },
                                        { $lte: ['$date', endDate] }
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: '$type',
                                totalMontant: { $sum: '$montant' }
                            }
                        }
                    ],
                    as: 'mouvements'
                }
            },
            {
                $addFields: {
                    totalInput: {
                        $reduce: {
                            input: '$mouvements',
                            initialValue: 0,
                            in: {
                                $cond: [
                                    { $eq: ['$$this._id', 'input'] },
                                    { $add: ['$$value', '$$this.totalMontant'] },
                                    { $add: ['$$value', 0] }
                                ]
                            }
                        }
                    },
                    totalOutput: {
                        $reduce: {
                            input: '$mouvements',
                            initialValue: 0,
                            in: {
                                $cond: [
                                    { $eq: ['$$this._id', 'output'] },
                                    { $add: ['$$value', '$$this.totalMontant'] },
                                    { $add: ['$$value', 0] }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    difference: { $subtract: ['$totalInput', '$totalOutput'] }
                }
            },
            {
                $project: {
                    _id: 0,
                    user_id: '$_id',
                    name: 1,
                    prenom: 1,
                    matricule: 1,
                    totalInput: 1,
                    totalOutput: 1,
                    difference: 1
                }
            }
        ]);
    
        resultat = {
            month: month,
            year: year,
            user_info: result
        };
    
        return resultat;
    } catch (error) {
        console.error('Error getting user movements services:', error);
        throw error;
    }
};


exports.getUserMovementsByYear = async (year) => {
    const startDate = new Date(year, 0, 1); // 1er janvier de l'année
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999); // 31 décembre de l'année

    try {
        const result = await User.aggregate([
            {
                $lookup: {
                    from: 'mouvements',
                    let: { userId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$user_id', '$$userId'] },
                                        { $gte: ['$date', startDate] },
                                        { $lte: ['$date', endDate] }
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: '$type',
                                totalMontant: { $sum: '$montant' }
                            }
                        }
                    ],
                    as: 'mouvements'
                }
            },
            {
                $addFields: {
                    totalInput: {
                        $reduce: {
                            input: '$mouvements',
                            initialValue: 0,
                            in: {
                                $cond: [
                                    { $eq: ['$$this._id', 'input'] },
                                    { $add: ['$$value', '$$this.totalMontant'] },
                                    '$$value'
                                ]
                            }
                        }
                    },
                    totalOutput: {
                        $reduce: {
                            input: '$mouvements',
                            initialValue: 0,
                            in: {
                                $cond: [
                                    { $eq: ['$$this._id', 'output'] },
                                    { $add: ['$$value', '$$this.totalMontant'] },
                                    '$$value'
                                ]
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    difference: { $subtract: ['$totalInput', '$totalOutput'] }
                }
            },
            {
                $project: {
                    _id: 0,
                    user_id: '$_id',
                    name: 1,
                    prenom: 1,
                    matricule: 1,
                    totalInput: 1,
                    totalOutput: 1,
                    difference: 1
                }
            }
        ]);
    
        return {
            year: year,
            user_info: result
        };
    } catch (error) {
        console.error('Error getting user movements by year services:', error);
        throw error;
    }
};


// exports.getSingleUserMovement = async (user_id, year, month) => {
//     const startDate = new Date(year, 0, 1); // 1er janvier de l'année
//     const endDate = new Date(year, 11, 31, 23, 59, 59, 999); // 31 décembre de l'année


// };

exports.getUnpaidUserMovementsByMonthYear = async (month, year) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Dernier jour du mois

    try {
        const result = await User.aggregate([
            {
                $lookup: {
                    from: 'mouvements',
                    let: { userId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$user_id', '$$userId'] },
                                        { $gte: ['$date', startDate] },
                                        { $lte: ['$date', endDate] }
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: '$type',
                                totalMontant: { $sum: '$montant' }
                            }
                        }
                    ],
                    as: 'mouvements'
                }
            },
            {
                $addFields: {
                    totalInput: {
                        $reduce: {
                            input: '$mouvements',
                            initialValue: 0,
                            in: {
                                $cond: [
                                    { $eq: ['$$this._id', 'input'] },
                                    { $add: ['$$value', '$$this.totalMontant'] },
                                    { $add: ['$$value', 0] }
                                ]
                            }
                        }
                    },
                    totalOutput: {
                        $reduce: {
                            input: '$mouvements',
                            initialValue: 0,
                            in: {
                                $cond: [
                                    { $eq: ['$$this._id', 'output'] },
                                    { $add: ['$$value', '$$this.totalMontant'] },
                                    { $add: ['$$value', 0] }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    difference: { $subtract: ['$totalInput', '$totalOutput'] }
                }
            },
            {
                $match: {
                    $or: [
                        { totalInput: { $eq: 0 } },
                        { difference: { $lte: 0 } }
                    ]
                }
            },
            {
                $project: {
                    _id: 0,
                    user_id: '$_id',
                    name: 1,
                    prenom: 1,
                    matricule: 1,
                    totalInput: 1,
                    totalOutput: 1,
                    difference: 1
                }
            }
        ]);

        const resultat = {
            month: month,
            year: year,
            user_info: result
        };

        return resultat;
    } catch (error) {
        console.error('Error getting filtered user movements:', error);
        throw error;
    }
};
