import { Events, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import VerificationCode from '../../models/VerificationCode.js';
import Account from '../../models/Account.js';
import Log from '../../models/Log.js';
import Claim from '../../models/Claim.js';
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
      } else if (interaction.customId.startsWith('review_')) {
        const isWorking = interaction.customId.startsWith('review_working_');
        const claimId = interaction.customId.replace(isWorking ? 'review_working_' : 'review_not_working_', '');
        
        const claim = await Claim.findById(claimId);
        if (!claim) {
            return interaction.update({ content: 'Review already submitted or claim not found.', components: [] });
        }
        
        claim.reviewStatus = isWorking ? 'working' : 'not_working';
        await claim.save();
        
        await interaction.update({ content: '<a:trophy:1514500328945356931> Thank you for your review!', components: [] });
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
        await interaction.deferReply({ ephemeral: true });
        const enteredCode = interaction.fields.getTextInputValue('code_input');
        const verificationRecord = await VerificationCode.findOne({ 
            userId: interaction.user.id, 
            code: enteredCode,
            used: false
        }).populate('accountId');

        if (!verificationRecord) {
            return interaction.editReply({ content: '<a:redcheck:1514499774412357682> Invalid or expired verification code!' });
        }

        verificationRecord.used = true;
        await verificationRecord.save();

        const account = verificationRecord.accountId;
        
        if (account.status !== 'available') {
            return interaction.editReply({ content: '<a:redcheck:1514499774412357682> This account is currently disabled and unavailable.' });
        }

        const claim = await Claim.create({
            userId: interaction.user.id,
            accountId: account._id,
            reviewStatus: 'pending'
        });

        const dmEmbed = new EmbedBuilder()
            .setTitle('Here is your Account!')
            .addFields(
                { name: 'Game', value: account.gameName },
                { name: 'Username', value: account.username },
                { name: 'Password', value: account.password }
            )
            .setColor('#ff1493');
            
        if (account.imageUrl) {
            dmEmbed.setImage(account.imageUrl);
        }

        const workingBtn = new ButtonBuilder()
            .setCustomId(`review_working_${claim._id}`)
            .setLabel('Working')
            .setEmoji({ id: '1514500002549075988', name: 'crown', animated: false })
            .setStyle(ButtonStyle.Success);

        const notWorkingBtn = new ButtonBuilder()
            .setCustomId(`review_not_working_${claim._id}`)
            .setLabel('Not Working')
            .setEmoji({ id: '1514499774412357682', name: 'redcheck', animated: true })
            .setStyle(ButtonStyle.Secondary);

        const dmRow = new ActionRowBuilder().addComponents(workingBtn, notWorkingBtn);

        try {
            await interaction.user.send({ embeds: [dmEmbed], components: [dmRow] });
            await interaction.editReply({ content: '<a:gift:1514500165849972736> Account details have been sent to your DMs!' });

            await Log.create({
                action: 'account_claimed',
                details: `Account ${account._id} (Game: ${account.gameName}) claimed by user ${interaction.user.tag} (${interaction.user.id})`,
                userId: interaction.user.id,
                guildId: interaction.guildId
            });

        } catch (e) {
            console.error("Failed to send DM", e);
            await Claim.findByIdAndDelete(claim._id);
            await interaction.editReply({ content: '<a:redcheck:1514499774412357682> Failed to send DM. Make sure your DMs are open!' });
        }
      }
    }
  },
};
