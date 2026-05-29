const pool = require('../config/db');
const { fetchGitHubProfile } = require('../services/githubService');

// POST /api/profiles/:username - Analyze and save a GitHub profile
const analyzeProfile = async (req, res) => {
  try {
    const { username } = req.params;

    // Validate username
    if (!username || username.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Username is required',
      });
    }

    // Check if profile already exists
    const [existing] = await pool.query('SELECT id, analyzed_at FROM profiles WHERE username = ?', [
      username,
    ]);

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Profile already analyzed',
        data: {
          id: existing[0].id,
          analyzed_at: existing[0].analyzed_at,
          tip: 'Use GET /api/profiles/' + username + ' to view the data',
        },
      });
    }

    // Fetch data from GitHub
    const profileData = await fetchGitHubProfile(username);

    // Save to database
    const [result] = await pool.query(
      `INSERT INTO profiles 
       (username, name, bio, avatar_url, public_repos, followers, following, 
        total_stars, total_forks, top_language, created_at_github) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        profileData.username,
        profileData.name,
        profileData.bio,
        profileData.avatar_url,
        profileData.public_repos,
        profileData.followers,
        profileData.following,
        profileData.total_stars,
        profileData.total_forks,
        profileData.top_language,
        profileData.created_at_github,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Profile analyzed successfully',
      data: { id: result.insertId, ...profileData },
    });
  } catch (error) {
    const errorMap = {
      'GitHub user not found': 404,
      'GitHub API rate limit exceeded. Try again later.': 429,
    };

    const statusCode = errorMap[error.message] || 500;
    res.status(statusCode).json({ success: false, message: error.message });
  }
};

// GET /api/profiles - Get all analyzed profiles
const getAllProfiles = async (req, res) => {
  try {
    const [profiles] = await pool.query(
      'SELECT id, username, name, avatar_url, followers, public_repos, top_language, analyzed_at FROM profiles ORDER BY analyzed_at DESC'
    );

    res.json({
      success: true,
      count: profiles.length,
      data: profiles,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profiles' });
  }
};

// GET /api/profiles/:username - Get single profile
const getProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const [profiles] = await pool.query('SELECT * FROM profiles WHERE username = ?', [username]);

    if (profiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
        tip: 'Use POST /api/profiles/' + username + ' to analyze it first',
      });
    }

    res.json({ success: true, data: profiles[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

module.exports = { analyzeProfile, getAllProfiles, getProfile };