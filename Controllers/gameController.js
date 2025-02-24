// controllers/gameController.js

const Game = require('../Models/game');
const Playlist = require('../Models/playlist');

// Create a new game
exports.createGame = async (req, res) => {
    const { title, description, status, price } = req.body;
    const thumbnail = req.file.location; // Get the thumbnail URL from S3
    try {
        const newGame = new Game({
            title,
            description,
            thumbnail,
            status,
            price,
            createdBy: req.user.id, // Assuming req.user contains the logged-in user's info
        });

        await newGame.save();
        res.status(201).json({ message: 'Game created successfully', game: newGame });
    } catch (error) {
        console.error('Error creating game:', error);
        res.status(500).json({ message: 'Failed to create game.' });
    }
};

// Get all games created by the coach
exports.getGames = async (req, res) => {
    try {
        const games = await Game.find({ createdBy: req.user.id}).sort({ createdAt: -1}).populate('playlists');
        res.status(200).json({ games });
    } catch (error) {
        console.error('Error fetching games:', error);
        res.status(500).json({ message: 'Failed to fetch games.' });
    }
};

// exports.getGamesPrivate = async (req, res) => {
//     try {
//         const games = await Game.find({ createdBy: req.user.id, status:'private' }).sort({ createdAt: -1});
//         res.status(200).json({ games });
//     } catch (error) {
//         console.error('Error fetching games:', error);
//         res.status(500).json({ message: 'Failed to fetch games.' });
//     }
// };

// Get a specific game by ID
exports.getGameById = async (req, res) => {
    const { gameId } = req.params;

    try {
        const game = await Game.findById(gameId).populate('playlists');
        if (!game) {
            return res.status(404).json({ message: 'Game not found.' });
        }
        res.status(200).json({ game });
    } catch (error) {
        console.error('Error fetching game:', error);
        res.status(500).json({ message: 'Failed to fetch game.' });
    }
};

const mongoose = require('mongoose');

exports.createPlaylist = async (req, res) => {
    const { title } = req.body;
    let { gameId } = req.params;

    try {
        // Trim any spaces and validate ObjectId
        gameId = gameId.trim();
        if (!mongoose.Types.ObjectId.isValid(gameId)) {
            return res.status(400).json({ message: 'Invalid game ID format' });
        }

        const newPlaylist = new Playlist({
            title,
            game: gameId,
        });

        await newPlaylist.save();

        // Update the game to include the new playlist
        await Game.findByIdAndUpdate(gameId, { $push: { playlists: newPlaylist._id } });

        res.status(201).json({ message: 'Playlist created successfully', playlist: newPlaylist });
    } catch (error) {
        console.error('Error creating playlist:', error);
        res.status(500).json({ message: 'Failed to create playlist.' });
    }
};


// Create a new playlist under a game
// exports.createPlaylist = async (req, res) => {
//     const { title } = req.body;
//     const { gameId } = req.params;

//     try {
//         const newPlaylist = new Playlist({
//             title,
//             game: gameId,
//         });

//         await newPlaylist.save();

//         // Update the game to include the new playlist
//         await Game.findByIdAndUpdate(gameId, { $push: { playlists: newPlaylist._id } });

//         res.status(201).json({ message: 'Playlist created successfully', playlist: newPlaylist });
//     } catch (error) {
//         console.error('Error creating playlist:', error);
//         res.status(500).json({ message: 'Failed to create playlist.' });
//     }
// };

exports.addVideoToPlaylist = async (req, res) => {
    const { title } = req.body;
    const { playlistId } = req.params;
    const videoUrl = req.file.location;

    try {
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found.' });
        }

        playlist.videos.push({ title, videoUrl });
        await playlist.save();

        res.status(201).json({ message: 'Video added to playlist successfully', playlist });
    } catch (error) {
        console.error('Error adding video to playlist:', error);
        res.status(500).json({ message: 'Failed to add video to playlist.' });
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

        res.status(200).json({ videos: playlist.videos });
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ message: 'Failed to fetch videos.' });
    }
};


// Get playlists under a specific game
exports.getPlaylistsInGame = async (req, res) => {
    const { gameId } = req.params; // Get the game ID from the request parameters

    try {
        const game = await Game.findById(gameId).populate('playlists'); // Populate playlists
        if (!game) {
            return res.status(404).json({ message: 'Game not found.' });
        }

        res.status(200).json({ playlists: game.playlists });
    } catch (error) {
        console.error('Error fetching playlists:', error);
        res.status(500).json({ message: 'Failed to fetch playlists.' });
    }
};

