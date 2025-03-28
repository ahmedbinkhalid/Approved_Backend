const Sponsers = require('../Models/sponsorship');
const SponsorshipRequest = require("../Models/SponsorshipRequest");
const mongoose = require('mongoose');

exports.getSponsorshipTiers = async (req, res, next)=>{
    try{
        const tiers = await Sponsers.find().sort({ createdAt: -1 });
        res.status(200).json({ tiers });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching sponsorships" });
    }
};

// Get Sponsorship Tier by ID
exports.getSponsorshipTierById = async (req, res) => {
    try {
        const { id } = req.params;
        const sponsorship = await Sponsers.findById(id);

        if (!sponsorship) {
            return res.status(404).json({ message: "Sponsorship tier not found" });
        }

        res.status(200).json({ sponsorship });
    } catch (error) {
        res.status(500).json({ message: "Error fetching sponsorship tier" });
    }
};


// // POST API: Send a sponsorship request
exports.sendSponsorshipRequest = async (req, res) => {
    try {
        const { formData } = req.body;
        if (!formData) {
            return res.status(400).json({ message: "Invalid request body format" });
        }

        console.log("Tier Request : ", formData);
        const { tierId, message } = formData;
        const userId = req.user.id;
        const userName = req.user.userName;
        const email = req.user.email;
        const role = req.user.role;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(tierId)) {
            return res.status(400).json({ message: "Invalid tier ID format" });
        }

        // Check if tier exists
        const tier = await Sponsers.findById(tierId);
        if (!tier) {
            return res.status(404).json({ message: "Sponsorship tier not found" });
        }

         // Check if a sponsorship request from the same user for the same tier already exists
         const existingRequest = await SponsorshipRequest.findOne({ userId, tierId });
         if (existingRequest) {
             return res.status(400).json({ message: "You have already sent a sponsorship request for this tier" });
         }
        // Create the request
        const newRequest = new SponsorshipRequest({
            userId,
            userName,
            email,
            tierId,
            tier: tier.tier, // Store tier name (e.g., Bronze, Silver, Gold)
            message,
            role
        });

        await newRequest.save();
        res.status(201).json({ message: "Sponsorship request sent successfully", request: newRequest });
    } catch (error) {
        res.status(500).json({ message: "Error sending sponsorship request" });
    }
};
//  GET API: Fetch all sponsorship requests
exports.getAllSponsorshipRequests = async (req, res) => {
    try {
        const requests = await SponsorshipRequest.find().sort({ createdAt: -1 });
        res.status(200).json({ requests });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching sponsorship requests" });
    }
};

// Update Sponsorship Request Read Status
exports.updateSponsorshipRequestReadStatus = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { read } = req.body;

        if (typeof read !== "boolean") {
            return res.status(400).json({ message: "Invalid read status format" });
        }

        const request = await SponsorshipRequest.findByIdAndUpdate(
            requestId,
            { read },
            { new: true }
        );

        if (!request) {
            return res.status(404).json({ message: "Sponsorship request not found" });
        }

        res.status(200).json({ message: "Read status updated", request });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating read status" });
    }
};
