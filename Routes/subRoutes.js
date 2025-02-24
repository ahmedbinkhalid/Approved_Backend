const express = require('express');
const router = express.Router();
const coachSubsController = require('../Controllers/coachSubsController');
const {upload, authMiddleware} = require('../Middlewares/middleware')  // Import the multer middleware




router.post('/subscribe', authMiddleware, coachSubsController.subscribeToCoach);

// Unsubscribe from a coach
router.post('/unsubscribe', authMiddleware, coachSubsController.unsubscribeFromCoach);

// Get list of subscribed coaches
router.get('/subscribed-coaches', authMiddleware, coachSubsController.getSubscribedCoaches);

// Get all coaches
router.get('/coaches', authMiddleware,coachSubsController.getAllCoaches);

module.exports = router;