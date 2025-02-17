// routes/coachRoutes.js

const express = require('express');
const router = express.Router();
const coachController = require('../Controllers/coachStatsController'); // Import the coach controller
const { authMiddleware } = require('../Middlewares/middleware'); // Assuming you have an auth middleware

// Get statistics for the logged-in coach
router.get('/statistics', authMiddleware, coachController.getCoachStatistics);
// Get a list of subscribers for the logged-in coach
router.get('/subscribers', authMiddleware, coachController.getSubscribersList);

module.exports = router;