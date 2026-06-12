import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import Account from '../../models/Account.js';
import Guild from '../../models/Guild.js';
import VerificationCode from '../../models/VerificationCode.js';
import Claim from '../../models/Claim.js';

export default {
  data: new SlashCommandBuilder()
    .setName('gameacc')
    .setDescription('Request an available game account.'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    // Check if guild is approved
    const guild = await Guild.findOne({ guildId: interaction.guildId });
    if (!guild || !guild.approved) {
      return interaction.editReply({ content: 'This server is not approved to use the bot. Please run `/taxsetup` and contact an admin.', ephemeral: true });
    }

    // Check if command is used in the designated channel
    if (guild.commandChannelId && interaction.channelId !== guild.commandChannelId) {
      return interaction.editReply({ content: `You can only use this command in <#${guild.commandChannelId}>.`, ephemeral: true });
    }

    // Check if user has the required access role
    if (!interaction.member.roles.cache.has(guild.authorizedRoleId)) {
      return interaction.editReply({ content: 'You do not have the required role to claim game accounts.', ephemeral: true });
    }

    // Fetch unique available games
    const availableGames = await Account.distinct('gameName', { status: 'available' });

    if (availableGames.length === 0) {
        return interaction.editReply({ content: `Sorry, there are no available accounts at the moment.`, ephemeral: true });
    }

    const select = new StringSelectMenuBuilder()
        .setCustomId('select_game_acc')
        .setPlaceholder('Select a game')
        .addOptions(
            availableGames.slice(0, 25).map(game => 
                new StringSelectMenuOptionBuilder()
                    .setLabel(game)
                    .setValue(game)
            )
        );

    const selectRow = new ActionRowBuilder().addComponents(select);

    const response = await interaction.editReply({ content: 'Please select a game to claim:', components: [selectRow], ephemeral: true });

    try {
        const confirmation = await response.awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, time: 60000 });
        
        const gameName = confirmation.values[0];

        // Fetch any available account
        const account = await Account.findOne({ gameName: gameName, status: 'available' });

        if (!account) {
            return confirmation.update({ content: `Sorry, there are no available accounts for **${gameName}** at the moment.`, components: [] });
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
            .setColor('#ff1493');

        const activateBtn = new ButtonBuilder()
            .setCustomId('activate_claim')
            .setLabel('Activate')
            .setEmoji({ id: '1514500328945356931', name: 'trophy', animated: true })
            .setStyle(ButtonStyle.Success);

        const cancelBtn = new ButtonBuilder()
            .setCustomId('cancel_claim')
            .setLabel('Cancel')
            .setEmoji({ id: '1514499774412357682', name: 'redcheck', animated: true })
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(activateBtn, cancelBtn);

        await confirmation.update({ content: '', embeds: [embed], components: [row] });

    } catch (e) {
        await interaction.editReply({ content: 'Selection timed out or was cancelled.', components: [] });
    }
  },
};
