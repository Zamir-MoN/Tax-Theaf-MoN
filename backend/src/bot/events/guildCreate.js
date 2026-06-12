import { Events, EmbedBuilder } from 'discord.js';

export default {
  name: Events.GuildCreate,
  async execute(guild, client) {
    try {
      // Find a default channel to send the message
      const defaultChannel = guild.channels.cache.find(channel => 
        channel.type === 0 && channel.permissionsFor(guild.members.me).has('SendMessages')
      );

      if (defaultChannel) {
        const embed = new EmbedBuilder()
          .setTitle('Hello!')
          .setDescription('Thank you for adding the bot.\n\nRun:\n`/taxsetup`\n\nto configure the bot.')
          .setColor('#ff1493');

        await defaultChannel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error(`Error in guildCreate event: ${error}`);
    }
  },
};
