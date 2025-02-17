const express = require('express');
const router = express.Router();
const sponsorshipController = require('../Controllers/sponsorshipController');
const {authMiddleware}= require('../Middlewares/middleware');

router.get('/get-sponsors', authMiddleware, sponsorshipController.getSponsorshipTiers);

module.exports = router;