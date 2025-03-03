const Game = require('../Models/game');
const User = require('../Models/user');
const mongoose = require('mongoose');

const FuzzySearch = require('fuzzy-search');

exports.getUserSearch = async (req, res) => {
    try {
        const { searchQuery } = req.query;
        const userId = req.user.id;

        if (!searchQuery) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        // Fetch user's data
        const user = await User.findById(userId).select('subscribedCoaches purchasedGames');
        if (!user) return res.status(404).json({ error: 'User not found' });

        const coachIds = user.subscribedCoaches.map(coach => coach._id);
        const purchasedGameIds = user.purchasedGames;

        // Fetch all possible matches
        let games = await Game.find({
            $or: [
                { createdBy: { $in: coachIds } },
                { _id: { $in: purchasedGameIds } }
            ]
        });

        // Apply fuzzy search on fetched results
        const searcher = new FuzzySearch(games, ['title', 'description'], { caseSensitive: false });
        const results = searcher.search(searchQuery).slice(0, 10); // Limit to 10

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

