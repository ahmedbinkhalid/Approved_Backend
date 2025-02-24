const Community = require('../Models/community');
const User = require('../Models/user');
const communityChat = require("../Models/communityChat");
// Create a new community (Admin only)
exports.createCommunity = async (req, res) => {
  try {
    const { name, description } = req.body;
    const adminId = req.user.id;
    const image = req.file ? req.file.location : "defaultCommunityPic.jpg";

    const existingCommunity = await Community.findOne({ name });
    if (existingCommunity) {
      return res.status(400).json({ message: "Community name already exists" });
    }

    const newCommunity = new Community({ name, description, image, admin: adminId });
    await newCommunity.save();
    res.status(201).json({message: "Cummnity Created Successfully"});
  } catch (error) {
    console.error("Error creating community:", error);
    res.status(500).json({ message: "Failed to create community" });
  }
};

// Get all communities created by admin
exports.getAdminCommunities = async (req, res) => {
    try {
      const adminId = req.user.id;
      const communities = await Community.find({ admin: adminId }).sort({createdAt: -1});
      res.status(200).json(communities);
    } catch (error) {
      console.error("Error fetching admin communities:", error);
      res.status(500).json({ message: "Failed to fetch communities" });
    }
  };

// Get all communities (user side)

exports.getAllCommunities = async (req, res, next)=>{
  try{
    const communities = await Community.find().populate("admin", "userName").sort({createdAt: -1});
    res.status(200).json(communities);
  } catch(error){
    console.error("Error fetching communities:", error);
    res.status(500).json({ message: "Failed to fetch communities" });
  }
};

// // Join a community 

// exports.joinCommunity = async (req, res, next) => {
//   try {
//     console.log("Join Community : " , req.body);
//     const userId = req.user.id;
//     const userName = req.user.userName ; // Fallback name
//     const profilePicture = req.user.profilePicture ; // Fallback image
//     const { communityId } = req.body;

//     if (!userId) {
//       return res.status(401).json({ message: "Unauthorized: User ID is missing" });
//     }

//     const community = await Community.findById(communityId);
//     if (!community) {
//       return res.status(404).json({ message: "Community not found" });
//     }

//     // Check if user already exists in the community
//     if (community.members.some(member => member?.userId?.toString() === userId.toString())) {
//       return res.status(400).json({ message: "You are already a member of this community" });
//     }

//     // Add user to members array as an object
//     community.members.push({ userId, userName, profilePicture });
//     await community.save();

//     // Add community to user's joined communities
//     await User.findByIdAndUpdate(userId, { $addToSet: { joinedCommunities: communityId } });

//     res.status(200).json({ message: "Joined community successfully" });
//   } catch (error) {
//     console.error("Error joining community:", error);
//     res.status(500).json({ message: "Failed to join community" });
//   }
// };

// Join a community
exports.joinCommunity = async (req, res) => {
  try {
      console.log("Join Community:", req.body);

      if (!req.user) {
          return res.status(401).json({ message: "Unauthorized: User not authenticated" });
      }

      const userId = req.user.id;
      const userName = req.user.userName; 
      const profilePicture = req.user.profilePicture; 
      const { communityId } = req.body;

      const community = await Community.findById(communityId);
      if (!community) {
          return res.status(404).json({ message: "Community not found" });
      }

      // Check if user already exists in the community
      if (community.members.some(member => member.userId.toString() === userId.toString())) {
          return res.status(400).json({ message: "You are already a member of this community" });
      }

      // Add user to members array if not already present
      community.members.push({ userId, userName, profilePicture });
      await community.save();

      // Add community to user's joined communities
      await User.findByIdAndUpdate(userId, { $addToSet: { joinedCommunities: communityId } });

      res.status(200).json({ message: "Joined community successfully" });
  } catch (error) {
      console.error("Error joining community:", error);
      res.status(500).json({ message: "Failed to join community" });
  }
};

// Get all communities user has joined

exports.getUserCommunities = async (req, res, next)=>{
  try{
    const user = await User.findById(req.user.id).populate("joinedCommunities").sort({createdAt: -1});
    res.status(200).json(user.joinedCommunities);
  } catch( error){
    console.error("Error fetching user communities:", error);
    res.status(500).json({ message: "Failed to fetch communities" });
  }
};

// // Leave a community
// exports.leaveCommunity = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { communityId } = req.body;
//     console.log("User Id : ", userId);
//     console.log("Community Id : ", communityId);

//     const community = await Community.findById(communityId);
//     if (!community) return res.status(404).json({ message: "Community not found" });

//     if (!community.members.includes(userId)) {
//       return res.status(400).json({ message: "Not a member" });
//     }

//     community.members = community.members.filter(member => member.toString() !== userId);
//     await community.save();

//     await User.findByIdAndUpdate(userId, { $pull: { joinedCommunities: communityId } });

//     res.status(200).json({ message: "Left community successfully" });
//   } catch (error) {
//     console.error("Error leaving community:", error);
//     res.status(500).json({ message: "Failed to leave community" });
//   }
// };

// Leave a community
exports.leaveCommunity = async (req, res) => {
  try {
      if (!req.user) {
          return res.status(401).json({ message: "Unauthorized: User not authenticated" });
      }

      const userId = req.user.id;
      const { communityId } = req.body;

      console.log("User Id:", userId);
      console.log("Community Id:", communityId);

      const community = await Community.findById(communityId);
      if (!community) {
          return res.status(404).json({ message: "Community not found" });
      }

      // Check if the user is a member
      if (!community.members.some(member => member.userId.toString() === userId.toString())) {
          return res.status(400).json({ message: "Not a member" });
      }

      // Remove user from the community members list
      community.members = community.members.filter(member => member.userId.toString() !== userId.toString());
      await community.save();

      // Remove community from user's joinedCommunities list
      await User.findByIdAndUpdate(userId, { $pull: { joinedCommunities: communityId } });

      res.status(200).json({ message: "Left community successfully" });
  } catch (error) {
      console.error("Error leaving community:", error);
      res.status(500).json({ message: "Failed to leave community" });
  }
};


// Get messages from a community
exports.getCommunityMessages = async (req, res) => {
  try {
    const { communityId } = req.params;

    const messages = await communityChat.find({ receiverId: communityId })
      .populate("senderId", "userName profilePicture")
      .sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};