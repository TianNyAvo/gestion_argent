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
        required: true,
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
        user_id: new mongodb.ObjectId(req.user_id)
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

