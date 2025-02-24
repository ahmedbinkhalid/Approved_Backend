// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const getCourses = require('../Controllers/userGetCourses'); // Import the user controller
const { authMiddleware } = require('../Middlewares/middleware'); // Assuming you have an auth middleware

// Get courses from subscribed coaches
router.get('/courses', authMiddleware, getCourses.getCoursesFromSubscribedCoaches);

// Get private course 
router.get('/get-privateCourses', authMiddleware, getCourses.getPrivateCoursesFromSubscribedCoaches);
// Get playlists associated with a specific course
router.get('/courses/:courseId/playlists', authMiddleware, getCourses.getPlaylistsForCourse);

// Get videos under a specific playlist
router.get('/playlists/:playlistId/videos', authMiddleware, getCourses.getVideosInPlaylist);

// Buy course with game id 
router.post('/buy-Course', authMiddleware, getCourses.buyCourse);

// Get purchased Courses
router.get('/getPurchasedCourses', authMiddleware, getCourses.getPurchasedCourses);

module.exports = router;