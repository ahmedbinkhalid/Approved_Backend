const User = require('../Models/user');
const Game = require('../Models/game');

const Sponsorship = require('../Models/sponsorship');
const Advertisement = require('../Models/advertisement');

const AdvertisementRequest = require('../Models/advertisementRequest'); // Adjust path if needed
const SponsorshipRequest = require('../Models/SponsorshipRequest'); // Adjust path if needed
const mongoose = require('mongoose');

// Get all users (Players and Coaches)

exports.getAllUsers = async (req, res, next)=>{
    try {
        const users = await User.find().select('-password');
        res.status(200).json({users});
    } catch(error){
        res.status(500).json({message: 'Error fetching users'});
    }
};

// Get only Players

exports.getAllPlayers = async (req,res,next)=>{
    try{
        const players = await User.find({role: 'user'}).select('-password');
        res.status(200).json({players});
    } catch(error){
        res.status(500).json({message: 'Error fetching players'});
    }
};

//Get only coaches

exports.getAllCoaches = async (req, res, next)=>{
    try{
        const coaches = await User.find({role: 'coach'}).select('-password');
        res.status(200).json({coaches});
    } catch(error){
        res.status(500).json({message: 'Error fetching coaches'});
    }
};

// Get all active Ublocked Users

exports.getActiveUsers = async (req, res, next)=>{
    try{
        const activeUsers = await User.find({status: 'active'}).select('-password');
        res.status(200).json({activeUsers});
    } catch(error){
        res.status(500).json({message: 'Error fetching active users'});
    }
};


// Get all Bloacked User 

exports.getBlockedUsers = async (req, res, next)=>{
    try{
        const blockedUsers = await User.find({status: 'bloacked'}).select('-password');
        res.status(200).json({blockedUsers});
    } catch(error){
        res.status(500).json({message: 'Error fetching blocked users'});
    }
};

// Block a user 

exports.blockUser = async (req, res, next)=>{
    try{
        const { userId } = req.params;
        const user = await User.findById(userId);
        console.log(userId);
        
        if(!user) return res.status(404).json({message: 'user not found'});

        if(user.status === 'blocked'){
            return res.status(400).json({message: 'user is already blocked'});
        }

        user.status = 'blocked';
        await user.save();
        res.status(200).json({message: 'user blocked successfully'});
    } catch(error){
        res.status(500).json({message: 'Error blocking user'});
    }
};

// Unblock a user 

exports.unblockUser = async (req, res, next)=>{
    try{
        const {userId} = req.params;
        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({message: 'user not found'});
        }

        if(user.status === 'active'){
            return res.status(400).json({message: 'user is already active'});
        }
        user.status = 'active';
        await user.save();
        res.status(200).json({message: 'user unblocked successfully'});
    } catch(error){
        res.status(500).json({message: 'Error unblocking user'});
    }
};

// get Coach details (Games, Playlists, Subscribers)

exports.getCoachDetails = async (req, res, next)=>{
    try{
        const { coachId } = req.params;
        const coach = await User.findById(coachId).populate('subscribedCoaches').select('-password');

        if(!coach || coach.role !=='coach'){
            return res.status(404).json({message: 'Coach not found'});
        }
        const games = await Game.find({createdBy: coachId}).populate({
            path: 'playlists',
            populate: { path: 'videos'}
        });
        res.status(200).json({coach, games});
    } catch(error){
        res.status(500).json({message: 'Error fetching coach details'});
        console.log(error);
    }
};

// Get players details (Subscribed coaches, friendlist);

exports.getPlayerDetails = async (req, res, next)=>{
    try{
        const {playerId} = req.params;
        const player = await User.findById(playerId).populate('subscribedCoaches').select('-password');

        if(!player || player.role !== 'user'){
            return res.status(404).json({message: 'Player not found'});
        }
        res.status(200).json({player, friends: player.friends});
    } catch(error){
        res.status(500).json({message: 'Error fetching player details'});
    }
};


exports.uploadSponsorshipTier = async (req, res) => {
    try {
        const { title, description, price, tier } = req.body;

        if (!req.file || !req.file.location) {
            return res.status(400).json({ message: "Image is required" });
        }

        if (!title || !description || !price || !tier) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const sponsorship = new Sponsorship({
            title,
            description,
            price: parseFloat(price), // Ensure price is a number
            tier, // Keep tier as a string
            image: req.file.location
        });

        await sponsorship.save();
        res.status(201).json({ message: "Sponsorship tier uploaded successfully", sponsorship });
    } catch (error) {
        res.status(500).json({ message: "Error uploading sponsorship tier", error: error.message });
    }
};


// Get Sponsorship Tiers
exports.getSponsorshipTiers = async (req, res) => {
    try {
        const sponsorships = await Sponsorship.find().sort({createdAt: -1});
        res.status(200).json({ sponsorships });
    } catch (error) {
        res.status(500).json({ message: "Error fetching sponsorship tiers" });
    }
};

// Get Sponsorship Tier by ID
exports.getSponsorshipTierById = async (req, res) => {
    try {
        const { id } = req.params;
        const sponsorship = await Sponsorship.findById(id);

        if (!sponsorship) {
            return res.status(404).json({ message: "Sponsorship tier not found" });
        }

        res.status(200).json({ sponsorship });
    } catch (error) {
        res.status(500).json({ message: "Error fetching sponsorship tier" });
    }
};

// Upload Advertisement Banner
exports.uploadAdvertisement = async (req, res) => {
    try {
        const { title, description, placement } = req.body;
        if (!req.file) return res.status(400).json({ message: "Image is required" });

        const advertisement = new Advertisement({
            title,
            description,
            placement,
            image: req.file.location // S3 file URL
        });

        await advertisement.save();
        res.status(201).json({ message: "Advertisement uploaded" });
    } catch (error) {
        res.status(500).json({ message: "Error uploading advertisement", error });
    }
};

// Get Advertisements for student
exports.getAdvertisements = async (req, res) => {
    try {
        const advertisements = await Advertisement.find({ placement: { $in: ['user', 'both'] } });
        res.status(200).json({ advertisements });
    } catch (error) {
        res.status(500).json({ message: "Error fetching advertisements" });
    }
};

// Get advertisements for coach

exports.getAdvertisementsCoach = async (req, res, next)=>{
    try{
        const advertisements = await Advertisement.find({placement: { $in: ['coach', 'both']}});
        res.status(200).json({advertisements});
    } catch(error){
        res.status(500).json({message: "Error fetching advertisements for coach"});
    }
};


exports.deleteAdvertisement = async (req, res) => {
    try {
        const { id } = req.params;
        const advertisement = await Advertisement.findById(id);

        if (!advertisement) return res.status(404).json({ message: "Advertisement not found" });

        // Delete from MongoDB only
        await Advertisement.findByIdAndDelete(id);

        res.status(200).json({ message: "Advertisement deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting advertisement", error });
    }
};


exports.deleteSponsorship = async (req, res) => {
    try {
        const { id } = req.params;
        const sponsorship = await Sponsorship.findById(id);

        if (!sponsorship) return res.status(404).json({ message: "Sponsorship not found" });

        // Delete from MongoDB only
        await Sponsorship.findByIdAndDelete(id);

        res.status(200).json({ message: "Sponsorship deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting sponsorship", error });
    }
};




exports.getAdminProfile = async (req, res) => {
    try {
        const adminId = req.user.id; // Assuming you have middleware that adds user info to req

        const admin = await User.findById(adminId).select('email userName profilePicture role');
        
        if (!admin || admin.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        // Aggregation for user and coach counts
        const aggregation = await User.aggregate([
            {
                $group: {
                    _id: "$role",
                    count: { $sum: 1 }
                }
            }
        ]);

        let totalUsers = 0, totalCoaches = 0;
        aggregation.forEach(item => {
            if (item._id === 'user') totalUsers = item.count;
            if (item._id === 'coach') totalCoaches = item.count;
        });

        // Count total advertisement requests
        const totalAdvertisementRequests = await AdvertisementRequest.countDocuments();

        // Count total sponsorship requests
        const totalSponsorshipRequests = await SponsorshipRequest.countDocuments();

        res.json({
            adminProfile: {
                email: admin.email,
                userName: admin.userName,
                profilePicture: admin.profilePicture
            },
            stats: {
                totalUsers,
                totalCoaches,
                totalAdvertisementRequests,
                totalSponsorshipRequests
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// exports.getAdminProfile = async (req, res) => {
//     try {
//         const adminId = req.user.id; // Assuming you have middleware that adds user info to req
        
//         const admin = await User.findById(adminId).select('email userName profilePicture role');
        
//         if (!admin || admin.role !== 'admin') {
//             return res.status(403).json({ message: 'Access denied. Admin only.' });
//         }

//         const aggregation = await User.aggregate([
//             {
//                 $group: {
//                     _id: "$role",
//                     count: { $sum: 1 }
//                 }
//             }
//         ]);

//         let totalUsers = 0, totalCoaches = 0;
//         aggregation.forEach(item => {
//             if (item._id === 'user') totalUsers = item.count;
//             if (item._id === 'coach') totalCoaches = item.count;
//         });

//         res.json({
//             adminProfile: {
//                 email: admin.email,
//                 userName: admin.userName,
//                 profilePicture: admin.profilePicture
//             },
//             stats: {
//                 totalUsers,
//                 totalCoaches
//             }
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };
