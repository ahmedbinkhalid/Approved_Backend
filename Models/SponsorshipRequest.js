const mongoose = require("mongoose");

const SponsorshipRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  userName: { type: String, required: true },
  email: { type: String, required: true },
  tierId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Sponsorship",
  },
  tier: { type: String, required: true }, // Tier name (Bronze, Silver, Gold, etc.)
  message: { type: String },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  role:{
    type: String,
    required: true
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SponsorshipRequest", SponsorshipRequestSchema);
