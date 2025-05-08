# Gym Tracker - Login Credentials

This document contains login credentials for the existing users in the Gym Tracker application.

## Default Users

The application comes with the following pre-configured users:

### Jason
- **Email**: jason@example.com
- **Password**: password123
- **Profile Color**: Blue (#2196f3)

### Andrew
- **Email**: andrew@example.com
- **Password**: password123
- **Profile Color**: Red (#f44336)

### Default User
- **Email**: default.user@example.com
- **Password**: password123
- **Profile Color**: Blue (#2196f3)

## How to Use

1. Navigate to the login page at `/login`
2. Enter the email and password for one of the users above
3. Click the "Login" button to authenticate

## Creating New Users

You can also create new users through the registration page:

1. Navigate to the registration page at `/register`
2. Fill in the required information:
   - Full Name
   - Email Address
   - Password (minimum 6 characters)
   - Profile Color (select from available options)
3. Click the "Register" button to create a new account

## Troubleshooting

If you encounter login issues, try the following:

1. **Reset Password**: You can reset a user's password using the provided script:
   ```
   cd /home/jasonpovey/repos/gym-tracker
   node server/scripts/reset-password.js jason@example.com password123
   ```

2. **Check Server Logs**: Look for any error messages in the server logs when attempting to log in.

3. **Verify Database Connection**: Ensure that MongoDB is running and accessible.

4. **Clear Browser Cache**: Try clearing your browser cache and cookies, then attempt to log in again.

5. **API Testing**: You can test the login API directly using curl:
   ```
   curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"jason@example.com","password":"password123"}'
   ```

## Notes

- These credentials are for development purposes only
- In a production environment, you should use strong, unique passwords
- The passwords are hashed using bcrypt before being stored in the database
