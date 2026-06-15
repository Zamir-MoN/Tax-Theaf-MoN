import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import Account from '../../models/Account.js';
import Guild from '../../models/Guild.js';
import Claim from '../../models/Claim.js';

export const buildGamesEmbed = async (page = 0) => {
    // Aggregate to get unique game names where status is available
    const availableGames = await Account.aggregate([
      { $match: { status: 'available' } },
      { $group: { _id: '$gameName' } },
      { $sort: { _id: 1 } }
    ]);

    if (availableGames.length === 0) {
      return { content: 'There are currently no accounts available.', embeds: [], components: [] };
    }

    const itemsPerPage = 15;
    const totalPages = Math.ceil(availableGames.length / itemsPerPage);
    
    // Ensure page is within bounds
    page = Math.max(0, Math.min(page, totalPages - 1));

    const start = page * itemsPerPage;
    const end = start + itemsPerPage;
    const gamesPage = availableGames.slice(start, end);

    // Find the maximum length of game names for padding
    const maxLength = Math.max(...availableGames.map(g => g._id.length));

    let description = '';

    for (const game of gamesPage) {
      // Get all account IDs for this game to count claims
      const accountsForGame = await Account.find({ gameName: game._id }).select('_id');
      const accountIds = accountsForGame.map(acc => acc._id);

      const workingCount = await Claim.countDocuments({ accountId: { $in: accountIds }, reviewStatus: 'working' });
      const notWorkingCount = await Claim.countDocuments({ accountId: { $in: accountIds }, reviewStatus: 'not_working' });

      // Format counts to take up 2 characters space for alignment
      const wCount = workingCount.toString().padStart(2, ' ');
      const nwCount = notWorkingCount.toString().padEnd(2, ' ');

      // Pad game name with regular spaces and wrap in inline code block for perfect monospace alignment
      const paddedName = game._id.padEnd(maxLength, ' ');

      description += `<a:arrow_white:1514499935125504080> \`${paddedName}\` \u00A0 ( <a:greencheck:1514500469827833977> \`${wCount}\` | <a:redcheck:1514499774412357682> \`${nwCount}\` )\n`;
    }

    const embed = new EmbedBuilder()
      .setTitle('<:steam:1514500645967888405> Available Steam Games')
      .setColor('#ff1493')
      .setDescription(description)
      .setFooter({ text: `Page ${page + 1} of ${totalPages}` });

    const navRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`allgame_prev_${page}`)
        .setLabel('◀ Previous')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(page === 0),
      new ButtonBuilder()
        .setCustomId(`allgame_next_${page}`)
        .setLabel('Next ▶')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(page >= totalPages - 1)
    );

    const linkRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Get Access')
        .setEmoji({ id: '1514500002549075988', name: 'crown', animated: false })
        .setStyle(ButtonStyle.Link)
        .setURL('https://discord.com/users/1390721413622534296')
    );

    return { content: '', embeds: [embed], components: [navRow, linkRow] };
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
      // Delete old message by checking channel history (survives bot restarts)
      try {
        const messages = await interaction.channel.messages.fetch({ limit: 30 });
        const oldMsg = messages.find(m => 
            m.author.id === interaction.client.user.id && 
            m.embeds.length > 0 && 
            m.embeds[0].title === '<:steam:1514500645967888405> Available Steam Games'
        );
        if (oldMsg) {
           await oldMsg.delete();
        }
      } catch (e) {
        // Ignore errors if lacking permissions
      }

      const replyData = await buildGamesEmbed();
      await interaction.editReply(replyData);

    } catch (error) {
      console.error(error);
      await interaction.editReply({ content: 'Failed to fetch available games.', ephemeral: true });
    }
  },
};
