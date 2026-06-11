import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import Account from '../../models/Account.js';
import Guild from '../../models/Guild.js';

export default {
  data: new SlashCommandBuilder()
    .setName('listgame')
    .setDescription('Shows available games.'),
  async execute(interaction) {
    await interaction.deferReply();
    // Check if guild is approved
    const guild = await Guild.findOne({ guildId: interaction.guildId });
    if (!guild || !guild.approved) {
      return interaction.editReply({ content: 'This server is not approved to use the bot. Please run `/gsetup` and contact an admin.', ephemeral: true });
    }

    try {
      // Aggregate to get unique game names and their counts where status is available
      const availableGames = await Account.aggregate([
        { $match: { status: 'available' } },
        { $group: { _id: '$gameName', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);

      if (availableGames.length === 0) {
        return interaction.editReply({ content: 'There are currently no accounts available.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle('Available Games')
        .setColor('#ff1493');

      let description = '';
      for (const game of availableGames) {
        description += `<a:Arrow_White:1400099341578014793> **${game._id}** (${game.count} available)\n`;
      }

      embed.setDescription(description);

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply({ content: 'Failed to fetch available games.', ephemeral: true });
    }
  },
};
