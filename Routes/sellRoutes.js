const express = require('express');
const router = express.Router();
const sellController = require('../Controllers/sellController');
const {isUser, verifyToken, isAdmin, checkAdminOrUserRole} = require('../Middlewares/middleware');
const multer = require('multer');
const path = require('path');


// User Route to post Ad for selling car
router.post('/addcars', verifyToken, checkAdminOrUserRole, sellController.addCar);

// Route to get all new cars
router.get('/newcars', sellController.getNewCars);

// Route to get new car by Id
router.get('/newcars/:id', sellController.getNewCarById);

// Admin Route to add new car for sale
router.post('/postcar', sellController.newCars);

// Route to get all cars (used and bankreleased)
router.get('/getcars', sellController.getAllCars);

// Route to get car by id
router.get('/getCarById/:id', sellController.getCarById);

// Route to only get used cars
router.get('/usedcars', sellController.getUsedCars);

// Route to only get bank released cars
router.get('/bankcars', sellController.getBankCars);

// Route for search bar
router.get('/searchcars/:key', sellController.SearchCars);

// User Route to get Ads posted by user for selling car
router.get('/usercars', verifyToken, isUser, sellController.getUserCars);

// User route to delete car Ad
router.delete('/deletecar/:id', verifyToken, isUser, sellController.deleteCar);

// User route to update Car Ad
router.put('/updatecar/:id', verifyToken, isUser, sellController.updateCar);

module.exports = router;