# Gym Tracker - Change Log

This document tracks all significant changes made to the Gym Tracker application.

## 2025-05-04

### Bug Fixes
- Fixed issue with workout template editing where changing reps for one exercise would affect all exercises
  - Updated the server-side PUT route to handle nested arrays properly
  - Improved the client-side template data handling to create proper deep copies
  - Added detailed logging to track template updates
  - Fixed handleEditTemplate to create deep copies of exercises when editing a template
  - Enhanced updateExerciseParams to use a more robust approach for updating specific exercises
  - Ensured each exercise has a unique ID by adding timestamp-based IDs when needed
  - Added comprehensive debug logging throughout the template editing process
  - Fixed object reference issues by creating completely new objects for each exercise
  - Improved error handling to prevent updates when exercise IDs cannot be found
  - Reverted to using map with spread operator for updating exercises to fix issues with editing reps and sets
  - Ensured proper ID handling throughout the exercise editing process
  - Used JSON.parse(JSON.stringify()) for deep cloning to prevent reference issues

- Fixed ESLint errors in ActiveWorkout.js
  - Moved helper functions (findTemplateIdByName and findExerciseIdByName) to component level
  - Added proper scoping for helper functions to ensure they're available throughout the component
  - Restored missing functions and fixed their implementation

### Data Management
- Updated seed data and reset script with current workout templates
  - Replaced default workout templates (Push Day, Pull Day, Leg Day) with the current 4 saved templates
  - Updated both resetDatabase.js script and seed.js to use the same templates
  - Maintained proper exercise references and IDs in the templates
  - Ensured consistent naming convention for templates (1/4, 2/4, 3/4, 4/4)
  - Preserved all exercise details including sets, reps, and categories

- Updated production database with current workout templates
  - Created a custom reset-production-templates.js script to update production templates
  - Deleted all existing workout templates in the production database
  - Created the 4 new workout templates with proper exercise references
  - Ensured all exercise IDs are correctly mapped to production exercise IDs
  - Maintained consistent naming convention and exercise details
  - Verified successful creation of all templates in production

### Deployment
- Deployed application to production:
  - Frontend deployed to Netlify
  - Backend deployed to Render
  - Database migrated to MongoDB Atlas production instance
  - Updated environment variables for production settings
  - Verified application functionality in production environment
- Created database update scripts for production:
  - Added `scripts/update-production-db.js` with interactive confirmation for manual updates
  - Added `scripts/update-production-db-noninteractive.js` for automated CI/CD pipeline updates
  - Scripts preserve existing user data and workout history
  - Update exercises with latest categories and names
  - Update workout templates with latest exercise references
  - Update completed workouts to reference new exercise IDs

## 2025-05-05

### Deployment
- Updated update-production-db.js script to use the 4 current workout templates:
  - Replaced the default templates (Push Day, Pull Day, Leg Day) with the current 4 templates
  - Added the findExerciseIdByName helper function for consistent exercise ID mapping
  - Ensured template descriptions and exercise categories are properly maintained
  - Improved the template update logic to handle the new template structure

## 2025-04-25

### Exercise Management
- Enhanced ExerciseManager component with improved UI and functionality:
  - Added separate sections for active and retired exercises
  - Improved visual distinction between active and retired exercises
  - Added colored headers to clearly differentiate sections

## 2025-04-24

### Branding
- Updated app metadata for better user experience:
  - Changed manifest.json to use "Work It Out" as the app name
  - Updated meta description in index.html
  - Prepared for custom favicon and app icons
  - Note: To complete the branding update, manually replace favicon.ico, logo192.png, and logo512.png with the pixelated cyclist image

### User Management
- Enhanced User Manager UI with separate sections:
  - Added dedicated section for active users with count indicator
  - Added dedicated section for retired users with count indicator
  - Removed toggle switch in favor of always showing both sections
  - Added colored headers to clearly differentiate sections
- Added hard delete functionality for users:
  - Created new backend endpoint for permanent deletion
  - Added permanent delete button in the retired users section
  - Implemented safeguards to prevent permanent deletion of users with associated workouts
  - Added confirmation dialog before permanent deletion
- Updated terminology for better clarity:
  - Changed "soft deletion" to "retiring" throughout the UI
  - Updated function names and variables to reflect the new terminology
  - Maintained "hard deletion" terminology for permanent deletion

### Exercise Management
- Enhanced Exercise Manager UI with separate sections:
  - Added dedicated section for active exercises with count indicator
  - Added dedicated section for retired exercises with count indicator
  - Removed toggle switch in favor of always showing both sections
  - Improved visual distinction between active and retired exercises
  - Added colored headers to clearly differentiate sections
- Improved organization of active exercises:
  - Grouped exercises by category for easier navigation
  - Added category headers with count indicators
  - Displayed only non-empty categories
  - Applied consistent styling to category headers
  - Added color coding for different exercise categories
  - Implemented collapsible category sections with expand/collapse functionality
- Updated exercise categories for better organization:
  - Split 'Legs' into specific subcategories: 'Legs (Quads)', 'Legs (Hamstring)', 'Legs (Glutes)', 'Legs (Calves)'
  - Used a single 'Arms' category for simplicity
  - Ordered categories alphabetically with 'Other' at the bottom
  - Updated both frontend and backend category definitions
  - Applied distinct color coding to each category for visual differentiation
- Enhanced the UI of active exercises:
  - Redesigned category sections with Paper components and subtle borders
  - Improved category headers with better typography and pill-shaped count badges
  - Added hover effects and transitions for better interactivity
  - Displayed exercise details in a more visually appealing format
  - Improved button styling and visual hierarchy
  - Enhanced overall spacing and layout for better readability
- Improved visual distinction between active and retired exercises:
  - Added color-coded backgrounds and borders (blue for active, red for retired)
  - Enhanced section headers with more prominent styling and separate count badges
  - Applied distinct styling to retired exercises with light red backgrounds and badges
  - Added dedicated retirement date badge to retired exercises
  - Used color-coded action buttons (blue/red for active, green/red for retired)
  - Increased visual hierarchy to make sections immediately distinguishable
- Added retire/restore functionality for workout templates:
  - Implemented soft deletion (retire) for workout templates
  - Created separate sections for active and retired templates
  - Added ability to restore retired templates
  - Added permanent deletion option for retired templates
  - Applied consistent styling with exercise management
  - Enhanced UI with color-coded sections and improved typography
- Improved workout template management interface:
  - Hidden template creation form behind a "+ Create Workout" button
  - Cleaner interface focused on displaying existing templates
  - Improved form visibility control for better user experience
  - Enhanced editing workflow with proper cancel functionality
  - Simplified template saving logic
  - Positioned "+ Create Workout" button at top right for consistency with user management
  - Organized exercise selection dialog by category with collapsible sections
  - Added search functionality to filter exercises across categories
  - Enhanced visual consistency with color-coded categories and count indicators
  - Fixed API path inconsistencies to ensure proper template saving
  - Improved error handling and debugging for template operations
- Updated seed data with more specific exercises:
  - Added more targeted exercises for each muscle group
  - Assigned exercises to appropriate categories
  - Updated workout templates to use the new exercises
  - Standardized default rep count to 10 for all exercises
- Fixed issue with exercises not displaying in separate sections:
  - Updated API response handling to support different response formats
  - Enhanced error handling and logging for better debugging
  - Improved state management for active and retired exercise lists
- Improved styling for retired exercises:
  - Removed strikethrough styling from retired exercises for better readability
  - Removed red 'Retired' chip label for cleaner appearance
  - Made font color consistent between active and retired exercises
  - Maintained visual distinction through separate sections with colored headers
- Added hard delete functionality for exercises:
  - Created new backend endpoint for permanent deletion
  - Added permanent delete button in the retired exercises section
  - Implemented safeguards to prevent accidental permanent deletions
  - Added confirmation dialog before permanent deletion
- Updated terminology for better clarity:
  - Changed "soft deletion" to "retiring" throughout the UI
  - Updated function names and variables to reflect the new terminology
  - Maintained "hard deletion" terminology for permanent deletion

### Code Quality
- Fixed syntax error in ActiveWorkout.js with incorrect closing parenthesis

## 2025-04-23

### Code Quality
- Fixed missing calculateDuration function in ActiveWorkout.js
- Fixed ESLint warnings across multiple files:
  - Removed unused imports and variables
  - Fixed React Hook dependency arrays

## 2025-04-22

### Exercise Management
- Enhanced exercise management with retiring features:
  - Added toggle to show/hide retired exercises
  - Implemented UI for displaying retired exercises with visual indicators
  - Added restore functionality for retired exercises
  - Updated API service to support exercise restoration
  - Fixed issue with toggle switch not properly refreshing the exercises list
  - Fixed issue with exercise deletion to properly handle retiring
  - Enhanced logging for debugging retiring functionality

## 2025-04-21

### UI Changes
- Changed browser tab title from "React App" to "Work It Out" in public/index.html

### Database and Model Changes
- Implemented hybrid approach for exercise management:
  - Added ID references in CompletedWorkout model to properly reference Exercise documents
  - Implemented retiring for exercises to preserve historical workout data
  - Updated controllers to handle the new data structure
  - Created database clearing and re-seeding script

### User Management
- Added comprehensive user management functionality:
  - Updated User model to support retiring
  - Enhanced user routes to support CRUD operations with retiring
  - Created UserManager component for the frontend
  - Added Users tab to the Management page
  - Updated API service to support user management operations

### Code Quality
- Fixed ESLint warnings across multiple files:
  - Removed unused imports and variables
  - Fixed React Hook dependency arrays
  - Fixed missing calculateDuration function in ActiveWorkout.js
  - Fixed syntax error in ActiveWorkout.js

## 2025-05-06

### Authentication
- Added user authentication functionality:
  - Created JWT-based authentication system for secure user access
  - Implemented Auth model with password encryption using bcrypt
  - Added authentication routes for register, login, and password management
  - Created protected route middleware to secure API endpoints
  - Updated environment configuration to support JWT tokens
  - Designed authentication context for global state management
  - Added token handling in API service for authenticated requests
  - Created Login and Registration pages with form validation
  - Added user profile page with password change functionality
  - Created landing page for unauthenticated users with features overview
  - Implemented redirection to landing page for unauthenticated users
  - Updated Navbar to display user information and authentication options
  - Implemented protected routes to secure management pages
  - Added login credentials for existing users (Jason and Andrew)
  - Updated database seeding to include authentication records
  - Removed ability to add users from User Management tab (users can only be created through registration)

### User Interface Improvements
- Added sorting to workout templates across the application
  - Templates are now sorted alphabetically by name when starting a workout
  - Implemented sorting for templates loaded from both the database and localStorage
  - Added sorting to the WorkoutBuilder page for both active and retired templates
  - Improved user experience by making it easier to find specific templates
  - Ensured consistent sorting behavior throughout the application

- Cleaned up Active Workout page
  - Removed "Load Sample Data" and "Clear Cache" buttons
  - Removed sample data generation functionality
  - Eliminated debug logging and test code
  - Simplified the workout data loading logic
  - Removed localStorage fallback to sample data
  - Streamlined the UI for a cleaner user experience
  - Kept helper functions for finding template and exercise IDs to maintain functionality

- Improved button UI in Active Workout page
  - Replaced text buttons with icon buttons for a cleaner interface
  - Added tooltips to make button functions clear
  - Updated "Mark Complete" buttons to use checkmark icons
  - Updated "Remove" buttons to use delete icons
  - Maintained consistent color scheme (primary for complete, error for remove)
  - Reduced visual clutter while maintaining functionality
  - Moved "Remove Exercise" button to the left of the exercise name for better organization
  - Kept exercise name aligned to the left of the container for better readability
  - Moved "Add Set" button below the last set for better logical flow
  - Moved "Pre-filled from history" indicator to the right of the exercise name for better visibility
  - Moved "Remove Set" button to the left of the set number for better organization
  - Created consistent placement of remove buttons (always on the left)

- Enhanced workout card layout
  - Reorganized the workout card with a clear visual hierarchy
  - Improved workout header to show "Workout: {Template Name} - {Username}"
  - Combined template name and username into a single header line
  - Positioned the large workout timer below the header
  - Increased spacing around the timer for better visual prominence
  - Placed the "Cancel Workout" button below the timer
  - Made the timer twice as large to emphasize workout duration
  - Improved the timer styling with larger font and better spacing
  - Enhanced the timer icon for better visibility
  - Centered all elements for a cleaner, more focused layout
  - Moved the "Add Exercise" button to two locations for better accessibility:
    - At the top of the exercise list for quick access
    - Above the "Finish Workout" button for adding final exercises
  - Added a second "Add Exercise" button above the "Finish Workout" button
  - Improved overall workout card organization and visual flow

- Added exercise reordering functionality
  - Added "Move Up" and "Move Down" arrow buttons next to each exercise
  - Implemented the ability to change exercise order during a workout
  - Positioned reordering controls to the right of the exercise name
  - Added proper disabled states when an exercise is at the top or bottom
  - Included tooltips for better usability
  - Maintained exercise IDs to preserve weight pre-filling functionality
  - Ensured changes are immediately saved to localStorage
  - Improved workout customization flexibility

- Moved "Finish Workout" button to the bottom of the workout page
  - Improved user experience by making the button more accessible
  - Enlarged the "Finish Workout" button for better visibility
  - Maintained consistent styling with other buttons
  - Positioned it as the final action in the workout flow

### Bug Fixes
- Fixed multi-user workout completion issue
  - Resolved bug where finishing one user's workout would close all active workouts
  - Added unique ID generation for each workout when created
  - Created deep copy of workout data before submission to prevent reference issues
  - Updated finishWorkout function to only complete the selected workout
  - Added user name to completion success message for clarity
  - Only navigate away from the page if no workouts remain
  - Improved the user experience for gym partners working out together
  - Maintained proper workout ID tracking to ensure correct workouts are saved

## 2025-05-07

### Development and Testing Tools
- Added script to populate database with completed workouts
  - Created `populate-completed-workouts.js` script in the server/scripts directory
  - Generates 10 completed workouts for each template (40 total)
  - Distributes workouts over the last 6 months with random dates
  - Assigns workouts to different users in the system
  - Generates realistic workout durations (30-90 minutes)
  - Creates sets with realistic weights based on exercise type
  - Preserves template IDs and exercise IDs for weight pre-filling functionality
  - Added documentation in README-POPULATE-WORKOUTS.md

## 2025-05-08

### User Interface Improvements
- Enhanced Workout History calendar display
  - Moved the calendar to its own full-width container for better visibility
  - Increased the size of the calendar to make it more prominent
  - Added custom styling for better readability and visual appeal
  - Improved the calendar navigation buttons and day display
  - Enhanced the workout indicator dots for better visibility
  - Centered the calendar on the page for better focus
  - Added more padding and spacing for a cleaner look
  - Created dedicated enhanced-calendar.css for specialized calendar styling

- Improved calendar workout indicators
  - Implemented colored backgrounds for dates with workouts
  - Created diagonal split backgrounds for days with multiple users
  - Used semi-transparent colors to ensure date numbers remain visible
  - Enhanced date number styling with subtle background and shadow
  - Made all date numbers a consistent black color for better readability
  - Used color-coding to match user colors from their profiles
  - Added tooltips showing user name and workout template
  - Created smooth transitions for hover effects
  - Enhanced the overall aesthetic of the calendar
  - Improved active day styling with subtle background and outline

## 2025-05-09

### Feature Enhancements

- Enhanced workout export functionality
  - Added templateId and exerciseId fields to exported workout data
  - These IDs are critical for the weight pre-filling functionality when importing
  - Added metadata section to export file with version, date, and description
  - Improved the structure of exported data for better readability and usability
  - Included user information (ID, name, color) in the exported data
  - Added workout IDs for reference and tracking purposes

- Enhanced progress chart tooltip
  - Added detailed breakdown of sets, reps, and weights that contribute to the total volume
  - Shows each exercise name, set number, weight, reps, and individual set volume
  - Includes workout name and user name for better context
  - Improved tooltip styling with scrollable content for workouts with many sets
  - Maintains a clean interface while providing detailed information on hover
  - Redesigned with a larger, more readable format with improved organization
  - Implemented a tabular layout for set data with column headers
  - Added subtotals for each exercise and workout
  - Grouped data by workout and exercise for better readability
  - Color-coded user sections to match their profile colors
  - Implemented a click-on-dot interaction system for better user experience
  - Simple hover tooltip shows basic information with "Click on dot for details" instruction
  - Clicking on a data point opens a full-screen dialog with detailed breakdown
  - The dialog stays open until explicitly closed, allowing for easy scrolling and interaction

- Multi-user progress chart
  - Added separate lines for each user on the progress chart
  - Each user's line uses their profile color for easy identification
  - Enhanced tooltip shows data for all users on a specific date
  - Detailed breakdown now includes workout name for better context
  - Improved data organization to compare progress between users
  - Supports both volume and max weight metrics for all users
  - Added multi-select dropdown to toggle users on and off
  - User chips in the selection dropdown match their profile colors
  - Improved UI layout with properly labeled selection controls

- Workout comparison feature
  - Added a "Compare" toggle button to enable comparison mode
  - Allows selecting two different data points on the progress chart
  - Selected points are highlighted with red circles for visibility
  - Opens a side-by-side comparison dialog showing detailed workout information
  - Each side displays the complete breakdown of sets, reps, and weights
  - Helps users track progress between different workout sessions
  - Includes a status indicator showing which points are selected
  - Provides a reset button to clear the current selection
  - Works seamlessly with the multi-user feature to compare across users

## 2025-05-10

### User Experience Improvements
- Added user-specific workout templates:
  - Users can now create and manage their own personal workout templates
  - Templates are associated with the user who created them
  - Added tabs to separate personal templates from global templates
  - Visual indicators to distinguish between personal and global templates
  - Updated backend routes to enforce proper access control for templates
  - Protected routes to ensure users can only modify their own templates

## 2025-05-11

### User Management
- Added admin user functionality that allows admin users to create, edit, and retire global templates
- Users can only edit and delete their own templates
- Updated the UI to visually distinguish between user-specific and global templates
- Updated seed script to designate Jason as an admin user
- Seed script now creates both global templates and user-specific templates

## Planned Changes

### Branding
- [ ] Replace logo192.png and logo512.png with branded icons
- [ ] Update favicon.ico with custom app icon

### Testing
- [ ] Set up Jest unit tests for React components
- [ ] Configure Cypress for end-to-end testing
- [ ] Add backend API tests with Supertest

## How to Use This Change Log

When making changes to the application, please document them in this file with the following format:

1. Date of changes (YYYY-MM-DD)
2. Category of changes (UI, Backend, Database, etc.)
3. Description of each change
4. Reference to relevant files or components

This helps track the evolution of the application and provides context for future development.
