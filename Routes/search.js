const express = require('express');
const router = express.Router();
const search = require("../Controllers/searchFilters");
const { authMiddleware } = require('../Middlewares/middleware');


// For User side
router.get("/search", authMiddleware, search.getUserSearch);

module.exports = router;