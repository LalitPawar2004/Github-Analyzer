const axios = require('axios');
require('dotenv').config();

const GITHUB_API = process.env.GITHUB_API_URL || 'https://api.github.com';

async function fetchGitHubProfile(username) {
  try {
    // Validate username format
    if (!username || username.trim().length === 0) {
      throw new Error('Username is required');
    }

    // Fetch user profile
    const { data: user } = await axios.get(`${GITHUB_API}/users/${username}`, {
      headers: {
        'User-Agent': 'github-profile-analyzer',
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    // Fetch user repositories for extra insights
    const { data: repos } = await axios.get(
      `${GITHUB_API}/users/${username}/repos?per_page=100&sort=updated`,
      {
        headers: {
          'User-Agent': 'github-profile-analyzer',
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    // Calculate total stars and forks
    let totalStars = 0;
    let totalForks = 0;
    const languageCount = {};

    repos.forEach((repo) => {
      // Only count non-fork repos for language stats
      if (!repo.fork) {
        totalStars += repo.stargazers_count;
        totalForks += repo.forks_count;

        if (repo.language) {
          languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
        }
      }
    });

    // Find most used language
    let topLanguage = null;
    let maxCount = 0;
    for (const [lang, count] of Object.entries(languageCount)) {
      if (count > maxCount) {
        maxCount = count;
        topLanguage = lang;
      }
    }

    return {
      username: user.login,
      name: user.name,
      bio: user.bio,
      avatar_url: user.avatar_url,
      public_repos: user.public_repos,
      followers: user.followers,
      following: user.following,
      total_stars: totalStars,
      total_forks: totalForks,
      top_language: topLanguage,
      created_at_github: user.created_at,
    };
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('GitHub user not found');
      }
      if (error.response.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Try again later.');
      }
    }
    if (error.message === 'Username is required') {
      throw error;
    }
    throw new Error('Failed to fetch GitHub profile');
  }
}

module.exports = { fetchGitHubProfile };