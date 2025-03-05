# Gym Tracker Backend API

This is the backend API for the Gym Tracker application, built with Node.js, Express, and MongoDB.

## Features

- RESTful API for managing workouts, exercises, and user data
- MongoDB database integration
- CORS support for frontend integration
- Production-ready with security headers and compression

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local instance or MongoDB Atlas)

### Installation

1. Clone the repository
2. Navigate to the server directory
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on `.env.example`
5. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

- `GET /api/exercises` - Get all exercises
- `POST /api/exercises` - Create a new exercise
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/completed-workouts` - Get all completed workouts
- `POST /api/completed-workouts` - Create a new completed workout
- `GET /api/workout-templates` - Get all workout templates
- `POST /api/workout-templates` - Create a new workout template

## Deployment

### Deploying to Render

1. Create a new Web Service on [Render](https://render.com/)
2. Connect your GitHub repository
3. Select the server directory as the root directory
4. Set the build command to `npm install`
5. Set the start command to `npm start`
6. Add environment variables from your `.env` file
7. Deploy the service

### Setting Up MongoDB Atlas

1. Create a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
2. Create a new cluster
3. Set up database access (username and password)
4. Set up network access (IP whitelist)
5. Get your connection string
6. Add the connection string to your environment variables on Render

## Connecting Frontend to Backend

Update your frontend API calls to use the deployed backend URL:

```javascript
// In your frontend API service
const API_URL = process.env.REACT_APP_API_URL || 'https://your-render-backend-url.onrender.com';
```

## License

MIT
