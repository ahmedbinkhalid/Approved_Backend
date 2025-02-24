const express = require("express");
const { upload } = require("../config/s3");

const community = require("../Controllers/communityController");

const router = express.Router();
const {authMiddleware}= require('../Middlewares/middleware');
// For Admin
router.post("/create", authMiddleware, upload.single("image"), community.createCommunity);
router.get("/admin-communities", authMiddleware, community.getAdminCommunities);

// For Students
router.get("/get-communities", authMiddleware, community.getAllCommunities);
router.post("/join-community", authMiddleware, community.joinCommunity);
router.get("/get-userCommunities", authMiddleware, community.getUserCommunities);
router.post("/leave-community", authMiddleware, community.leaveCommunity);
router.get("/get-messages/:communityId", authMiddleware, community.getCommunityMessages);
module.exports = router;