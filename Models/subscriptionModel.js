const MongoDB = require('mongodb');

exports.addSubscriber = async (db, email)=>{
    try{
        const collection = await db.collection('subscribers');
        const result = await collection.insertOne({email});
        return(result);
    } catch(error){
        throw new Error('Error adding subscriber', error.message);

    };
};

exports.getSubscriber = async (db)=>{
    try{
        const collection = await db.collection('subscribers');
        const subscribers = await collection.find({}).toArray();
        return(subscribers).map(sub => sub.email);
    } catch(error){
        throw new Error('Error getting subscriber', error.message);
    };
};