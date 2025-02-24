
const Chat = require("../Models/chat"); // Import Chat model

// Save a new chat message (used in both API and Socket.IO)
exports.saveMessage = async (data) => {
  try {
      const { senderId, receiverId, message } = data; // Ensure field names match schema

      if (!senderId || !receiverId || !message.trim()) {
          console.error("Invalid message data:", data);
          return { error: "Invalid message data" };
      }

      const newMessage = new Chat({ senderId, receiverId, message });
      await newMessage.save();

      console.log("Message successfully saved:", newMessage);
      return newMessage; // Return saved message to send back
  } catch (error) {
      console.error("Error saving message:", error);
      return { error: "Failed to save message" };
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
