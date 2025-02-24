const AdvertisementRequest = require('../Models/advertisementRequest');
const Advertisement = require('../Models/advertisement');
const mongoose = require('mongoose');
// // Create an advertisement request

exports.createAdRequest = async (req, res) => {
    try {
        const { formData } = req.body;
        
        if (!formData) {
            return res.status(400).json({ message: "Invalid request body format" });
        }

        // Map frontend fields to backend expected fields
        const advertisementId = formData.tierId// Map tierId -> advertisementId
        const requestMessage = formData.message // Map message -> requestMessage
        
        const userId = req.user.id;  // Assuming user is authenticated
        const userName = req.user.userName;
        const email = req.user.email;
        const role = req.user.role;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(advertisementId)) {
            return res.status(400).json({ message: "Invalid advertisement ID format" });
        }

        // Check if advertisement exists
        const advertisement = await Advertisement.findById(advertisementId);
        if (!advertisement) {
            return res.status(404).json({ message: "Advertisement not found" });
        }

        // Check if a request from the same user already exists
        const existingRequest = await AdvertisementRequest.findOne({ 
            userId: new mongoose.Types.ObjectId(userId), 
            advertisementId: new mongoose.Types.ObjectId(advertisementId) 
        });
        if (existingRequest) {
            return res.status(400).json({ message: "You have already sent a request for this advertisement" });
        }

        // Create the advertisement request
        const adRequest = new AdvertisementRequest({
            advertisementId,
            userId,
            userName,
            email,
            requestMessage,
            role
        });

        await adRequest.save();
        res.status(201).json({ message: "Advertisement request sent successfully", request: adRequest });

    } catch (error) {
        console.error("Error Details:", error);  // Log full error to debug
        res.status(500).json({ message: "Error sending advertisement request", error: error.message });
    }
    
};

// exports.createAdRequest = async (req, res) => {
//     try {
//         const { advertisementId, userName, email, requestMessage } = req.body;

//         if (!advertisementId || !userName || !email || !requestMessage) {
//             return res.status(400).json({ message: "All fields are required" });
//         }

//         // Ensure the advertisement exists
//         const advertisement = await Advertisement.findById(advertisementId);
//         if (!advertisement) {
//             return res.status(404).json({ message: "Advertisement not found" });
//         }

//         // Create a new advertisement request
//         const adRequest = new AdvertisementRequest({
//             advertisementId,
//             userName,
//             email,
//             requestMessage
//         });

//         await adRequest.save();
//         res.status(201).json({ message: "Advertisement request sent successfully" });

//     } catch (error) {
//         res.status(500).json({ message: "Error sending advertisement request", error });
//     }
// };

// Get all advertisement requests
exports.getAllAdRequests = async (req, res) => {
    try {
        const requests = await AdvertisementRequest.find().populate('advertisementId', 'title description image');
        res.status(200).json({ requests });
    } catch (error) {
        res.status(500).json({ message: "Error fetching advertisement requests", error });
    }
};
