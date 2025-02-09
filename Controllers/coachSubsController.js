const userModel = require('../Models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodeMailer = require('nodemailer');

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const upload = require('../Middlewares/middleware');  // Import the multer middleware


const JWT_SECRET = process.env.secretKey;

// Subscribe to a coach
exports.subscribeToCoach = async (req, res) => {
    const userId = req.user.id; // Get the logged-in user's ID
    const { coachId } = req.body; // Get the coach ID from the request body
  
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User  not found." });
        }
  
        // Check if the user is already subscribed to the coach
        if (user.subscribedCoaches.includes(coachId)) {
            return res.status(400).json({ message: "You are already subscribed to this coach." });
        }
  
        // Subscribe to the coach
        user.subscribedCoaches.push(coachId);
        await user.save();
  
        res.status(200).json({ message: "Successfully subscribed to the coach." });
    } catch (error) {
        console.error("Error subscribing to coach:", error);
        res.status(500).json({ message: "Failed to subscribe to coach." });
    }
  };
  
  // Unsubscribe from a coach
  exports.unsubscribeFromCoach = async (req, res) => {
    const userId = req.user.id; // Get the logged-in user's ID
    const { coachId } = req.body; // Get the coach ID from the request body
  
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User  not found." });
        }
  
        // Check if the user is subscribed to the coach
        if (!user.subscribedCoaches.includes(coachId)) {
            return res.status(400).json({ message: "You are not subscribed to this coach." });
        }
  
        // Unsubscribe from the coach
        user.subscribedCoaches = user.subscribedCoaches.filter(id => id.toString() !== coachId);
        await user.save();
  
        res.status(200).json({ message: "Successfully unsubscribed from the coach." });
    } catch (error) {
        console.error("Error unsubscribing from coach:", error);
        res.status(500).json({ message: "Failed to unsubscribe from coach." });
    }
  };
  
  // Get list of subscribed coaches
  exports.getSubscribedCoaches = async (req, res) => {
    const userId = req.user.id; // Get the logged-in user's ID
  
    try {
        const user = await userModel.findById(userId).populate('subscribedCoaches', 'userName email profilePicture'); // Populate coach details
        if (!user) {
            return res.status(404).json({ message: "User  not found." });
        }
  
        res.status(200).json({ subscribedCoaches: user.subscribedCoaches });
    } catch (error) {
        console.error("Error fetching subscribed coaches:", error);
        res.status(500).json({ message: "Failed to fetch subscribed coaches." });
    }
  };
  
  // Get all coaches
  exports.getAllCoaches = async (req, res) => {
    try {
        const coaches = await userModel.find({ role: 'coach' }, 'userName email profilePicture'); // Fetch only coaches
        res.status(200).json({ coaches });
    } catch (error) {
        console.error("Error fetching coaches:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
  };