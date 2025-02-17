
const Chat = require("../Models/chat"); // Import Chat model

// Save a new chat message (used in both API and Socket.IO)
exports.saveMessage = async (senderId, receiverId, message) => {
  try {
    const newChat = new Chat({ senderId, receiverId, message });
    await newChat.save();
    return newChat;
  } catch (error) {
    console.error("Error saving message:", error);
    return null;
  }
};

// Get chat history between two users
exports.getChatHistory = async (req, res) => {
  const { friendId } = req.params;
  const userId = req.user.id;
  try {
    const chats = await Chat.find({
      $or: [
        { senderId: userId, receiverId: friendId },
        { senderId: friendId, receiverId: userId },
      ],
    }).sort({ timestamp: 1 });

    res.status(200).json(chats);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ message: "Failed to fetch chat history" });
  }
};
