import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import Account from '../../models/Account.js';
import Guild from '../../models/Guild.js';
import Claim from '../../models/Claim.js';

export const buildGamesEmbed = async () => {
    // Aggregate to get unique game names where status is available
    const availableGames = await Account.aggregate([
      { $match: { status: 'available' } },
      { $group: { _id: '$gameName' } },
      { $sort: { _id: 1 } }
    ]);

    if (availableGames.length === 0) {
      return { content: 'There are currently no accounts available.', embeds: [], components: [] };
    }

    // Find the maximum length of game names for padding
    const maxLength = Math.max(...availableGames.map(g => g._id.length));

    const embeds = [];
    let currentDescription = '';
    let isFirstEmbed = true;

    for (const game of availableGames) {
      // Get all account IDs for this game to count claims
      const accountsForGame = await Account.find({ gameName: game._id }).select('_id');
      const accountIds = accountsForGame.map(acc => acc._id);

      const workingCount = await Claim.countDocuments({ accountId: { $in: accountIds }, reviewStatus: 'working' });
      const notWorkingCount = await Claim.countDocuments({ accountId: { $in: accountIds }, reviewStatus: 'not_working' });

      // Pad game name with non-breaking spaces for alignment
      const paddedName = game._id.padEnd(maxLength, '\u00A0');

      const line = `<a:arrow_white:1514499935125504080> ${paddedName} \u00A0\u00A0 ( <a:greencheck:1514500469827833977> ${workingCount} \u00A0|\u00A0 <a:redcheck:1514499774412357682> ${notWorkingCount} )\n`;

      if (currentDescription.length + line.length > 4000) {
        const embed = new EmbedBuilder()
          .setColor('#ff1493')
          .setDescription(currentDescription);

        if (isFirstEmbed) {
          embed.setTitle('<:steam:1514500645967888405> Available Steam Games');
          isFirstEmbed = false;
        }

        embeds.push(embed);
        currentDescription = line;
      } else {
        currentDescription += line;
      }
    }

    if (currentDescription.length > 0) {
      const embed = new EmbedBuilder()
        .setColor('#ff1493')
        .setDescription(currentDescription);

      if (isFirstEmbed) {
        embed.setTitle('<:steam:1514500645967888405> Available Steam Games');
      }

      embeds.push(embed);
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Get Access')
        .setEmoji({ id: '1514500002549075988', name: 'crown', animated: false })
        .setStyle(ButtonStyle.Link)
        .setURL('https://discord.com/users/1390721413622534296'),
      new ButtonBuilder()
        .setCustomId('refresh_allgame')
        .setLabel('Refresh')
        .setEmoji('🔄')
        .setStyle(ButtonStyle.Secondary)
    );

    return { content: '', embeds: embeds, components: [row] };
};

export default {
  data: new SlashCommandBuilder()
    .setName('allgame')
    .setDescription('Shows available games.'),
  async execute(interaction) {
    await interaction.deferReply();
    // Check if guild is approved
    const guild = await Guild.findOne({ guildId: interaction.guildId });
    if (!guild || !guild.approved) {
      return interaction.editReply({ content: 'This server is not approved to use the bot. Please run `/taxsetup` and contact an admin.', ephemeral: true });
    }

    try {
      const replyData = await buildGamesEmbed();
      await interaction.editReply(replyData);
    } catch (error) {
      console.error(error);
      await interaction.editReply({ content: 'Failed to fetch available games.', ephemeral: true });
    }
  },
};
