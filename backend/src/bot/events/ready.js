import { Events, REST, Routes, ActivityType } from 'discord.js';
import dotenv from 'dotenv';
import Account from '../../models/Account.js';
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

    // Dynamic Status and Description
    const updateStatus = async () => {
      try {
        const availableCount = await Account.countDocuments({ status: 'available' });
        
        client.user.setActivity(`${availableCount} game accounts available!`, { type: ActivityType.Watching });

        // Update App Description (Rate limited, so we only do it on startup)
        await client.application.fetch();
        const ownerId = client.application.owner?.id || client.application.owner?.ownerId;
        const ownerMention = ownerId ? `<@${ownerId}>` : 'zamir_main';

        const newDescription = `🎮 Your Automated Game Account Distributor!\n\n🛠️ Developed by ${ownerMention}`;
        
        if (client.application.description !== newDescription) {
            await client.application.edit({ description: newDescription }).catch(console.error);
        }
      } catch (err) {
        console.error('Failed to update status:', err);
      }
    };

    // Run once on startup
    await updateStatus();
    
    // Update activity every 5 minutes
    setInterval(updateStatus, 5 * 60 * 1000);
  },
};
