import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import Account from '../../models/Account.js';
import Guild from '../../models/Guild.js';
import VerificationCode from '../../models/VerificationCode.js';
import Claim from '../../models/Claim.js';
export default {
  data: new SlashCommandBuilder()
    .setName('gameacc')
    .setDescription('Request an available game account.')
    .addStringOption(option =>
      option.setName('game')
        .setDescription('The name of the game')
        .setRequired(true)
        .setAutocomplete(true)),
        
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    
    // Fetch unique available games
    const availableGames = await Account.distinct('gameName', { status: 'available' });
    
    const filtered = availableGames.filter(choice => choice.toLowerCase().includes(focusedValue.toLowerCase()));
    
    // Discord limits autocomplete options to 25
    await interaction.respond(
      filtered.slice(0, 25).map(choice => ({ name: choice, value: choice })),
    );
  },

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    // Check if guild is approved
    const guild = await Guild.findOne({ guildId: interaction.guildId });
    if (!guild || !guild.approved) {
      return interaction.editReply({ content: 'This server is not approved to use the bot. Please run `/gsetup` and contact an admin.', ephemeral: true });
    }

    // Check if command is used in the designated channel
    if (guild.commandChannelId && interaction.channelId !== guild.commandChannelId) {
      return interaction.editReply({ content: `You can only use this command in <#${guild.commandChannelId}>.`, ephemeral: true });
    }

    // Check if user has the required access role
    if (!interaction.member.roles.cache.has(guild.authorizedRoleId)) {
      return interaction.editReply({ content: 'You do not have the required role to claim game accounts.', ephemeral: true });
    }



    const gameName = interaction.options.getString('game');

    // Fetch any available account
    const account = await Account.findOne({ gameName: gameName, status: 'available' });

    if (!account) {
        return interaction.editReply({ content: `Sorry, there are no available accounts for **${gameName}** at the moment.`, ephemeral: true });
    }

    // Generate random 4 digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // Create verification record
    await VerificationCode.create({
        userId: interaction.user.id,
        code: code,
        accountId: account._id,
    });

    const embed = new EmbedBuilder()
        .setTitle('Account Verification')
        .setDescription(`You requested a **${gameName}** account.\n\nEnter this code below and press Activate:\n\n# ${code}\n\n*Code expires in 30 seconds.*`)
        .setColor('#0099ff');

    const activateBtn = new ButtonBuilder()
        .setCustomId('activate_claim')
        .setLabel('Activate')
        .setEmoji({ id: '1493475644854505643', name: '1345834485895139440', animated: true })
        .setStyle(ButtonStyle.Success);

    const cancelBtn = new ButtonBuilder()
        .setCustomId('cancel_claim')
        .setLabel('Cancel')
        .setEmoji({ id: '1379144264885211317', name: 'verifiedred', animated: true })
        .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(activateBtn, cancelBtn);

    await interaction.editReply({ embeds: [embed], components: [row], ephemeral: true });

  },
};
