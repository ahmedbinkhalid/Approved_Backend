const userModel = require('../Models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodeMailer = require('nodemailer');
const mongoose = require("mongoose");

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const upload = require('../Middlewares/middleware');  // Import the multer middleware


const JWT_SECRET = process.env.secretKey;

// Subscribe to a coach
// exports.subscribeToCoach = async (req, res) => {
//     const userId = req.user.id; // Get the logged-in user's ID
//     const { coachId } = req.body; // Get the coach ID from the request body
//     console.log("Coach ID : ", coachId);
//     try {
//         const user = await userModel.findById(userId);
//         if (!user) {
//             return res.status(404).json({ message: "User  not found." });
//         }
  
//         // Check if the user is already subscribed to the coach
//         if (user.subscribedCoaches.includes(coachId)) {
//             return res.status(400).json({ message: "You are already subscribed to this coach." });
//         }
  
//         // Subscribe to the coach
//         user.subscribedCoaches.push(coachId);
//         await user.save();
  
//         res.status(200).json({ message: "Successfully subscribed to the coach." });
//     } catch (error) {
//         console.error("Error subscribing to coach:", error);
//         res.status(500).json({ message: "Failed to subscribe to coach." });
//     }
//   };
exports.subscribeToCoach = async (req, res) => {
    const userId = req.user.id; // Logged-in user's ID
    const { coachId } = req.body; // Coach ID from request body
    console.log("Coach ID:", coachId);

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const coach = await userModel.findById(coachId);
        if (!coach) {
            return res.status(404).json({ message: "Coach not found." });
        }

        // Check if already subscribed
        const isAlreadySubscribed = user.subscribedCoaches.some(sub => sub._id.toString() === coachId);
        if (isAlreadySubscribed) {
            return res.status(400).json({ message: "You are already subscribed to this coach." });
        }

        // Store full coach object instead of just ID
        user.subscribedCoaches.push({
            _id: coach._id,
            userName: coach.userName,
            profilePicture: coach.profilePicture
        });

        await user.save();

        res.status(200).json({ message: "Successfully subscribed to the coach.", subscribedCoaches: user.subscribedCoaches });
    } catch (error) {
        console.error("Error subscribing to coach:", error);
        res.status(500).json({ message: "Failed to subscribe to coach." });
    }
};


//   // Unsubscribe from a coach
//   exports.unsubscribeFromCoach = async (req, res) => {
//     const userId = req.user.id; // Get the logged-in user's ID
//     const { coachId } = req.body; // Get the coach ID from the request body
  
//     console.log("User Id : ",userId );
//     console.log(" coach Id : ",coachId);
//     try {
//         const user = await userModel.findById(userId);
//         if (!user) {
//             return res.status(404).json({ message: "User  not found." });
//         }
  
//         // Check if the user is subscribed to the coach
//         if (!user.subscribedCoaches.includes(coachId)) {
//             return res.status(400).json({ message: "You are not subscribed to this coach." });
//         }
  
//         // Unsubscribe from the coach
//         user.subscribedCoaches = user.subscribedCoaches.filter(id => id.toString() !== coachId);
//         await user.save();
  
//         res.status(200).json({ message: "Successfully unsubscribed from the coach." });
//     } catch (error) {
//         console.log(error);
//         console.error("Error unsubscribing from coach:", error);
//         res.status(500).json({ message: "Failed to unsubscribe from coach." });
//     }
//   };

// // Unsubscribe from a coach
// exports.unsubscribeFromCoach = async (req, res) => {
//     const userId = req.user?.id;
//     const { coachId } = req.body;

//     console.log("User Id:", userId);
//     console.log("Coach Id:", coachId);

//     try {
//         if (!userId || !coachId) {
//             return res.status(400).json({ message: "User ID and Coach ID are required." });
//         }

//         if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(coachId)) {
//             return res.status(400).json({ message: "Invalid user or coach ID format." });
//         }

//         const user = await userModel.findById(userId);
//         if (!user) {
//             return res.status(404).json({ message: "User not found." });
//         }

//         if (!Array.isArray(user.subscribedCoaches)) {
//             return res.status(500).json({ message: "User's subscription data is corrupted." });
//         }

//         // Ensure the array does not contain null values before filtering
//         user.subscribedCoaches = user.subscribedCoaches
//             .filter(id => id && id.toString() !== coachId);

//         await user.save();

//         res.status(200).json({ message: "Successfully unsubscribed from the coach." });
//     } catch (error) {
//         console.error("Error unsubscribing from coach:", error);
//         res.status(500).json({ message: "Failed to unsubscribe from coach." });
//     }
// };
exports.unsubscribeFromCoach = async (req, res) => {
    const userId = req.user?.id;
    const { coachId } = req.body;

    console.log("User Id:", userId);
    console.log("Coach Id:", coachId);

    try {
        if (!userId || !coachId) {
            return res.status(400).json({ message: "User ID and Coach ID are required." });
        }

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(coachId)) {
            return res.status(400).json({ message: "Invalid user or coach ID format." });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (!Array.isArray(user.subscribedCoaches)) {
            return res.status(500).json({ message: "User's subscription data is corrupted." });
        }

        console.log("Current Subscribed Coaches:", user.subscribedCoaches);

        // Check if the user is actually subscribed
        const isSubscribed = user.subscribedCoaches.some(sub => 
            (typeof sub === "object" ? sub._id.toString() : sub.toString()) === coachId
        );

        if (!isSubscribed) {
            return res.status(400).json({ message: "You are not subscribed to this coach." });
        }

        // Filter out the subscription
        user.subscribedCoaches = user.subscribedCoaches.filter(sub => 
            (typeof sub === "object" ? sub._id.toString() : sub.toString()) !== coachId
        );

        await user.save();

        res.status(200).json({ message: "Successfully unsubscribed from the coach.", subscribedCoaches: user.subscribedCoaches });
    } catch (error) {
        console.error("Error unsubscribing from coach:", error);
        res.status(500).json({ message: "Failed to unsubscribe from coach." });
    }
};
  
  // Get list of subscribed coaches
  exports.getSubscribedCoaches = async (req, res) => {
    console.log(req.body);
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
    console.log(req);
    try {
        const coaches = await userModel.find({ role: 'coach' }, 'userName email profilePicture'); // Fetch only coaches
        res.status(200).json({ coaches });
    } catch (error) {
        console.error("Error fetching coaches:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
  };