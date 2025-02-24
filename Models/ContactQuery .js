const mongoose = require('mongoose');

const contactQuerySchema = new mongoose.Schema({
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    coachEmail: {
        type: String,
        required: true
    },
    coachUserName: {
        type: String,
        required: true
    },
    coachProfilePicture: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    adminReply: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['open', 'closed'],
        default: 'open'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ContactQuery', contactQuerySchema);
