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

exports.insertUser = async (user) => {
    const {db, client} = await dbServices.connectToDatabase();
    const collection = db.collection('users');
   try {
     const result = await collection.insertOne(user);
     console.log('Inserted user:', result);
     client.close();
     return result.ops[0];
   } catch (error) {
        console.error('Error inserting customer:', error);
        return { error: error };
   }
    
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