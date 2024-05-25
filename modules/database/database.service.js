const { MongoClient } = require('mongodb');
const mongodb = require('mongodb')
const { mongo } = require('mongoose');
var dbServices = require('./database.service');

async function connectToDatabase() {
    try {
        const client = await MongoClient.connect("mongodb+srv://tandriatoavina:<password>@tiancluster.1h72rz3.mongodb.net/?retryWrites=true&w=majority&appName=TianCluster", {
            useUnifiedTopology: true
        });
        const db = client.db('gestion_argent');
        console.log('Connected to Database');
        return { client, db};
    } catch (error) {
        console.error('Error connecting to the database:', error);
        throw error;
    }
}

exports.connectToDatabase = connectToDatabase;