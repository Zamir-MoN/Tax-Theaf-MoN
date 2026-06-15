import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Client, GatewayIntentBits, Collection, REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';

import authRoutes from './api/routes/auth.js';
import accountRoutes from './api/routes/accounts.js';
import guildRoutes from './api/routes/guilds.js';
import logRoutes from './api/routes/logs.js';
import statsRoutes from './api/routes/stats.js';

dotenv.config();

// Connect Database
import mongoose from 'mongoose';
connectDB().then(() => {
    mongoose.connection.collection('verificationcodes').dropIndex('createdAt_1').catch(() => {});
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/guilds', guildRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/stats', statsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// --- DISCORD BOT SETUP ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

client.commands = new Collection();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load commands
const commandsPath = path.join(__dirname, 'bot', 'commands');
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    import(filePath).then((module) => {
      const command = module.default;
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
      } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    }).catch(err => console.error(err));
  }
}

// Load events
const eventsPath = path.join(__dirname, 'bot', 'events');
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    import(filePath).then((module) => {
      const event = module.default;
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }
    }).catch(err => console.error(err));
  }
}

// Login
if (process.env.DISCORD_TOKEN) {
  client.login(process.env.DISCORD_TOKEN).catch(console.error);
} else {
  console.log("No DISCORD_TOKEN provided, bot will not start.");
}

export { client };
