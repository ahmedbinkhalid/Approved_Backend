const express = require('express');
const router = express.Router();
const advertisementController = require('../Controllers/advertisementController');
const { authMiddleware } = require('../Middlewares/middleware');
// Create an advertisement request
router.post('/request-advertisement', authMiddleware, advertisementController.createAdRequest);

// Get all advertisement requests
router.get('/advertisement-requests', authMiddleware, advertisementController.getAllAdRequests);
// update read status
router.put("/update-read-status/:requestId", authMiddleware, advertisementController.updateSponsorshipRequestReadStatus);

module.exports = router;
