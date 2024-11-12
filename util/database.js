const MongoDB = require("mongodb");
const MongoClient = MongoDB.MongoClient;
require('dotenv').config();

const MongoConnect = callback =>{
    MongoClient.connect(process.env.Mongo)
        .then(client =>{
        console.log("Connected to MongoDB", "PORT" ,process.env.PORT);
        global.db = client.db('myzameen'); 
        callback(client);
        })
        .catch(err =>{
        console.log(err);
        })
}

module.exports = MongoConnect;