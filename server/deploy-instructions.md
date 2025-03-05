# Deployment Instructions

## Setting up MongoDB Atlas

1. Create a MongoDB Atlas account if you don't have one
2. Create a new cluster
3. Create a database user with read/write permissions
4. Whitelist all IP addresses (0.0.0.0/0) for development purposes
5. Get your connection string from the "Connect" button

## Deploying to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Use the following settings:
   - Name: gym-tracker-api
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `NODE_ENV=production npm start`
4. Add the following environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `FRONTEND_URL`: `https://gym-tracker-rawhillfish.netlify.app`
   - `MONGODB_URI`: Your MongoDB Atlas connection string

## Deploying to Netlify

1. Make sure your Netlify site is connected to your GitHub repository
2. Add the following environment variables in the Netlify dashboard:
   - `REACT_APP_API_URL`: (leave blank to use the default)
   - `NODE_ENV`: `production`
   - `BACKEND_API_URL`: `https://gym-tracker-api.onrender.com`

## Testing Your Deployment

1. After deploying, visit your Netlify site
2. Check the browser console for any errors
3. Verify that data is being loaded from the production database
