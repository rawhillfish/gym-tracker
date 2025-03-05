# Gym Tracker

A React application for tracking gym workouts, managing exercises, and viewing workout history.

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

The application can be deployed to various platforms:

- GitHub Pages
- Vercel
- Netlify
- Render

See the [deployment section](#deployment) for more details.

## License

MIT
