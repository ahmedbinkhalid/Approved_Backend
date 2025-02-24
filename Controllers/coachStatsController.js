// controllers/coachStatsController.js

const User = require('../Models/user'); // Import the User model
const Game = require('../Models/game'); // Import the Game model
const Playlist = require('../Models/playlist'); // Import the Playlist model

// Get statistics for the logged-in coach
exports.getCoachStatistics = async (req, res) => {
    const coachId = req.user.id; // Get the logged-in coach's ID

    try {
        // Fetch the coach's details
        const coach = await User.findById(coachId).select('userName email profilePicture'); // Select only username and email

        if (!coach) {
            return res.status(404).json({ message: 'Coach not found.' });
        }

        // Count the number of subscribers
        // const subscriberCount = await User.countDocuments({ subscribedCoaches: coachId });
        const subscriberCount = await User.countDocuments({
            subscribedCoaches: { $elemMatch: { _id: coachId } }
        });
        // Count the number of games created by the coach
        const gameCount = await Game.countDocuments({ createdBy: coachId });

        // Count the number of playlists created by the coach
        const playlistCount = await Playlist.countDocuments({ game: { $in: await Game.find({ createdBy: coachId }).distinct('_id') } });

        // Count the total number of videos in those playlists
        const totalVideos = await Playlist.aggregate([
            { $match: { game: { $in: await Game.find({ createdBy: coachId }).distinct('_id') } } },
            { $unwind: '$videos' },
            { $group: { _id: null, totalVideos: { $sum: 1 } } }
        ]);

        const totalVideoCount = totalVideos.length > 0 ? totalVideos[0].totalVideos : 0;

        // Send the statistics as a response
        res.status(200).json({
            userName: coach.userName,
            email: coach.email,
            profilePicture: coach.profilePicture,
            subscriberCount,
            gameCount,
            playlistCount,
            totalVideoCount,
        });
    } catch (error) {
        console.error('Error fetching coach statistics:', error);
        res.status(500).json({ message: 'Failed to fetch statistics.' });
    }
};


// Get a list of subscribers for the logged-in coach
exports.getSubscribersList = async (req, res) => {
    const coachId = req.user.id; // Get the logged-in coach's ID
    try {
        // Find all users who are subscribed to this coach
        // const subscribers = await User.find({ subscribedCoaches: coachId }).select('userName email');
        const subscribers = await User.find({
            subscribedCoaches: { $elemMatch: { _id: coachId } }
        }).select('userName email');
        
        // Count the number of subscribers
        const subscriberCount = subscribers.length;

        // Send the list of subscribers and the count as a response
        res.status(200).json({
            subscriberCount,
            subscribers,
        });
    } catch (error) {
        console.error('Error fetching subscribers:', error);
        res.status(500).json({ message: 'Failed to fetch subscribers.' });
    }
};