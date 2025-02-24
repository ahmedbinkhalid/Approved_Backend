const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: "defaultCommunityPic.jpg"
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users', // Ensure consistency with the User model name
        required: true
    },
    members: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
            userName: String,
            profilePicture: String
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Community", communitySchema);
