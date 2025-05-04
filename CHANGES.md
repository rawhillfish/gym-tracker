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

### User Interface Improvements
- Added sorting to workout templates across the application
  - Templates are now sorted alphabetically by name when starting a workout
  - Implemented sorting for templates loaded from both the database and localStorage
  - Added sorting to the WorkoutBuilder page for both active and retired templates
  - Improved user experience by making it easier to find specific templates
  - Ensured consistent sorting behavior throughout the application

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
