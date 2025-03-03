const express = require('express');
const router = express.Router();
const appointmentController = require('../Controllers/appointmentController');
const { authMiddleware } = require('../Middlewares/middleware');

router.get('/subscribers-slots', authMiddleware, appointmentController.getSubscribersAndSlots);
router.post('/create-appointment', authMiddleware, appointmentController.createAppointment);
router.get('/appointments', authMiddleware, appointmentController.getAppointments);

module.exports = router;
