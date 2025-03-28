const express = require('express');
const router = express.Router();
const socialLinksController = require('../Controllers/socialLinksController');
const {authMiddleware}= require('../Middlewares/middleware');
// Route to add/update platform-wide social links
router.put('/social-links', authMiddleware,socialLinksController.upsertSocialLinks);

// Route to get platform-wide social links
router.get('/social-links', socialLinksController.getSocialLinks);

module.exports = router;
