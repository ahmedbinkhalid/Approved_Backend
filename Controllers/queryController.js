const queryModle = require('../Models/queryModel');

exports.postQuery = async (req, res, next) =>{
    const {title, content, minPrice, maxPrice,email, phoneNumber,make, model, enginecapacity, transmission, color, fromYear, toYear} = req.body;
    try{
        const db = req.app.locals.db;
        const querydata = {
            title,
            content,
            minPrice,
            maxPrice,
            phoneNumber,
            email,
            make, 
            model, 
            enginecapacity, 
            transmission, 
            color, 
            fromYear, 
            toYear
        };
        const newQuery = await queryModle.addQurey(db,querydata)
        res.status(200).json({message: '✅ Query Submitted Successfuly, The Showroom will contact you soon!', queryId: newQuery.insertedId});


    }catch(error){
        console.error('Error While submitting query', error);
        res.status(500).json({error:'Server Error'});

    }
};

exports.getQuery = async (req, res, next)=>{
    try{
        const db = req.app.locals.db;
        const queries = await queryModle.getQuery(db);
        res.status(200).json(queries);
    } catch(error){
        console.error('Error While fetching queries', error);
        res.status(500).json({error: 'Server error'});
    }
};

exports.getQueryById = async (req, res, next) =>{
    try{
        const db = req.app.locals.db;
        const queryId = req.params.id;
        const result = await queryModle.getQuerryById(db, queryId);
        res.status(200).json(result);
    } catch(error){
        console.error('Error while fetching Query', error);
        res.status(500).json({error: 'Server Error'});
    };
};

exports.dellQuery = async (req, res, next)=>{
    try{
        const db = req.app.locals.db;
        const queryId = req.params.id;
        await queryModle.dellQuery(db, queryId);
        res.status(200).json({message: 'Query Deleted Successfully'});
    } catch(error){
        console.error('Error while deleting Query', error);
    }
}

exports.postConact = async (req, res, next) =>{
    const {name, email, phoneNumber, subject, message} = req.body;
    try{
        const db = req.app.locals.db;
        const result = await queryModle.contactUs(db,{ name, email, phoneNumber, subject,message});
        res.status(200).json({message: '✅ Submitted Successfuly, The Showroom will contact you soon!', conId: result.insertedId});


    }catch(error){
        console.error('Error While submitting', error);
        res.status(500).json({error:'Server Error'});

    }
}

exports.getContact = async (req, res, next)=>{
    try{
        const db = req.app.locals.db;
        const contact = await queryModle.getContact(db);
        res.status(200).json(contact);
    } catch(error){
        console.error('Error While fetching Messages', error);
        res.status(500).json({error: 'Server error'});
    }
};

exports.getConById = async (req, res, next) =>{
    try{
        const db = req.app.locals.db;
        const conId = req.params.id;
        const result = await queryModle.getContactById(db, conId);
        res.status(200).json(result);
    } catch(error){
        console.error('Error while fetching Messages', error);
        res.status(500).json({error: 'Server Error'});
    };
};

// Backend Controller (queryController.js)
const { ObjectId } = require('mongodb');
const { dellMessage } = require('../Models/queryModel');

exports.dellMessage = async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  try {
    const result = await dellMessage(id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};
