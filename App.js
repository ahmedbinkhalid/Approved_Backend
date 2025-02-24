const express = require("express");
const http = require("http"); // For Socket.IO
const socketIo = require("socket.io");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const Community = require("./Models/community");
const communityChat = require("./Models/communityChat");
const Chat = require("./Models/chat");
const userRouter = require("./Routes/userRoutes");
const connections = require("./Routes/connectsRoutes");
const chatRouter = require("./Routes/chatRoutes");
const profileRouter = require('./Routes/profileRoutes');
const subRoutes = require('./Routes/subRoutes');
const { saveMessage } = require("./Controllers/chatController");
const gameRoutes = require('./Routes/gameRoutes');
const userCourse = require('./Routes/courses');
const coachStats = require('./Routes/statsRoutes');
const adminRoutes = require('./Routes/adminRoutes');
const userSponsorRoutes = require('./Routes/userSponsorRoutes');
const advertisementRoutes = require('./Routes/advertisementRoutes');
const communityRoutes = require("./Routes/communityRoutes");
const contactRoutes = require('./Routes/contactRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Store online users
const onlineUsers = new Map();


io.on("connection", (socket) => {
  console.log("A user connected");

  // Store user socket
  socket.on("join", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} connected`);
  });

  // Handle private messages
//   socket.on("sendMessage", async (data) => {
//     console.log("Received message data:", data); // Debugging

//     try {
//         const { senderId, receiverId, content } = data; // Fix: Extract 'content'
//         const message = content; // Fix: Assign 'content' to 'message'
        
//         if (!message || message.trim() === "") {
//             return socket.emit("errorMessage", { error: "Message content is required" });
//         }

//         const newMessage = new Chat({ senderId, receiverId, message }); // Use 'message'
//         await newMessage.save();

//         console.log("Message saved:", newMessage);

//         // Find receiver socket
//         const receiverSocketId = onlineUsers.get(receiverId);
//         if (receiverSocketId) {
//             io.to(receiverSocketId).emit("newMessage", newMessage);
//         }

//         // Send message to the sender as well
//         socket.emit("newMessage", newMessage);

//     } catch (error) {
//         console.error("Error saving message:", error);
//         socket.emit("errorMessage", { error: "Failed to save message" });
//     }
// });

socket.on("sendMessage", async (data) => {
  console.log("📩 Received message data:", data); // Debugging log

  try {
      const { senderId, receiverId, content } = data; 

      if (!content || content.trim() === "") {
          return socket.emit("errorMessage", { error: "Message content is required" });
      }

      // ✅ Create and save message
      const newMessage = new Chat({ senderId, receiverId, message: content });
      await newMessage.save();

      console.log("✅ Message saved:", newMessage);

      // ✅ Find receiver's socket ID
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
          io.to(receiverSocketId).emit("receiveMessage", newMessage);
      }

      // ✅ Send message to sender as well
      socket.emit("receiveMessage", newMessage);

  } catch (error) {
      console.error("❌ Error saving message:", error);
      socket.emit("errorMessage", { error: "Failed to save message" });
  }
});
  // Handle community messages
  socket.on("sendCommunityMessage", async ({ communityId, senderId, senderName, message }) => {
    try {
      const newMessage = new communityChat({ communityId, senderId, senderName, message });
      await newMessage.save();

      const communityMembers = await Community.findById(communityId).populate("members.userId");
      communityMembers.members.forEach(member => {
        const memberSocketId = onlineUsers.get(member.userId._id.toString());
        if (memberSocketId) {
          io.to(memberSocketId).emit("receiveCommunityMessage", { senderId, senderName, message });
        }
      });
    } catch (error) {
      console.error("Error handling community message:", error);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    console.log("User disconnected");
  });
});
// Middleware
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// CORS Headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Routes
app.use("/api", userRouter);
app.use("/api/connections", connections);
app.use("/api", chatRouter);
app.use("/api/settings", profileRouter);
app.use('/api/coach', subRoutes);
app.use('/api/coach', gameRoutes);
app.use('/api/courses', userCourse);
app.use('/api/stats', coachStats);
app.use('/api/admin', adminRoutes);
app.use('/api/sponsor', userSponsorRoutes);
app.use('/api/advertisements', advertisementRoutes);
app.use("/api/communities", communityRoutes);
app.use('/api/contact', contactRoutes);
// Connect to MongoDB and start server
const connection = async () => {
  try {
    await mongoose.connect(process.env.MongoDB_url);
    server.listen(process.env.PORT, () => {
      console.log("Server is running on port " + process.env.PORT);
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log(err);
  }
};

connection();
