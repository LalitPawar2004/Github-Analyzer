# 🚀 GitHub Profile Analyzer API

A backend service that analyzes GitHub user profiles using the GitHub public API and stores useful insights in a MySQL database.

---

## 📋 Features

- Fetch public GitHub profile data by username
- Calculate extra insights (total stars, forks, top language)
- Store analysis results in MySQL
- Retrieve all analyzed profiles
- Retrieve single profile data
- Duplicate analysis prevention
- Rate limit aware error handling

---

## 🛠 Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **GitHub API** - Third-party data source
- **Axios** - HTTP client

---

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd github-profile-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=github_analyzer
   GITHUB_API_URL=https://api.github.com
   ```

4. **Set up the database**
   
   Run the following SQL in your MySQL client:
   ```sql
   CREATE DATABASE IF NOT EXISTS github_analyzer;
   USE github_analyzer;

   CREATE TABLE IF NOT EXISTS profiles (
     id INT AUTO_INCREMENT PRIMARY KEY,
     username VARCHAR(100) NOT NULL UNIQUE,
     name VARCHAR(255),
     bio TEXT,
     avatar_url VARCHAR(500),
     public_repos INT DEFAULT 0,
     followers INT DEFAULT 0,
     following INT DEFAULT 0,
     total_stars INT DEFAULT 0,
     total_forks INT DEFAULT 0,
     top_language VARCHAR(100),
     created_at_github DATETIME,
     analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     INDEX idx_username (username)
   );
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

   Server runs on `http://localhost:3000`

---

## 📡 API Endpoints

### Base URL
```
http://localhost:3000/api
```

### 1. Analyze & Save Profile
```
POST /api/profiles/:username
```
Analyzes a GitHub profile and stores the insights.

**Response (201):**
```json
{
  "success": true,
  "message": "Profile analyzed successfully",
  "data": {
    "id": 1,
    "username": "torvalds",
    "name": "Linus Torvalds",
    "bio": "Creator of Linux and Git",
    "avatar_url": "https://avatars.githubusercontent.com/u/1024025",
    "public_repos": 7,
    "followers": 204000,
    "following": 0,
    "total_stars": 15000,
    "total_forks": 12000,
    "top_language": "C",
    "created_at_github": "2011-09-03T15:37:22.000Z"
  }
}
```

### 2. Get All Profiles
```
GET /api/profiles
```
Returns all previously analyzed profiles.

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [...]
}
```

### 3. Get Single Profile
```
GET /api/profiles/:username
```
Returns a specific analyzed profile.

**Response (200):**
```json
{
  "success": true,
  "data": {...}
}
```

### Error Responses
```json
// 404 - User not found on GitHub
{ "success": false, "message": "GitHub user not found" }

// 409 - Profile already analyzed
{ "success": false, "message": "Profile already analyzed" }

// 429 - Rate limit exceeded
{ "success": false, "message": "GitHub API rate limit exceeded. Try again later." }
```

---

## 🗄 Database Schema

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment ID |
| username | VARCHAR(100) | GitHub username (unique) |
| name | VARCHAR(255) | Display name |
| bio | TEXT | Profile bio |
| avatar_url | VARCHAR(500) | Profile picture URL |
| public_repos | INT | Public repository count |
| followers | INT | Follower count |
| following | INT | Following count |
| total_stars | INT | Stars across all repos |
| total_forks | INT | Forks across all repos |
| top_language | VARCHAR(100) | Most used language |
| created_at_github | DATETIME | GitHub join date |
| analyzed_at | TIMESTAMP | When profile was analyzed |

---

## 📁 Project Structure

```
github-profile-analyzer/
├── src/
│   ├── config/
│   │   └── db.js              # Database connection
│   ├── controllers/
│   │   └── profileController.js # Request handlers
│   ├── routes/
│   │   └── profileRoutes.js    # API routes
│   ├── services/
│   │   └── githubService.js    # GitHub API calls
│   └── index.js                # Server entry point
├── .env                        # Environment variables
├── .gitignore
├── package.json
└── README.md
```

---

## 🧪 Testing

Test the API using curl or Postman:

```bash
# Analyze a profile
curl -X POST http://localhost:3000/api/profiles/torvalds

# Get all profiles
curl http://localhost:3000/api/profiles

# Get single profile
curl http://localhost:3000/api/profiles/torvalds
```
