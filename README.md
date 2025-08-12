[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=20067863&assignment_repo_type=AssignmentRepo)

# News Aggregator API

A RESTful API for a personalized news aggregator built with Node.js and Express.js. Features user authentication, preferences, news fetching from an external API, caching, marking articles as read/favorite, and search functionality.

## Features
- User registration and login with JWT authentication
- User preferences for news categories
- Fetch news from NewsAPI (with in-memory caching)
- Mark articles as read or favorite
- Retrieve read/favorite articles
- Search news articles by keyword
- Periodic cache updates

## Installation

1. **Clone the repository:**
   ```sh
   git clone <repo-url>
   cd news-aggregator
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Set environment variables:**
   - `NEWS_API_KEY` (optional, for real news fetching)
   - `JWT_SECRET` (optional, for JWT signing)

   Example (Windows PowerShell):
   ```sh
   $env:NEWS_API_KEY="your_newsapi_key"
   $env:JWT_SECRET="your_jwt_secret"
   ```
4. **Start the server:**
   ```sh
   node app.js
   ```

## API Endpoints

### Auth & User
- `POST /users/signup` — Register a new user
  - Body: `{ name, email, password, preferences (array) }`
- `POST /users/login` — Login and receive JWT
  - Body: `{ email, password }`
- `GET /users/preferences` — Get user preferences (JWT required)
- `PUT /users/preferences` — Update preferences (JWT required)
  - Body: `{ preferences: [ ... ] }`

### News
- `GET /news` — Get news articles based on user preferences (JWT required)
- `POST /news/:id/read` — Mark an article as read (JWT required)
- `POST /news/:id/favorite` — Mark an article as favorite (JWT required)
- `GET /news/read` — Get all read articles (JWT required)
- `GET /news/favorites` — Get all favorite articles (JWT required)
- `GET /news/search/:keyword` — Search news articles by keyword (JWT required)

**All protected endpoints require:**
```
Authorization: Bearer <JWT token>
```

## Testing

Run the test suite:
```sh
npm test
```
All tests should pass.

## Notes
- If `NEWS_API_KEY` is not set, the API returns dummy news data for development/testing.
- Caching is in-memory and resets on server restart.

---

Feel free to extend the API or connect to a persistent database for production use.
