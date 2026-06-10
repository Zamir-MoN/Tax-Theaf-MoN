import { Events, REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);

    // Register slash commands
    const rest = new REST().setToken(process.env.DISCORD_TOKEN);
    try {
      console.log(`Started refreshing ${client.commands.size} application (/) commands.`);

      const commandsData = client.commands.map(cmd => cmd.data.toJSON());

      // The put method is used to fully refresh all commands
      const data = await rest.put(
        Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
        { body: commandsData },
      );

      console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
      console.error(error);
    }
  },
};
