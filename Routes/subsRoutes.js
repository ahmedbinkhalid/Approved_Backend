const express = require('express');
const router = express.Router();
const subsController = require('../Controllers/subsController');

router.post('/subscribe', subsController.addSubscriber);
// POST route for sending news to subscribers
router.post('/send-news', subsController.sendNewsToSubscribers);



module.exports = router;