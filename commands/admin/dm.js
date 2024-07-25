const { SlashCommandBuilder } = require('discord.js');
const { admin_users } = require('../../config.json');
const logger = require('../../logger.js');
const moment = require('moment');

module.exports = {
	cooldown: 1,
	data: new SlashCommandBuilder()
		.setName('dm')
		.setDescription(`(ADMIN) Dm a user on Stolas' behalf`)
        .setDMPermission(false)
        .addUserOption(option => option.setName('user').setDescription('User to dm').setRequired(true))
        .addStringOption(option => option.setName('message').setDescription('Message to send').setRequired(true)),
    async execute(interaction) {

        const targetUser = interaction.options.getUser('user');
        const message = interaction.options.getString('message');

        const now = moment().format('MM/DD/YYYY HH:mm:ss');
        if (!admin_users.includes(interaction.user.id)) {
            logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/dm ${targetUser} ${message}' in '${interaction.guild.name} #${interaction.channel.name}' issued => NOT ADMIN`);
            return interaction.reply({content: `You are not an Admin of Stolas Bot.`, ephemeral: true});
        }

        try {
            await targetUser.send(message);
            await interaction.reply({ content: `Message sent to ${targetUser.username}`, ephemeral: true });
        } catch (error) {
            await interaction.reply({ content: `${targetUser.username} has DMs disabled`, ephemeral: true });
        }
    },
};
