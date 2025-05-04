# Populate Completed Workouts Script

This script generates historical workout data for the Gym Tracker application by creating completed workouts based on the existing workout templates.

## Purpose

The script serves several purposes:

1. **Testing Weight Pre-filling**: Generates historical workout data that can be used to test the weight pre-filling functionality.
2. **UI Testing**: Provides data to test charts, history views, and other UI components that display workout history.
3. **Development**: Creates a realistic dataset for development and testing without manually entering workouts.
4. **Demo Data**: Generates demo data that can be used to showcase the application's features.

## Features

- Creates 10 completed workouts for each workout template (40 total for the default 4 templates)
- Distributes workouts over the last 6 months with random dates
- Assigns workouts to different users in the system
- Generates realistic workout durations (30-90 minutes)
- Creates sets with realistic weights based on exercise type
- Preserves template IDs and exercise IDs for weight pre-filling functionality

## Usage

Run the script from the server directory:

```bash
cd /home/jasonpovey/repos/gym-tracker/server
node scripts/populate-completed-workouts.js
```

## Requirements

- MongoDB must be running
- The database must be seeded with users, exercises, and workout templates (run `seed.js` first if needed)
- The `.env` file must be configured with the correct MongoDB URI

## Customization

You can modify the script to:

- Change the number of workouts per template (default: 10)
- Adjust the time range (default: last 6 months)
- Modify the weight ranges for different exercises
- Change how reps are generated

## Data Generated

For each completed workout, the script generates:

- Template ID and name
- Start and end times (with realistic duration)
- User assignment
- Exercises with completed sets
- Weight and rep values for each set

## Notes

- The script clears all existing completed workouts before generating new ones
- Exercise IDs and template IDs are preserved to ensure weight pre-filling works correctly
- Workouts are sorted chronologically (oldest first)
