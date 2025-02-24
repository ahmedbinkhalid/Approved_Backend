const express = require('express');
const router = express.Router();
const contactController = require('../Controllers/contactController');
const { authMiddleware } = require("../Middlewares/middleware"); // Middleware for authentication

router.post('/submit', authMiddleware, contactController.submitQuery);
router.get('/admin/queries', authMiddleware, contactController.getAllQueries);
router.post('/admin/reply/:queryId', authMiddleware, contactController.replyToQuery);
router.get('/coach/queries', authMiddleware, contactController.getCoachQueries);

module.exports = router;
