const userModel = require('../Models/user');

exports.sendFriendRequest = async (req, res, next) => {
    const { toUserId } = req.body;
    const fromUserId = req.user.id;
    const fromUserName = req.user.userName;

    try {
        const toUser = await userModel.findById(toUserId);
        if (!toUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Ensure friendRequests and friends exist
        toUser.friendRequests = toUser.friendRequests || [];
        toUser.friends = toUser.friends || [];

        // Check if request already exists
        if (toUser.friendRequests.some(request => request.userId.toString() === fromUserId)) {
            return res.status(400).json({ message: 'Friend Request Already Sent' });
        }

        // Check if already friends
        if (toUser.friends.some(friend => friend.userId.toString() === fromUserId)) {
            return res.status(400).json({ message: 'You are already friends' });
        }

        // Add to the friend request list
        toUser.friendRequests.push({ userId: fromUserId, userName: fromUserName });
        await toUser.save();
        res.status(200).json({ message: 'Friend Request Sent Successfully' });

    } catch (err) {
        console.error(err);
        next(err);
    }
};

exports.handleFriendRequest = async (req, res, next) => {
    const { fromUserId, action } = req.body;
    const userId = req.user.id;

    try {
        const user = await userModel.findById(userId);
        const fromUser = await userModel.findById(fromUserId);

        if (!user || !fromUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Ensure friendRequests and friends exist
        user.friendRequests = user.friendRequests || [];
        user.friends = user.friends || [];
        fromUser.friends = fromUser.friends || [];

        // Find and remove friend request
        const requestIndex = user.friendRequests.findIndex(request => request.userId.toString() === fromUserId);
        if (requestIndex === -1) {
            return res.status(404).json({ message: 'Friend Request Not Found' });
        }
        user.friendRequests.splice(requestIndex, 1);

        if (action === 'accept') {
            // Add to both users' friend lists
            user.friends.push({ userId: fromUserId, userName: fromUser.userName });
            fromUser.friends.push({ userId: userId, userName: user.userName });

            await fromUser.save();
        }
        await user.save();

        res.status(200).json({ message: 'Friend Request Handled Successfully' });

    } catch (err) {
        console.error(err);
        next(err);
    }
};

exports.viewFriendRequests = async (req, res, next) => {
    const userId = req.user.id;
    try {
        const user = await userModel.findById(userId);
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
