const express = require('express');
const router = express.Router();
const sponsorshipController = require('../Controllers/sponsorshipController');
const {authMiddleware}= require('../Middlewares/middleware');

router.get('/get-sponsors', authMiddleware, sponsorshipController.getSponsorshipTiers);
router.get("/get-sponsorship/:id", sponsorshipController.getSponsorshipTierById); //for detailed view

router.post("/send-request", authMiddleware, sponsorshipController.sendSponsorshipRequest);
router.get("/get-allRequests", authMiddleware, sponsorshipController.getAllSponsorshipRequests); // for admin to get all requests
router.put("/update-read-status/:requestId", authMiddleware, sponsorshipController.updateSponsorshipRequestReadStatus);

module.exports = router;