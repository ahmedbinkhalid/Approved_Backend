const express = require("express");
const http = require("http"); // For Socket.IO
const socketIo = require("socket.io");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
require("dotenv").config();

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

  // User joins socket
  socket.on("join", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} connected`);
  });

  // Handle sending messages
  socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
    try {
      // Save the message to the database via Controller
      await saveMessage(senderId, receiverId, message);

      // Emit message to receiver if online
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", { senderId, message });
      }
    } catch (error) {
      console.error("Error handling message:", error);
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
