const mongoose = require('mongoose');

const advertisementRequestSchema = new mongoose.Schema({
    advertisementId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Advertisement',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    requestMessage: {
        type: String,
        required: false
    },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    role:{
        type: String,
        required: true
      },
      read: { type: Boolean, default: false }, 
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AdvertisementRequest', advertisementRequestSchema);
