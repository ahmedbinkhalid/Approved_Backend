const ContactQuery = require('../Models/ContactQuery ');
const User = require('../Models/user');

// Coach submits a query
exports.submitQuery = async (req, res) => {
    try {
        const { subject, message } = req.body;
        const coachId = req.user.id; // Extract from JWT or session

        // Fetch coach details
        const coach = await User.findById(coachId);

        const newQuery = new ContactQuery({
            coachId: coach._id,
            coachEmail: coach.email,
            coachUserName: coach.userName,
            coachProfilePicture: coach.profilePicture,
            subject,
            message
        });

        await newQuery.save();
        res.status(201).json({ message: 'Query submitted successfully' });

    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

// Admin fetches all queries
exports.getAllQueries = async (req, res) => {
    try {
        const queries = await ContactQuery.find().sort({createdAt: -1});
        res.json(queries);
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

// Admin replies to a query
exports.replyToQuery = async (req, res) => {
    try {
        const { queryId } = req.params;
        const { replyMessage } = req.body;
        console.log(req.body);

        const query = await ContactQuery.findById(queryId);
        if (!query) {
            return res.status(404).json({ error: 'Query not found' });
        }

        if (query.adminReply) {
            return res.status(400).json({ error: 'Query already closed' });
        }
        
        query.adminReply = replyMessage;
        query.status = 'closed';
        await query.save();

        res.json({ message: 'Reply sent successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

// Coach fetches their queries and replies
exports.getCoachQueries = async (req, res) => {
    try {
        const coachId = req.user.id; // Extract from JWT or session

        const queries = await ContactQuery.find({ coachId });
        res.json(queries);
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};
