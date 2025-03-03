const Community = require('../Models/community');
const User = require('../Models/user');
const communityChat = require("../Models/communityChat");

exports.createCommunity = async (req, res) => {
  try {
    const { name, description } = req.body;
    const adminId = req.user.id;
    const userName = req.user.userName;
    const profilePicture = req.user.profilePicture;
    const image = req.file ? req.file.location : "defaultCommunityPic.jpg";

    // Check if community with the same name exists
    const existingCommunity = await Community.findOne({ name });
    if (existingCommunity) {
      return res.status(400).json({ message: "Community name already exists" });
    }

    // Create new community with admin as a member
    const newCommunity = new Community({ 
      name, 
      description, 
      image, 
      admin: adminId,
      members: [{ userId: adminId, userName, profilePicture }] // Automatically add admin as member
    });

    await newCommunity.save();

    // Add community to the user's joined communities
    await User.findByIdAndUpdate(adminId, { 
      $addToSet: { joinedCommunities: newCommunity._id }
    });

    res.status(201).json({ message: "Community Created Successfully and Admin Joined Automatically" });
  } catch (error) {
    console.error("Error creating community:", error);
    res.status(500).json({ message: "Failed to create community" });
  }
};

exports.deleteCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const adminId = req.user.id;

    // Find the community
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // // Check if the requester is the admin
    // if (community.admin.toString() !== adminId) {
    //   return res.status(403).json({ message: "Unauthorized: Only the community admin can delete this community" });
    // }

    // Remove community from all members' joinedCommunities
    await User.updateMany(
      { joinedCommunities: communityId },
      { $pull: { joinedCommunities: communityId } }
    );

    // Delete all chat messages related to this community
    await communityChat.deleteMany({ communityId });

    // Delete the community
    await Community.findByIdAndDelete(communityId);

    res.status(200).json({ message: "Community deleted successfully" });
  } catch (error) {
    console.error("Error deleting community:", error);
    res.status(500).json({ message: "Failed to delete community" });
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

// Leave a community
exports.leaveCommunity = async (req, res) => {
  try {
      if (!req.user) {
          return res.status(401).json({ message: "Unauthorized: User not authenticated" });
      }

      const userId = req.user.id;
      const { communityId } = req.body;

   

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

    const messages = await communityChat
      .find({ communityId }) // Fixed incorrect field
      .populate("senderId", "userName profilePicture")
      .sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};


// Send message to community
exports.sendMessageToCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { message } = req.body;
    const senderId = req.user.id;

    // Validate input
    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    // Check if community exists
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Check if sender is a member of the community
    const isMember = community.members.some(member => member.userId.toString() === senderId);
    if (!isMember) {
      return res.status(403).json({ message: "You must be a member of this community to send messages" });
    }

    // Save message
    const newMessage = new communityChat({
      communityId,
      senderId,
      senderName: req.user.userName,
      message
    });

    await newMessage.save();

    // Emit real-time event via WebSockets (if using Socket.io)
    if (req.io) {
      req.io.to(communityId.toString()).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

