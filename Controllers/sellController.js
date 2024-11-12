const sellModel = require('../Models/sellModel');
const { ObjectId } = require('mongodb');
const path = require('path');
const fs = require('fs');
const subsController = require('./subsController');
const cloudinary = require('../util/cloudinary');

exports.addCar = async (req, res, next) => {
    const OwnerId = req.user.id;
    console.log(req.body);
    console.log(req.files); 

    try {
        const db = req.app.locals.db;
        // Ensure that req.body.images exists and is an array
        if (!req.body.images || !Array.isArray(req.body.images)) {
            return res.status(400).json({ message: "No images provided or invalid format." });
        }

        const base64Images = req.body.images;
        const images = [];

        for (let i = 0; i < base64Images.length; i++) {
            const base64Data = base64Images[i];
            const matches = base64Data.match(/^data:image\/(\w+);base64,/);

            if (!matches) {
                return res.status(400).json({ message: "Invalid image format." });
            }

            const imageData = base64Data.replace(/^data:image\/\w+;base64,/, '');

            // Upload image to Cloudinary
            const uploadResponse = await cloudinary.uploader.upload(`data:image/jpeg;base64,${imageData}`, {
                folder: 'car_images', // Optional: Set a folder name on Cloudinary
                public_id: `car_image_${Date.now()}_${i}`, // Optional: Set custom public ID
                resource_type: 'image',
            });

            images.push(uploadResponse.secure_url); // Push the image URL
        }

        const carData = {
            owner: OwnerId,
            phoneNumber: '03404232435',
            make: req.body.make,
            model: req.body.model,
            year: req.body.year,
            price: req.body.price,
            mileage: req.body.mileage,
            condition: req.body.condition,
            transmission: req.body.transmission,
            engineType: req.body.engineType,
            engineCapacity: req.body.engineCapacity,
            color: req.body.color,
            location: req.body.location,
            description: req.body.description,
            images: images,
            sellerInfo: req.body.sellerInfo,
            dateAdded: new Date(),
            status: req.body.status
        };

        const result = await sellModel.addCar(db, carData);
        res.status(200).json({ message: 'Car added for sale successfully', carId: result.insertedId });

        await subsController.sendEmailsToSubscribers(db, carData);

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Edit car data

exports.updateCar = async (req, res, next)=>{
    const carId = req.params.id;
    const OwnerId = req.user.id;
    try{
        const db = req.app.locals.db;
        const car = await sellModel.getCarById(db, carId);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        if (car.Owner !== OwnerId) {
            return res.status(403).json({ message: 'You are not allowed to edit this car' });
        }

        const updatedData = {
            make: req.body.make || car.make,
            model: req.body.model || car.model,
            year: req.body.year || car.year,
            price: req.body.price || car.price,
            mileage: req.body.mileage || car.mileage,
            condition: req.body.condition || car.condition,
            transmission: req.body.transmission || car.transmission,
            engineType: req.body.engineType || car.engineType,
            engineCapacity: req.body.engineCapacity || car.engineCapacity,
            color: req.body.color || car.color,
            location: req.body.location || car.location,
            description: req.body.description || car.description,
            sellerInfo: req.body.sellerInfo || car.sellerInfo,
        };

        await sellModel.updateCar(db, carId, updatedData);
        res.status(200).json({ message: 'Car updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// To delte car by id by user
exports.deleteCar = async (req, res, next)=>{
    const carId = req.params.id;
    const db = req.app.locals.db;
    try{
        const car = await sellModel.getCarById(db, carId);

    if(!car){
        return res.status(404).json({message: 'Car not found'});
    }
    await sellModel.deleteCar(db, carId);
    res.status(200).json({message: 'Car deleted successfuly'});
    } catch(error){
        console.error("Error:", error); // Log the error
        res.status(500).json({ message: error.message });
    }
}

// To get User cars
exports.getUserCars = async (req, res, next)=>{
    const owner = req.user.id;
    try{
        const db = req.app.locals.db;
        const cars = await sellModel.getCarsByOwnerId(db, owner);
        res.status(200).json(cars);
    } catch(error){
        res.status(500).json({message: error.message});
    }
}
exports.newCars = async (req, res, next)=>{
    try{
        const db = req. app.locals.db;
        // Ensure that req.body.images exists and is an array
        if (!req.body.images || !Array.isArray(req.body.images)) {
            return res.status(400).json({ message: "No images provided or invalid format." });
        }

        const base64Images = req.body.images;
        const images = [];

        for (let i = 0; i < base64Images.length; i++) {
            const base64Data = base64Images[i];
            const matches = base64Data.match(/^data:image\/(\w+);base64,/);

            if (!matches) {
                return res.status(400).json({ message: "Invalid image format." });
            }

            const imageData = base64Data.replace(/^data:image\/\w+;base64,/, '');

            // Upload image to Cloudinary
            const uploadResponse = await cloudinary.uploader.upload(`data:image/jpeg;base64,${imageData}`, {
                folder: 'car_images', // Optional: Set a folder name on Cloudinary
                public_id: `car_image_${Date.now()}_${i}`, // Optional: Set custom public ID
                resource_type: 'image',
            });

            images.push(uploadResponse.secure_url); // Push the image URL
        }
        const carData = {
            PhoneNumber : '03409889631',
            make : req.body.make,
            model : req.body.model,
            releasedDate : req.body.releasedDate,
            transmission: req.body.transmission,
            engineType: req.body.engineType,
            engineCapacity: req.body.engineCapacity,
            availableColors: req.body.availableColor,
            location: req.body.location,
            description: req.body.description,
            images: images,
            dateAdded : new Date(),
            startingPrice: req.body.startingPrice,
            maxPrice: req.body.maxPrice
        }
        const result = await sellModel.newCars(db, carData);
        
        res.status(200).json({message: 'Car added for sale successfuly', carId: result.instertedId});
        await subsController.sendEmailsToSubscribers(db, carData);
    }catch(error){
        console.error("Error:", error); // Log the error
        res.status(500).json({ message: error.message });
};
};

exports.getAllCars = async (req, res, next)=>{
    const db = req.app.locals.db;
    try{
        const cars = await sellModel.getAllCars(db);
        res.status(200).json(cars);
    }catch(error){
        res.status(500).json({message: error.message});
    };
};

// get all new cars
exports.getNewCars = async (req, res, next)=>{
    const db = req.app.locals.db;
    try{
        const newCars = await sellModel.getNewCars(db);
        res.status(200).json(newCars);
    } catch(error){
        res.status(500).json({message: error.message});
    };
};
// get new Cars by id
exports.getNewCarById = async (req, res, next)=>{
    const db = req.app.locals.db;
    try{
        carId = req.params.id;
        const cars = await sellModel.getNewCarsById(db, carId);
        if(!cars){
            res.status(404).json({message: 'Car not found'});
        }else{
            res.status(200).json(cars);
        }
    } catch(error){
        res.status(500).json({message: error.message});
    };
};

exports.getCarById = async (req, res, next)=>{
    const db = req.app.locals.db;
    try{
        const carId = req.params.id;
        const car = await sellModel.getCarById(db, carId);
        if(!car){
            res.status(404).json({message: 'Car not found'});
        }else{
            res.status(200).json(car);
        }
    }catch(error){
        res.status(500).json({message: error.message});
    }           
};

exports.getBankCars = async (req, res, next)=>{
    try{
        const db = req.app.locals.db;
        const bankCars = await sellModel.getBankCars(db);
        res.status(200).json(bankCars);
    } catch(error){
        console.error('Error during getting bank cars', error);
        res.status(500).json({error:'Server error'});
    };
};

exports.getUsedCars = async (req, res, next)=>{
    try{
        const db = req.app.locals.db;
        const usedCars = await sellModel.getUsedCars(db);
        res.status(200).json(usedCars);
    } catch(error){
        console.error('Error while gettting used cars', error);
        res.status(500).json({error: 'Server error'});
    }
}

exports.SearchCars = async (req, res, next)=>{
    const SearchKey = req.params.key;
    try{
        const db = req.app.locals.db;
        const results = await sellModel.SearchCars(db, SearchKey);
        res.status(200).json({message: 'Search results', cars: results});
    } catch(error){
        res.status(500).json({ message: error.message });
    }

};