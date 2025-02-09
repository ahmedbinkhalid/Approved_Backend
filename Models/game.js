// models/game.js

const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String, // URL of the thumbnail image
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users', // Reference to the Users model (the coach)
        required: true,
    },
    playlists: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Playlist', // Reference to the Playlist model
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Game', gameSchema);