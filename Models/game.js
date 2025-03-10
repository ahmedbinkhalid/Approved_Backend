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
    status: {
        type: String,
        enum: ['public', 'private'],
        default: 'public',
    },
    price:{
        type: String,
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
// Ensure MongoDB is connected before creating the index
gameSchema.index({ title: 'text', description: 'text' });
module.exports = mongoose.model('Game', gameSchema);