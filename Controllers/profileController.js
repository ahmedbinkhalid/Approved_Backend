const userModel = require('../Models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodeMailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
// const upload = require('../Middlewares/middleware');  // Import the multer middleware
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const {s3,upload} = require('../config/s3'); // Make sure to import your S3 client

require('dotenv').config();

const JWT_SECRET = process.env.secretKey;

// Save profile picture (only in settings)
// exports.saveProfilePicture = async (req, res) => {
//     const userId = req.user.id;
//     try {
//         if (!req.file) {
//             return res.status(400).json({ message: "No file uploaded." });
//         }

//         const user = await userModel.findById(userId);
//         if (!user) {
//             return res.status(404).json({ message: "User not found." });
//         }

//         // If the user already has a profile picture, delete it from S3
//         if (user.profilePicture) {
//             const oldPictureKey = user.profilePicture.split('/').pop(); // Extract the file name
//             const deleteParams = {
//                 Bucket: process.env.AWS_BUCKET_NAME,
//                 Key: `videos/${oldPictureKey}`, // Ensure correct S3 key structure
//             };
//             const deleteCommand = new DeleteObjectCommand(deleteParams); // Create the delete command
//             await s3.send(deleteCommand); // Corrected method call
//         }

//         // Save the new profile picture URL in the database
//         user.profilePicture = req.file.location; // Save the S3 URL
//         await user.save();

//         res.status(200).json({ message: "Profile picture updated successfully.", profilePicture: user.profilePicture });
//     } catch (error) {
//         console.error("Error saving profile picture:", error);
//         res.status(500).json({ message: "Failed to update profile picture." });
//     }
// };

// exports.saveProfilePicture = async (req, res) => {
//     const userId = req.user.id;
//     try {
//         if (!req.file) {
//             return res.status(400).json({ message: "No file uploaded." });
//         }

//         const user = await userModel.findById(userId);
//         if (!user) {
//             return res.status(404).json({ message: "User not found." });
//         }

//         // If the user already has a profile picture, delete it from S3
//         if (user.profilePicture) {
//             const oldPictureKey = user.profilePicture.split('/').pop(); // Extract the file name
//             const deleteParams = {
//                 Bucket: process.env.AWS_BUCKET_NAME,
//                 Key: `videos/${oldPictureKey}`, // Ensure correct S3 key structure
//             };
//             const deleteCommand = new DeleteObjectCommand(deleteParams); // Create the delete command
//             await s3.send(deleteCommand); // Corrected method call
//         }

//         // Save the new profile picture URL in the database
//         const newProfilePicture = req.file.location;
//         user.profilePicture = newProfilePicture;
//         await user.save();

//         // Update profile picture in friends and subscribedCoaches lists
//         await userModel.updateMany(
//             { "friends.userId": userId },
//             { $set: { "friends.$[elem].profilePicture": newProfilePicture } },
//             { arrayFilters: [{ "elem.userId": userId }] }
//         );

//         await userModel.updateMany(
//             { "subscribedCoaches": userId },
//             { $set: { "subscribedCoaches.$[elem].profilePicture": newProfilePicture } },
//             { arrayFilters: [{ "elem.userId": userId }] }
//         );

//         res.status(200).json({ message: "Profile picture updated successfully.", profilePicture: newProfilePicture });

//     } catch (error) {
//         console.error("Error saving profile picture:", error);
//         res.status(500).json({ message: "Failed to update profile picture." });
//     }
// };

exports.saveProfilePicture = async (req, res) => {
    const userId = req.user.id;
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded." });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // If the user already has a profile picture, delete it from S3
        if (user.profilePicture && user.profilePicture !== "defaultProfilePic.jpg") {
            const oldPictureKey = user.profilePicture.split('/').pop(); // Extract file name
            const deleteParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `profile_pictures/${oldPictureKey}`, // Adjust if necessary
            };
            const deleteCommand = new DeleteObjectCommand(deleteParams);
            await s3.send(deleteCommand);
        }

        // Save the new profile picture URL in the database
        const newProfilePicture = req.file.location;
        user.profilePicture = newProfilePicture;
        await user.save();

        // Update profile picture in friends and subscribedCoaches lists
        await userModel.updateMany(
            { "friends.userId": userId },
            { $set: { "friends.$[elem].profilePicture": newProfilePicture } },
            { arrayFilters: [{ "elem.userId": userId }] }
        );

        await userModel.updateMany(
            { "subscribedCoaches._id": userId },
            { $set: { "subscribedCoaches.$[elem].profilePicture": newProfilePicture } },
            { arrayFilters: [{ "elem._id": userId }] }
        );

        res.status(200).json({ message: "Profile picture updated successfully.", profilePicture: newProfilePicture });

    } catch (error) {
        console.error("Error saving profile picture:", error);
        res.status(500).json({ message: "Failed to update profile picture." });
    }
};
// Get user settings (including profile picture, username, and email)
exports.getUserSettings = async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User  not found." });
        }

        res.status(200).json({
            username: user.userName,
            email: user.email,
            profilePicture: user.profilePicture,  // Send the current profile picture filename
        });
    } catch (error) {
        console.error("Error fetching user settings:", error);
        res.status(500).json({ message: "Failed to fetch user settings." });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "New password and confirm password does not match." });
    }

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User  not found." });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect current password." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ message: "Failed to change password." });
    }
};