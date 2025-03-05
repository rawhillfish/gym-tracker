# Gym Tracker

A React application for tracking gym workouts, managing exercises, and viewing workout history.

**Live Demo:** [https://rawhillfish.github.io/gym-tracker](https://rawhillfish.github.io/gym-tracker)

## Features

- Track multiple workouts simultaneously for different users
- Color-coded workout cards for easy user identification
- Pre-fill weights based on previous workouts with set-specific weight tracking
- Real-time workout timer to track session duration
- View workout history with detailed exercise information
- Manage exercises and workout templates

## Technology Stack

- **Frontend**: React, Material-UI
- **Backend**: Node.js, Express
- **Database**: MongoDB

## Installation

1. Clone the repository
   ```
   git clone https://github.com/YOUR_USERNAME/gym-tracker.git
   cd gym-tracker
   ```

2. Install frontend dependencies
   ```
   npm install
   ```

3. Install backend dependencies
   ```
   cd server && npm install
   ```

4. Start the backend server
   ```
   cd server && npm start
   ```

5. In a new terminal, start the frontend development server
   ```
   npm start
   ```

6. Open [http://localhost:3000](http://localhost:3000) to view the application

## Usage

### Track Workout
- Select a workout template and user
- Record sets, reps, and weights for each exercise
- Track workout duration with the built-in timer
- Complete exercises as you finish them

### History
- View completed workouts
- Filter by user, date, or workout type
- Analyze performance over time

### Management
- Create and edit exercise definitions
- Build workout templates
- Manage users and their color coding

## Development

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Available Scripts

- `npm start` - Run the app in development mode
- `npm test` - Launch the test runner
- `npm run build` - Build the app for production

## Deployment

### Netlify Deployment (Recommended)

This project is configured for easy deployment on Netlify.

#### Option 1: Deploy via Netlify UI

1. Push your code to GitHub
2. Go to [Netlify](https://app.netlify.com/) and sign up/login
3. Click "New site from Git"
4. Select GitHub and authorize Netlify
5. Select your repository
6. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
7. Click "Deploy site"

#### Option 2: Deploy via Netlify CLI

1. Install Netlify CLI (already added to project dependencies)
2. Login to Netlify:
   ```
   npx netlify login
   ```
3. Initialize your site:
   ```
   npx netlify init
   ```
4. Deploy your site:
   ```
   npx netlify deploy --prod
   ```

### Backend Deployment

For the backend to work with your deployed frontend:

1. Deploy your Express server to a service like Render, Railway, or Heroku
2. Set up MongoDB Atlas for your database
3. Update your frontend API endpoints to point to your deployed backend URL

### Other Deployment Options

The application can also be deployed to:
- Vercel
- GitHub Pages
- Render

## License

MIT
