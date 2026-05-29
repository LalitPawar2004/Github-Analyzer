const express = require('express');
const router = express.Router();
const { analyzeProfile, getAllProfiles, getProfile } = require('../controllers/profileController');

// Analyze & save a GitHub profile
router.post('/profiles/:username', analyzeProfile);

// Get all analyzed profiles
router.get('/profiles', getAllProfiles);

// Get single profile by username
router.get('/profiles/:username', getProfile);

module.exports = router;