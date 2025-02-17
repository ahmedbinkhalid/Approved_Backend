const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String, // Store image URL or filename
        required: true
    },
    placement: {
        type: String,
        enum: ['user', 'coach', 'both'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Advertisement', advertisementSchema);
