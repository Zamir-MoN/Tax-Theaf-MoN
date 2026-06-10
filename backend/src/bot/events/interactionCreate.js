import { Events, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import VerificationCode from '../../models/VerificationCode.js';
import Account from '../../models/Account.js';
import Log from '../../models/Log.js';

export default {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    if (interaction.isChatInputCommand() || interaction.isAutocomplete()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) return;

      if (interaction.isAutocomplete()) {
        try {
            await command.autocomplete(interaction);
        } catch (error) {
            console.error(error);
        }
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
          await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
      }
    } else if (interaction.isButton()) {
      if (interaction.customId === 'cancel_claim') {
        await interaction.update({ content: 'Claim cancelled.', components: [], embeds: [] });
      } else if (interaction.customId === 'activate_claim') {
        const modal = new ModalBuilder()
          .setCustomId('verification_modal')
          .setTitle('Account Verification');

        const codeInput = new TextInputBuilder()
          .setCustomId('code_input')
          .setLabel('Enter the 4-digit verification code')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(4)
          .setMinLength(4);

        const firstActionRow = new ActionRowBuilder().addComponents(codeInput);
        modal.addComponents(firstActionRow);

        await interaction.showModal(modal);
      }
    } else if (interaction.isModalSubmit()) {
      if (interaction.customId === 'verification_modal') {
        const enteredCode = interaction.fields.getTextInputValue('code_input');
        const verificationRecord = await VerificationCode.findOne({ 
            userId: interaction.user.id, 
            code: enteredCode,
            used: false
        }).populate('accountId');

        if (!verificationRecord) {
            return interaction.reply({ content: 'Invalid or expired verification code!', ephemeral: true });
        }

        if (verificationRecord.accountId.status !== 'processing') {
            return interaction.reply({ content: 'This account is no longer available.', ephemeral: true });
        }

        verificationRecord.used = true;
        await verificationRecord.save();

        const account = verificationRecord.accountId;
        account.status = 'claimed';
        account.claimedBy = interaction.user.id;
        account.claimedDate = new Date();
        await account.save();

        const dmEmbed = new EmbedBuilder()
            .setTitle('Here is your Account!')
            .addFields(
                { name: 'Game', value: account.gameName },
                { name: 'Username', value: account.username },
                { name: 'Password', value: account.password }
            )
            .setColor('#00ff00');
            
        if (account.imageUrl) {
            dmEmbed.setImage(account.imageUrl);
        }

        try {
            await interaction.user.send({ embeds: [dmEmbed] });
            await interaction.reply({ content: 'Account details have been sent to your DMs!', ephemeral: true });

            await Log.create({
                action: 'account_claimed',
                details: `Account ${account._id} (Game: ${account.gameName}) claimed by user ${interaction.user.tag} (${interaction.user.id})`,
                userId: interaction.user.id,
                guildId: interaction.guildId
            });

        } catch (e) {
            console.error("Failed to send DM", e);
            account.status = 'available';
            account.claimedBy = null;
            account.claimedDate = null;
            await account.save();
            await interaction.reply({ content: 'Failed to send DM. Make sure your DMs are open!', ephemeral: true });
        }
      }
    }
  },
};
