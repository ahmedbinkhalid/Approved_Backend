const express = require('express');
const visitorController = require('../Controllers/visitorController');
const { model } = require('mongoose');
const { verifyToken } = require('../Middlewares/middleware');

const router = express.Router();

router.use(visitorController.logVisitor);

//  Route to get daily visitors count (for admin)
 router.get('/daily', (req, res) => visitorController.getDailyVisitors(req, res));

 // Route to get live visitors count (for admin)
 router.get('/live', (req, res) => visitorController.getLiveVisitors(req, res));

 // Route to get weekly visitors count (for admin)
 router.get('/weekly', (req, res) => visitorController.getWeeklyVisitors(req, res));

 // Route to get monthly visitors count (for admin)
 router.get('/monthly', (req, res) => visitorController.getMonthlyVisitors(req, res));
 


module.exports = router;