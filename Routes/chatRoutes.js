const express = require('express');
const router = express.Router();

const {getChatHistory, sendMessage} = require('../Controllers/chatController');
const { authMiddleware } = require("../Middlewares/middleware");

// Get chat history
router.get("/:friendId", authMiddleware, getChatHistory);

module.exports = router;