const express = require('express');
const router = express.Router();
const profileController = require('../Controllers/profileController');
const {authMiddleware} = require('../Middlewares/middleware')  // Import the multer middleware
const {s3, upload} = require('../config/s3');
// Route to get user settings (username, email, profile picture)
router.get('/settings', authMiddleware,profileController.getUserSettings);

// Route to update profile picture (only in settings)
router.post('/updateProfilePicture', authMiddleware, upload.single('profilePicture'), profileController.saveProfilePicture);

// Route to change password
router.post('/changePassword', authMiddleware,profileController.changePassword);

module.exports = router;