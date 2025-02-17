const express = require('express');
const router = express.Router();
const adminController = require('../Controllers/adminController');
const {authMiddleware}= require('../Middlewares/middleware')
const {s3,upload} = require('../config/s3'); // Import S3 upload middleware
// User Management
router.get('/users', authMiddleware ,adminController.getAllUsers);  // View all users
router.get('/users/players', authMiddleware ,adminController.getAllPlayers); // View only playersu 
router.get('/users/coaches', authMiddleware,adminController.getAllCoaches); // View only coaches
router.get('/users/active', authMiddleware,adminController.getActiveUsers); // View unblocked users
router.get('/users/blocked', authMiddleware,adminController.getBlockedUsers); // View blocked users
router.put('/users/:userId/block', authMiddleware,adminController.blockUser); // Block user
router.put('/users/:userId/unblock', authMiddleware,adminController.unblockUser); // Unblock user

// Coach & Player Details
router.get('/coach/:coachId', authMiddleware,adminController.getCoachDetails); // Get coach details
router.get('/player/:playerId', authMiddleware,adminController.getPlayerDetails); // Get player details


// Sponsorship Management //  Tier System
router.post('/sponsorship', authMiddleware, upload.single('image'), adminController.uploadSponsorshipTier);
router.get('/get-sponsorship', authMiddleware, adminController.getSponsorshipTiers);
// Delete Sponsorship by ID
router.delete('/delete-sponsorship/:id', authMiddleware, adminController.deleteSponsorship);

// Advertisement Management // Banner Add
router.post('/advertisement', authMiddleware, upload.single('image'), adminController.uploadAdvertisement);
router.get('/get-advertisement', authMiddleware, adminController.getAdvertisements); // for user
router.get('/get-coachAdvertisement', authMiddleware, adminController.getAdvertisementsCoach); // for coach
// Delete Advertisement by ID (Only from Database)
router.delete('/delete-advertisement/:id',authMiddleware ,adminController.deleteAdvertisement);

// get Profile data

router.get('/get-profile', authMiddleware, adminController.getAdminProfile);

module.exports = router;
