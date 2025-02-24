const userModel = require('../Models/user');

// exports.getAllUser = async (req, res, next) => {
//     try {
//         const users = await userModel.find({
//             role: 'user',
//             _id: { $ne: req.user.id } // Exclude the logged-in user
//         }).select("-password");
        
//         res.json(users);
//     } catch (error) {
//         console.error("Error getting users:", error);
//         res.status(500).json({ message: "Failed to get users." });
//     }
// };

exports.getAllUser = async (req, res, next) => {
    try {
        // Get the logged-in user details
        const loggedInUser = await userModel.findById(req.user.id);

        if (!loggedInUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find all users to whom the logged-in user has sent a friend request
        const sentFriendRequests = await userModel.find({
            "friendRequests.userId": req.user.id
        }).select("_id"); // Only get the _id of those users

        // Extract IDs of users to exclude
        const excludedUserIds = [
            req.user.id, // Exclude the logged-in user
            ...loggedInUser.friends.map(friend => friend.userId.toString()), // Exclude friends
            ...sentFriendRequests.map(request => request._id.toString()) // Exclude users who received a request from the logged-in user
        ];

        // Find users who are not in the excluded list
        const users = await userModel.find({
            role: 'user',
            _id: { $nin: excludedUserIds }
        }).select("-password");

        res.json(users);
    } catch (error) {
        console.error("Error getting users:", error);
        res.status(500).json({ message: "Failed to get users." });
    }
};

exports.sendFriendRequest = async (req, res, next) => {
    const { toUserId } = req.body;
    const fromUserId = req.user.id;
    const fromUserName = req.user.userName;
    const profilePicture = req.user.profilePicture;
    console.log(req.user.profilePicture)

    try {
        const toUser = await userModel.findById(toUserId);
        if (!toUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the friend request already exists
        const isRequestSent = await userModel.findOne({
            _id: toUserId,
            "friendRequests.userId": fromUserId
        });

        if (isRequestSent) {
            return res.status(400).json({ message: 'Friend Request Already Sent' });
        }

        // Check if they are already friends
        const isAlreadyFriend = await userModel.findOne({
            _id: toUserId,
            "friends.userId": fromUserId
        });

        if (isAlreadyFriend) {
            return res.status(400).json({ message: 'You are already friends' });
        }

        // Send friend request using atomic update (prevent race conditions)
        await userModel.findByIdAndUpdate(toUserId, {
            $push: { friendRequests: { userId: fromUserId, userName: fromUserName, profilePicture: profilePicture } }
        });

        res.status(200).json({ message: 'Friend Request Sent Successfully' });

    } catch (err) {
        console.error(err);
        next(err);
    }
};
const mongoose = require("mongoose");

// exports.handleFriendRequest = async (req, res, next) => {
//     const { fromUserId, action } = req.body;
//     const userId = req.user.id;
//     console.log("handle Friend Request ID : ", fromUserId);
//     console.log("User ID : ",userId);

//     try {
//         // Fetch both users from the database
//         const user = await userModel.findById(userId);
//         const fromUser = await userModel.findById(fromUserId);
//         console.log("From User" ,fromUser);
//         console.log("User" ,user);

//         if (!user || !fromUser) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Check if a friend request exists
//         const requestExists = user.friendRequests.some(
//             (request) => request.userId.toString() === mongoose.Types.ObjectId(fromUserId).toString()
//         );

//         if (!requestExists) {
//             return res.status(404).json({ message: 'Friend request not found' });
//         }

//         if (action === 'accept') {
//             // Add both users to each other's friends list
//             await Promise.all([
//                 userModel.findByIdAndUpdate(userId, {
//                     $pull: { friendRequests: { userId: fromUserId } },
//                     $push: {
//                         friends: {
//                             userId: fromUserId,
//                             userName: fromUser.userName,
//                             profilePicture: fromUser.profilePicture || 'defaultProfilePic.jpg'
//                         }
//                     }
//                 }),
//                 userModel.findByIdAndUpdate(fromUserId, {
//                     $push: {
//                         friends: {
//                             userId: userId,
//                             userName: user.userName,
//                             profilePicture: user.profilePicture || 'defaultProfilePic.jpg'
//                         }
//                     }
//                 }),
//             ]);

//             return res.status(200).json({ message: 'Friend request accepted successfully' });
//         } 
        
//         if (action === 'reject') {
//             // Remove request but do not update friends
//             await userModel.findByIdAndUpdate(userId, {
//                 $pull: { friendRequests: { userId: fromUserId } },
//             });

//             return res.status(200).json({ message: 'Friend request rejected successfully' });
//         }

//         return res.status(400).json({ message: 'Invalid action' });

//     } catch (err) {
//         console.error(err);
//         next(err);
//     }
// };
exports.handleFriendRequest = async (req, res, next) => {
    const { fromUserId, action } = req.body;
    const userId = req.user.id;

    console.log("ID : ", fromUserId);
    // console.log("User ID : ", userId);

    // Validate ObjectId before querying
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(fromUserId)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
        // Fetch both users
        const user = await userModel.findById(userId);
        const fromUser = await userModel.findById(fromUserId);

        // console.log("From User:", fromUser);
        // console.log("User:", user);

        if (!user || !fromUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if friend request exists
        const requestExists = user.friendRequests.some(
            (request) => request.userId.toString() === fromUserId
        );

        if (!requestExists) {
            return res.status(404).json({ message: 'Friend request not found' });
            console.log("404 Error : ",res.error);
        }

        if (action === 'accept') {
            // Accept friend request
            await Promise.all([
                userModel.findByIdAndUpdate(userId, {
                    $pull: { friendRequests: { userId: new mongoose.Types.ObjectId(fromUserId) } },
                    $push: {
                        friends: {
                            userId: fromUserId,
                            userName: fromUser.userName,
                            profilePicture: fromUser.profilePicture || 'defaultProfilePic.jpg'
                        }
                    }
                }, { new: true }),

                userModel.findByIdAndUpdate(fromUserId, {
                    $push: {
                        friends: {
                            userId: userId,
                            userName: user.userName,
                            profilePicture: user.profilePicture || 'defaultProfilePic.jpg'
                        }
                    }
                }, { new: true })
            ]);

            return res.status(200).json({ message: 'Friend request accepted successfully' });
        } 
        
        if (action === 'reject') {
            // Reject friend request
            await userModel.findByIdAndUpdate(userId, {
                $pull: { friendRequests: { userId: new mongoose.Types.ObjectId(fromUserId) } },
            }, { new: true });

            return res.status(200).json({ message: 'Friend request rejected successfully' });
        }

        return res.status(400).json({ message: 'Invalid action' });

    } catch (err) {
        console.error(err);
        next(err);
    }
};
// yes
exports.viewFriendRequests = async (req, res, next) => {
    const userId = req.user.id;
    try {
        const user = await userModel.findById(userId);
        console.log(user);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.friendRequests || []);

    } catch (err) {
        console.error(err);
        next(err);
    }
};

exports.viewFriends = async (req, res, next) => {
    const userId = req.user.id;
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.friends || []);

    } catch (err) {
        console.error(err);
        next(err);
    }
};
