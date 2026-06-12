# Discord Game Account Giveaway Bot + Web Dashboard

A complete solution for distributing game accounts securely via Discord, managed through a React web dashboard.

## Features

- **Discord Bot**:
  - `/taxsetup`: Authenticate the server via a setup code.
  - `/allgame`: View available games.
  - `/gameacc`: Request a game account (uses Autocomplete).
  - One-time verification code system (expires in 30s) sent to Discord UI, claims sent via DM.
  - Account locking mechanism to prevent race conditions.
- **Web Dashboard**:
  - Secure Admin Login using JWT.
  - View overall statistics (Total, Available, Claimed accounts).
  - Manage Game Accounts (Add, Edit, Delete).
  - Approve or Reject Guild (Server) requests.
  - View system logs for auditing.

## Tech Stack
- **Frontend**: React, Vite, TailwindCSS, React Router.
- **Backend**: Node.js, Express, Discord.js (v14), Mongoose.
- **Database**: MongoDB.

## Running Locally

1. Install dependencies for backend and frontend:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
2. Set up environment variables in `backend/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/discord-giveaway-bot
   JWT_SECRET=supersecretjwtkey123!
   DISCORD_TOKEN=your_discord_bot_token_here
   DISCORD_CLIENT_ID=your_discord_client_id_here
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=adminpass123
   ```
3. Start MongoDB locally (or use Atlas).
4. Run Backend: `npm run dev`
5. Run Frontend: `npm run dev`

## Deployment with Docker

1. Edit the environment variables in `docker-compose.yml`.
2. Run:
   ```bash
   docker-compose up -d --build
   ```
3. The dashboard will be available at `http://YOUR_SERVER_IP`, and the bot will start automatically.
