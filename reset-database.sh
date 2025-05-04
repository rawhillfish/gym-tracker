#!/bin/bash

# Script to reset the database and re-seed with initial data
echo "Starting database reset process..."
echo "Running seed script to update exercises, users, and workout templates..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js to continue."
    exit 1
fi

# Navigate to the server directory and run the seed script
cd "$(dirname "$0")/server"
node seed.js

# Check if the script ran successfully
if [ $? -eq 0 ]; then
    echo "Database reset completed successfully!"
    echo "The database has been cleared and re-seeded with initial data."
else
    echo "Error: Database reset failed. Please check the error messages above."
    exit 1
fi

exit 0
