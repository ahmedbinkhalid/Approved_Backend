const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    date: {
        type: String, // Store date as YYYY-MM-DD
        required: true,
    },
    timeSlot: {
        type: String, // Example: "09:00 AM - 10:00 AM"
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Appointment', appointmentSchema);
