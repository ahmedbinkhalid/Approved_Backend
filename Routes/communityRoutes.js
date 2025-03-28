const express = require("express");
const { upload } = require("../config/s3");

const community = require("../Controllers/communityController");

const router = express.Router();
const {authMiddleware}= require('../Middlewares/middleware');
// For Admin
router.post("/create", authMiddleware, upload.single("image"), community.createCommunity);
router.get("/admin-communities", authMiddleware, community.getAdminCommunities);
router.get("/admin-communities/:id", authMiddleware, community.getCommunityById);
router.put('/update-community/:communityId', authMiddleware, upload.single('image'), community.updateCommunity);

// For Students
router.get("/get-communities", authMiddleware, community.getAllCommunities);
router.post("/join-community", authMiddleware, community.joinCommunity);
router.get("/get-userCommunities", authMiddleware, community.getUserCommunities);
router.post("/leave-community", authMiddleware, community.leaveCommunity);
router.get("/get-messages/:communityId", authMiddleware, community.getCommunityMessages);
router.post("/send-message/:communityId", authMiddleware, community.sendMessageToCommunity);
router.delete("/delete-community/:communityId", authMiddleware, community.deleteCommunity);

module.exports = router;