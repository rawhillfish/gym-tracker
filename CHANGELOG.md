# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- (changes for the next release go here)

## [1.0.0] - 2025-05-11

### Added
- JWT-based authentication system with bcrypt password hashing
- Admin user role with elevated template management permissions (Jason designated as admin)
- User-specific workout templates — personal vs global, with access control enforced on backend
- Mobile-optimized workout history page with responsive navbar
- Workout comparison feature — select two data points on progress chart for side-by-side breakdown
- Multi-user progress chart with per-user color coding and togglable user selection
- Exercise reordering during active workout (move up/down arrows)
- Enhanced workout export with templateId and exerciseId for weight pre-filling on import
- Keep-alive to prevent session timeouts during long workouts
- Calendar view in workout history with color-coded dates per user
- Script to populate database with 6 months of sample completed workouts

### Changed
- App rebranded to "Work It Out" (manifest, tab title, meta description)
- Exercise management split into active/retired sections with category grouping and collapsible sections
- Exercise categories expanded: Legs split into Quads/Hamstring/Glutes/Calves; Arms consolidated
- User management updated with retire/restore/permanent-delete lifecycle
- Workout template management: creation form hidden behind button, exercise selection dialog with search and category grouping
- Active Workout page cleaned up: removed debug buttons, sample data, and localStorage fallbacks
- Workout card UI reorganised with large prominent timer, icon buttons with tooltips
- Workout templates sorted alphabetically throughout the app
- Progress chart tooltip redesigned: click-to-expand dialog with tabular set breakdown, colour-coded by user

### Fixed
- Multi-user workout completion: finishing one workout no longer closes all active workouts
- Template editing: changing reps for one exercise no longer affects all exercises (deep clone fix)
- API method mismatches: PATCH changed to PUT for update routes
- Security vulnerabilities in dependencies
