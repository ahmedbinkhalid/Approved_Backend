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
            status :  game.status
        }));

        // console.log("formated courses : ", formattedCourses);

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

// controllers/userController.js

exports.getPrivateCoursesFromSubscribedCoaches = async (req, res) => {
    const userId = req.user.id; // Get logged-in user ID

    try {
        // Find the user and populate subscribed coaches
        const user = await User.findById(userId).populate('subscribedCoaches');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Get subscribed coach IDs
        const coachIds = user.subscribedCoaches.map(coach => coach._id);

        // Fetch private games (courses) from subscribed coaches
        const privateCourses = await Game.find({
            createdBy: { $in: coachIds },
            status: 'private'
        });

        // Format the response
        const formattedCourses = privateCourses.map(course => ({
            id: course._id,
            title: course.title,
            description: course.description,
            thumbnail: course.thumbnail,
            price: course.price,
            status: course.status,
            buyNow: true // Indicating this course is available for purchase
        }));

        res.status(200).json({ courses: formattedCourses });
    } catch (error) {
        console.error('Error fetching private courses:', error);
        res.status(500).json({ message: 'Failed to fetch private courses.' });
    }
};


exports.buyCourse = async (req, res) => {
    const userId = req.user.id; // Get logged-in user ID
    const { gameId } = req.body; // Course ID to purchase
    console.log("Game Id : ", req.body);
    try {
        // Find user and check if they exist
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if the game exists
        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: 'Game not found.' });
        }

        // Check if the user already owns this course
        if (user.purchasedGames.includes(gameId)) {
            return res.status(400).json({ message: 'You have already purchased this course.' });
        }

        // Add the game to the user's purchasedGames list
        user.purchasedGames.push(gameId);
        await user.save();

        res.status(200).json({ message: 'Course purchased successfully.', purchasedGame: gameId });
    } catch (error) {
        console.error('Error purchasing course:', error);
        res.status(500).json({ message: 'Failed to purchase course.' });
    }
};

exports.getPurchasedCourses = async (req, res) => {
    const userId = req.user.id; // Get logged-in user ID

    try {
        // Find the user and populate purchased games with full access to playlists and videos
        const user = await User.findById(userId).populate({
            path: 'purchasedGames',
            populate: {
                path: 'playlists',
                populate: {
                    path: 'videos',
                },
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Format the response
        const purchasedCourses = user.purchasedGames.map(course => ({
            id: course._id,
            title: course.title,
            description: course.description,
            thumbnail: course.thumbnail,
            status: course.status,
            price: course.price,
            playlists: course.playlists.map(playlist => ({
                id: playlist._id,
                title: playlist.title,
                videos: playlist.videos.map(video => ({
                    title: video.title,
                    videoUrl: video.videoUrl,
                    createdAt: video.createdAt,
                })),
            })),
        }));

        res.status(200).json({ purchasedCourses });
    } catch (error) {
        console.error('Error fetching purchased courses:', error);
        res.status(500).json({ message: 'Failed to fetch purchased courses.' });
    }
};

