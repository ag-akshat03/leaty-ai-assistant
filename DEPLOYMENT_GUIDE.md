# Deployment Guide

## Frontend (Vercel)

1. Push the project to GitHub.
2. Import the repo in Vercel.
3. Set the root directory to `frontend`.
4. Add environment variable:
   - `VITE_API_URL=https://your-backend.onrender.com`
5. Deploy.

## Backend (Render)

1. Create a new Web Service in Render.
2. Select the same repository.
3. Set root directory to `backend`.
4. Build command:
   npm install
5. Start command:
   npm start

### Environment Variables
- OPENROUTER_API_KEY
- OPENROUTER_MODEL
- MONGO_URI
- FRONTEND_URL

## MongoDB Atlas

1. Create a free cluster.
2. Add a database user.
3. Whitelist all IPs for deployment.
4. Copy the connection string into `MONGO_URI`.
