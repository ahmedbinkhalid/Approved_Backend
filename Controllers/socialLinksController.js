const SocialLinks = require('../Models/socialLinks'); // Import model

// Add or Update Platform Social Links
exports.upsertSocialLinks = async (req, res) => {
    try {
        const { instagram, facebook, twitterX, linkedIn, discord, youtube } = req.body;

        // Ensure only one document exists
        const updatedLinks = await SocialLinks.findOneAndUpdate(
            {},
            { instagram, facebook, twitterX, linkedIn, discord, youtube },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({ success: true, message: "Platform social links updated successfully!", data: updatedLinks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Platform Social Links
exports.getSocialLinks = async (req, res) => {
    try {
        const socialLinks = await SocialLinks.findOne();

        if (!socialLinks) {
            return res.status(404).json({ success: false, message: "No social links found for the platform." });
        }

        res.status(200).json({ success: true, data: socialLinks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
