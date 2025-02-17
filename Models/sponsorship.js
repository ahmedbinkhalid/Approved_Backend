const mongoose = require('mongoose');

const sponsorshipSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
        trim: true
    },
    description:{
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true
    },
    tier:{
        type: String,
        required: true
    },
    price:{
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Sponsorship', sponsorshipSchema);