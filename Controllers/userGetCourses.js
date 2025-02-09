// controllers/userController.js

const Game = require('../Models/game'); // Import the Game model
const Playlist = require('../Models/playlist'); // Import the Playlist model
const User = require('../Models/user'); // Import the User model

// Get all courses from subscribed coaches
exports.getCoursesFromSubscribedCoaches = async (req, res) => {
    const userId = req.user.id; // Get the logged-in user's ID

    try {
        // Find the user and populate the subscribed coaches
        const user = await User.findById(userId).populate('subscribedCoaches');
        if (!user) {
            return res.status(404).json({ message: 'User  not found.' });
        }

        // Get the IDs of the subscribed coaches
        const coachIds = user.subscribedCoaches.map(coach => coach._id);

        // Fetch games (courses) created by the subscribed coaches
        const games = await Game.find({ createdBy: { $in: coachIds } });

        // Format the response
        const formattedCourses = games.map(game => ({
            id: game._id,
            title: game.title,
            description: game.description,
            thumbnail: game.thumbnail,
        }));

        res.status(200).json({ courses: formattedCourses });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Failed to fetch courses.' });
    }
};

// Get playlists associated with a specific course
exports.getPlaylistsForCourse = async (req, res) => {
    const { courseId } = req.params; // Get the course ID from the request parameters

    try {
        const game = await Game.findById(courseId).populate('playlists');
        if (!game) {
            return res.status(404).json({ message: 'Course not found.' });
        }

        // Format the response
        const playlists = game.playlists.map(playlist => ({
            id: playlist._id,
            title: playlist.title,
        }));

        res.status(200).json({ playlists });
    } catch (error) {
        console.error('Error fetching playlists:', error);
        res.status(500).json({ message: 'Failed to fetch playlists.' });
    }
};

// Get videos under a specific playlist
exports.getVideosInPlaylist = async (req, res) => {
    const { playlistId } = req.params; // Get the playlist ID from the request parameters

    try {
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found.' });
        }

        // Format the response
        const videos = playlist.videos.map(video => ({
            title: video.title,
            videoUrl: video.videoUrl,
            createdAt: video.createdAt,
        }));

        res.status(200).json({ videos });
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ message: 'Failed to fetch videos.' });
    }
};