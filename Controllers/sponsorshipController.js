const Sponsers = require('../Models/sponsorship');


exports.getSponsorshipTiers = async (req, res, next)=>{
    try{
        const tiers = await Sponsers.find().sort({ createdAt: -1 });
        res.status(200).json({ tiers });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching sponsorships" });
    }
};