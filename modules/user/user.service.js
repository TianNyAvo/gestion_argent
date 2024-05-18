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
    email: {
        type: String,
        required: true,
        unique: true, // Assurez-vous que l'email est unique
    },
    mdp: {
        type: String,
        required: true,
    },
    matricule: {
        type: String,
        required: true,
    },
  });

const User = mongoose.model('users', userSchema);
mongoose.connect("mongodb://localhost:27017/gestion_argent", {
  useNewUrlParser: true,
  bufferTimeoutMS: 60000, // Set bufferTimeoutMS to 60 seconds
});


exports.insertUser = async (req) => {
    const user = new User({
        role: "guest",
        name: req.name,
        prenom: req.prenom,
        email: req.email,
        mdp: req.mdp,
        matricule: req.matricule
        });
    const {db, client} = await dbServices.connectToDatabase();
    // const collection = db.collection('users');
   try {
     const result = await user.save();
     console.log('Inserted user:', result.toObject());
     return result.toObject();
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
        const result = await collection.findOne({ email: user.email});
        if (result) {
            if (result.mdp === user.mdp) {
                console.log('Logged in user:', result);
                client.close();
                return result;
            }
        
            else {
                console.log('Incorrect email or password');
                client.close();
                return  "incorrect";
            }
        }
        else {
            console.log('Incorrect email or password');
            client.close();
            return "incorrect";
        }
    } catch (error) {
        console.error('Error logging in customer:', error);
        client.close();
        throw error;
    }

};