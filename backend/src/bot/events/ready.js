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

    // Run description update once on startup
    const initDescription = async () => {
      try {
        await client.application.fetch();
        const ownerId = client.application.owner?.id || client.application.owner?.ownerId;
        const ownerIdToUse = ownerId || '1390721413622534296';
        const newDescription = `🎮 Your Automated Game Account Distributor!\n\n🛠️ Developed by zamir_main\n🔗 Contact: https://discord.com/users/${ownerIdToUse}`;
        
        if (client.application.description !== newDescription) {
            await client.application.edit({ description: newDescription }).catch(console.error);
        }
      } catch (err) {
        console.error('Failed to update description:', err);
      }
    };
    await initDescription();

    // Rotating Status Text
    let statusIndex = 0;
    const updateActivity = async () => {
      try {
        const availableCount = await Account.countDocuments({ status: 'available' });
        
        const statuses = [
          { text: `🎮 ${availableCount} game accounts available!`, type: ActivityType.Watching },
          { text: `🚀 /gameacc to claim an account`, type: ActivityType.Playing },
          { text: `🛠️ Developed by zamir_main`, type: ActivityType.Listening }
        ];
        
        const currentStatus = statuses[statusIndex % statuses.length];
        client.user.setActivity(currentStatus.text, { type: currentStatus.type });
        
        statusIndex++;
      } catch (err) {
        console.error('Failed to update status:', err);
      }
    };

    // Run once immediately, then every 10 seconds
    await updateActivity();
    setInterval(updateActivity, 10 * 1000);
  },
};
