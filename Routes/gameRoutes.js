// routes/gameRoutes.js

const express = require('express');
const router = express.Router();
const gameController = require('../Controllers/gameController');
const {s3,upload} = require('../config/s3'); // Import the S3 upload configuration
const { authMiddleware } = require('../Middlewares/middleware'); // Assuming you have an auth middleware

// Create a new game
router.post('/games', authMiddleware, upload.single('thumbnail'), gameController.createGame);

// Get all games
router.get('/get-games', authMiddleware, gameController.getGames);

// Get a specific game by ID
router.get('/games/:gameId', authMiddleware, gameController.getGameById);

// Create a new playlist under a game
router.post('/games/:gameId/playlists', authMiddleware, gameController.createPlaylist);

// Get playlists under a specific game
router.get('/games/:gameId/playlists', authMiddleware, gameController.getPlaylistsInGame); // New route

// Add a video to a playlist
router.post('/playlists/:playlistId/videos', authMiddleware, upload.single('video'), gameController.addVideoToPlaylist);

// Get videos under a specific playlist
router.get('/playlists/:playlistId/get-videos', authMiddleware, gameController.getVideosInPlaylist);

module.exports = router;