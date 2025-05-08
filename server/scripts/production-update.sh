#!/bin/bash

# Script to update the authentication system on the production server
# This script should be run on the production server

# Navigate to the project directory
cd /path/to/production/gym-tracker

# Make sure we have the latest code
git pull

# Set the MongoDB URI for production
export MONGODB_URI="mongodb+srv://jasonnicholaspovey:XrrKaWVfdWuLGTTw@workitout.rjrut.mongodb.net/?retryWrites=true&w=majority&appName=WorkItOut"
export NODE_ENV="production"

# Run the update script
echo "Running authentication system update script..."
node server/scripts/update-auth-system.js

echo "Update complete!"
