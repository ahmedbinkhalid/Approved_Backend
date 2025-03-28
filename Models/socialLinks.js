const mongoose = require('mongoose');

const socialLinksSchema = new mongoose.Schema({
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    twitterX: { type: String, default: '' }, // X (formerly Twitter)
    linkedIn: { type: String, default: '' },
    discord: { type: String, default: '' },
    youtube: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('SocialLinks', socialLinksSchema);
