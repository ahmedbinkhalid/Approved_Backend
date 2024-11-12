const MongoDb = require('mongodb');

exports.addQurey = async (db, queryData)=>{
    const {title, content, minPrice, maxPrice, phoneNumber, make, model, enginecapacity, transmission, color, fromYear, toYear} = queryData;
    
    const result = await db.collection('quries').insertOne(queryData);
    return result;
};

exports.getQuery = async (db)=>{
    const result = await db.collection('quries').find({}).toArray();
    return result;
}

exports.dellQuery = async (db, queryId)=>{
    const result = await db.collection('quries').deleteOne({_id: new MongoDb.ObjectId(queryId)})
    return result;
}

exports.getQuerryById = async (db, queryId)=>{
    const result = await db.collection('quries').findOne({_id: new MongoDb.ObjectId(queryId)});
    return result;
};

exports.contactUs = async (db, conData)=>{
    const {name, email, phoneNumber,subject, message} = conData;
    const contact = {
        name,
        email,
        phoneNumber,
        subject,
        message,
    }
    const result = await db.collection('contact-us').insertOne(contact);
    return result;
}

exports.getContact = async (db)=>{
    const result = await db.collection('contact-us').find({}).toArray();
    return result;
}

exports.getContactById = async (db, conId)=>{
    const result = await db.collection('contact-us').findOne({_id: new MongoDb.ObjectId(conId)});
    return result;
}

// Backend Model (queryModel.js)
const { ObjectId } = require('mongodb');

exports.dellMessage = async (id) => {
  const collection = db.collection('contact-us');
  return await collection.deleteOne({ _id: new ObjectId(id) });
};
