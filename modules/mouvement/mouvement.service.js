var dbServices = require('../database/database.service');
var mongodb = require('mongodb');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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