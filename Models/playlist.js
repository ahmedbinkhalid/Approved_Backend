// models/playlist.js

const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    game: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game', // Reference to the Game model
        required: true,
    },
    videos: [
        {
            title: {
                type: String,
                required: true,
            },
            videoUrl: {
                type: String,
                required: true,
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        }
    ],
});

module.exports = mongoose.model('Playlist', playlistSchema);