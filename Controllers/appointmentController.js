const Appointment = require('../Models/appointment');
const User = require('../Models/user'); // Assuming user model is named 'user'

// API to get available subscribers and time slots
exports.getSubscribersAndSlots = async (req, res) => {
    const coachId = req.user.id; // Logged-in coach
    const { date } = req.query; // YYYY-MM-DD format

    try {
        const subscribers = await User.find({
            subscribedCoaches: { $elemMatch: { _id: coachId } }
        }).select('userName _id');

        // Get booked slots for the day
        const bookedSlots = await Appointment.find({ coachId, date }).select('timeSlot');

        // List of all possible 1-hour slots
        const allSlots = [
            "08:00 AM - 09:00 AM", "09:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", "11:00 AM - 12:00 PM",
            "12:00 PM - 01:00 PM", "01:00 PM - 02:00 PM", "02:00 PM - 03:00 PM", "03:00 PM - 04:00 PM",
            "04:00 PM - 05:00 PM", "05:00 PM - 06:00 PM", "06:00 PM - 07:00 PM", "07:00 PM - 08:00 PM"
        ];

        // Filter available slots
        const bookedSlotSet = new Set(bookedSlots.map(slot => slot.timeSlot));
        const availableSlots = allSlots.filter(slot => !bookedSlotSet.has(slot));

        res.status(200).json({ subscribers, availableSlots });
    } catch (error) {
        res.status(500).json({ message: "Error fetching data." });
    }
};

// API to set an appointment
exports.createAppointment = async (req, res) => {
    const coachId = req.user.id;
    const { userId, date, timeSlot } = req.body;

    try {
        const existingAppointment = await Appointment.findOne({ coachId, date, timeSlot });
        if (existingAppointment) {
            return res.status(400).json({ message: "Time slot already booked." });
        }

        const newAppointment = new Appointment({
            coachId,
            userId,
            date,
            timeSlot,
        });

        await newAppointment.save();
        res.status(201).json({ message: "Appointment created successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error creating appointment." });
    }
};

// API to fetch appointments for calendar display
exports.getAppointments = async (req, res) => {
    const userId = req.user.id;
    const role = req.user.role;

    try {
        let query = {};
        if (role === 'coach') {
            query.coachId = userId;
        } else if (role === 'user') {
            query.userId = userId;
        }

        const appointments = await Appointment.find(query).populate('userId', 'userName').populate('coachId', 'userName');

        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching appointments." });
    }
};
