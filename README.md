# StudyAI MERN

Full-stack StudyAI app using MongoDB, Express, React, and Node.js.

## Tech Stack
- Backend: Express, Mongoose
- Frontend: React + Vite
- Database: MongoDB

## Project Structure
- client: React frontend
- server: Express API with MongoDB models
- docker-compose.yml: MongoDB service for local development

## Setup
1. Install dependencies:
   npm run install:all
2. Create backend env file:
   copy server/.env.example server/.env
3. Start MongoDB.

### MongoDB Options
- Local install: ensure MongoDB is running on mongodb://127.0.0.1:27017
- Docker:
  docker compose up -d

4. Start frontend and backend together:
   npm run dev

## URLs

LINK HERE https://another-wine.vercel.app/

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health check: http://localhost:5000/api/health

## Available Scripts
- npm run dev: run client and server concurrently
- npm run dev:server: run server only
- npm run dev:client: run client only
- npm run build: build client

## Seed Data
The server automatically inserts initial subjects, tasks, weak topics, and profile when collections are empty.

## Deploy To Vercel
1. Ensure you have a MongoDB Atlas connection string.
2. Add environment variable in Vercel project settings:
   - MONGO_URI=<your-atlas-uri>
3. Deploy from the root:
   - npx vercel --prod

The deployment serves the Vite frontend and routes /api/* to serverless backend logic.
