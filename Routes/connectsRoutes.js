const express = require('express');
const router = express.Router();

const connectsController = require('../Controllers/connectsController');
const {authMiddleware}= require('../Middlewares/middleware')

router.post('/send-friend-request', authMiddleware, connectsController.sendFriendRequest);
router.post('/handle-friend-request', authMiddleware, connectsController.handleFriendRequest);
router.get('/friend-requests', authMiddleware, connectsController.viewFriendRequests);
router.get('/friends', authMiddleware, connectsController.viewFriends);

module.exports = router;