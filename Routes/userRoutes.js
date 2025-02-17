const express = require('express');
const router = express.Router();
const userController = require('../Controllers/authController');
const {upload, authMiddleware} = require('../Middlewares/middleware')  // Import the multer middleware

// Routes for signup, login, etc.
router.post('/signup', userController.signUp);
router.post('/login', userController.login);
router.post('/forgetPassword', userController.forgetPassword);
router.post('/reset', userController.resetPassword);



router.get('/all-users', userController.getAllUsers);



module.exports = router;
