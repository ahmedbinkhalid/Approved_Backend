const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    email : {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: function(v) {
                return v != null && v.length > 0;
            },
            message: props => `${props.value} is not a valid username!`
        }
    },
    role: {
        type: String,
        enum: ['user', 'coach', 'admin'],
        default: 'user',
    },
    profilePicture: {
        type: String, // Store the filename of the profile picture
        default: 'defaultProfilePic.jpg', // Set a default image if the user hasn't uploaded one
      },
    createdAt: {
        type: Date,
        default: Date.now

    },
    otp: { type: Number }, // Field to store OTP
    otpExpire: { type: Date },

    friendRequests: [
        {
            userId : { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
            userName: {type: String},
            profilePicture: {type: String, required: true},
        }
    ],
    friends: [
        {
            userId : { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
            userName: String,
            profilePicture: String
        }
    ],
    subscribedCoaches: [
    {
        _id: mongoose.Schema.Types.ObjectId, // Store the coach ID
        userName: String,
        profilePicture: String
    }
]
,
    purchasedGames: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Game'
        }
    ],
    joinedCommunities: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Community"
        }
      ],
    status: {
        type: String,
        enum: ['active', 'blocked'],
        default: 'active',
    },
});

userSchema.statics.emailExists = async (email)=>{
    return await mongoose.model('Users').findOne({email});
}

module.exports = mongoose.model('Users', userSchema);