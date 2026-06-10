import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import Guild from '../../models/Guild.js';
import Log from '../../models/Log.js';

export default {
  data: new SlashCommandBuilder()
    .setName('gsetup')
    .setDescription('Configure the bot for this server')
    .addRoleOption(option => 
      option.setName('access_role')
        .setDescription('Select the role required to claim game accounts')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const role = interaction.options.getRole('access_role');
    const authCode = `AUTH-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      let guildRecord = await Guild.findOne({ guildId: interaction.guildId });

      if (guildRecord) {
        guildRecord.guildName = interaction.guild.name;
        guildRecord.authorizedRoleId = role.id;
        guildRecord.setupCode = authCode;
        guildRecord.approved = false; // reset approval on re-setup? Or keep it? The prompt says "Guild remains pending approval". Let's reset.
        await guildRecord.save();
      } else {
        guildRecord = await Guild.create({
          guildId: interaction.guildId,
          guildName: interaction.guild.name,
          authorizedRoleId: role.id,
          setupCode: authCode,
          approved: false,
        });
      }

      await Log.create({
        action: 'guild_setup',
        details: `Setup initiated for guild ${interaction.guild.name} (${interaction.guildId})`,
        userId: interaction.user.id,
        guildId: interaction.guildId,
      });

      const embed = new EmbedBuilder()
        .setTitle('Server Setup Pending')
        .setDescription(`Authentication Code: \n**${authCode}**\n\nProvide this code to the Bot Administrator in the Web Dashboard to get your server approved. Features are disabled until approved.`)
        .setColor('#ffff00');

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Failed to complete setup.', ephemeral: true });
    }
  },
};
