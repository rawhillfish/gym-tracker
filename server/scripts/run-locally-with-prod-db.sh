#!/bin/bash

# Script to run the update-auth-system.js script locally but connecting to the production database
# This allows you to update the production database without needing to deploy the script

# Set the MongoDB URI for production
export MONGODB_URI="mongodb+srv://jasonnicholaspovey:XrrKaWVfdWuLGTTw@workitout.rjrut.mongodb.net/?retryWrites=true&w=majority&appName=WorkItOut"
export NODE_ENV="production"

# Run the update script
echo "Running authentication system update script against PRODUCTION database..."
echo "This will update user credentials on the PRODUCTION server."
echo "Are you sure you want to continue? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
  node server/scripts/update-auth-system.js
  echo "Update complete!"
else
  echo "Operation cancelled."
fi
