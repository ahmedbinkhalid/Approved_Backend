const { query } = require('express');
const MongoDB = require('mongodb');
const Fuse = require('fuse.js');

exports.addCar = async (db, carData)=>{
    try{
        const collection = db.collection('cars');
        const result = await collection.insertOne(carData);
        return result;
        
    } catch(error){
        throw new Error('Error during adding car', error.message);
    };
};

// To add new cars for sale by admin

exports.newCars = async (db, carData)=>{
    try{
        const collection = db.collection('newCars');
        const result = await collection.insertOne(carData);
        return result;
    } catch(error){
        throw new Error('Error during adding new car', error.message);
    };
};

exports.getAllCars = async (db) =>{
    try{
        const collection = await db.collection('cars');
        const result = await collection.find({}).toArray();
        return result;
    } catch(error){
        throw new Error('Error retrieving cars: ', error.message);
    };
};

// get cars by owner id (user can see what they have posted)
exports.getCarsByOwnerId = async (db, owner)=>{
    try{
        const collection = db.collection('cars');
        const result = await collection.find({owner: owner}).toArray();
        return result;
    } catch (error){
        throw new Error('Error retrieving cars by owner id: ', error.message);
    }
};
// Get delete cars by carId 
exports.deleteCar = async (db, carId)=>{
    try{
        const collection = db.collection('cars');
        await collection.deleteOne({_id: new MongoDB.ObjectId(carId)})
    } catch (error){
        throw new Error('Error deleteing car: ' + error.message);
    }
}

// Update Cars uploaded by users
exports.updateCar = async (db, carId, updatedData)=>{
    try{
        const collection = db.collection('cars');
        const result = await collection.updateOne({_id: new MongoDB.ObjectId(carId)}, {$set: updatedData });
        return result;
    } catch (error){
        throw new Error('Error updating car: ' + error.message);
    }
};
// get all new cars

exports.getNewCars = async (db)=>{
    try{
        const collection = await db.collection('newCars');
        const result = await collection.find({}).toArray();
        return result;
    } catch (error){
        throw new Error('Error retrieving new cars: ', error.message);
    };
};

// get new cars by id

exports.getNewCarsById = async (db, carId)=>{
    try{
        const collection = await db.collection('newCars');
        const result = await collection.findOne({_id: new MongoDB.ObjectId(carId)});
        return result;
    } catch(error){
        console.log(error.message);
        throw new Error('Error retrieving new car by id: ', error.message);
    }
};
const { ObjectId } = require('mongodb');

exports.getCarById = async (db, id) => {
    try {
        const collectionCars = db.collection('cars');
        const collectionNewCars = db.collection('newCars');
        
        // Convert carId to ObjectId
        const objectId = new ObjectId(id);
        
        // First, try to find in the 'cars' collection
        let result = await collectionCars.findOne({ _id: objectId });
        
        // If not found in 'cars', try 'newCars' collection
        if (!result) {
            result = await collectionNewCars.findOne({ _id: objectId });
        }
        
        return result; // Will return null if not found in both collections
    } catch (error) {
        console.log(error.message);
        throw new Error(`Error retrieving car by Id: ${error.message}`);
    }
};

// get cars by type (Bank released)

exports.getBankCars = async (db)=>{
    const result = await db.collection('cars').find({status: 'Bank'}).toArray();
    return result;
}

// get cars by type (Used released)

exports.getUsedCars = async(db)=>{
    const result = await db.collection('cars').find({status:'Used'}).toArray();
    return result;
};
// Can delete after trying

exports.SearchCars = async (db, key) => {
    try {
        const collection = db.collection('cars');
        const newCarsCollection = db.collection('newCars');
        
        if (!key || key.trim() === '') {
            return { message: 'Kindly type something to search related cars.' };
        }
        
        // Step 1: Fetch all car data from both collections
        const [cars, newCars] = await Promise.all([
            collection.find({}).toArray(),
            newCarsCollection.find({}).toArray(),
        ]);

        // Step 2: Normalize data
        const normalizeCarData = car => {
            return {
                make: car.make || '',           // Default to empty string if the field is missing
                model: car.model || '',
                year: car.year || '',
                price: car.price || 0,          // Default to 0 for numbers
                mileage: car.mileage || 0,
                color: car.color || '',
                description: car.description || '',
                location: car.location || '',
                // availableColors: car.availableColors || [],  // Default to empty array
                availableColors: Array.isArray(car.availableColors)
            ? car.availableColors
            : (typeof car.availableColors === 'string' ? [car.availableColors] : []),
                // Add other fields as necessary
            };
        };

        const combinedCars = [
            ...cars.map(normalizeCarData),
            ...newCars.map(normalizeCarData)
        ];

        if (combinedCars.length === 0) {
            return { message: 'No cars found.' };
        }

        // Step 3: Set up Fuse.js options
        const options = {
            keys: ['make', 'model', 'year', 'price', 'mileage', 'color', 'description', 'location', 'availableColors'],
            threshold: 0.3, // Adjust threshold for fuzzy matching (0.0 = exact match, 1.0 = no match)
        };

        // Step 4: Create a Fuse instance
        const fuse = new Fuse(combinedCars, options);

        // Step 5: Use Fuse.js to search for the key
        const fuzzyResults = fuse.search(key);

        // Step 6: Extract the matched items from Fuse.js results
        const result = fuzzyResults.map(result => result.item);

        if (result.length === 0) {
            return { message: 'No cars matched your search.' };
        }

        return result;

    } catch (error) {
        throw new Error('Error during searching cars: ' + error.message);
    }
};