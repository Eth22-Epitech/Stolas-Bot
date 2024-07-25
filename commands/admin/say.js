const { SlashCommandBuilder } = require('discord.js');
const { admin_users } = require('../../config.json');
const logger = require('../../logger.js');
const moment = require('moment');

module.exports = {
	cooldown: 1,
	data: new SlashCommandBuilder()
		.setName('say')
		.setDescription('(ADMIN) Make the bot say something')
        .setDMPermission(false)
        .addStringOption(option => option.setName('message').setDescription('Message to send').setRequired(true)),
    async execute(interaction) {

        const message = interaction.options.getString('message');

        const now = moment().format('MM/DD/YYYY HH:mm:ss');
        if (!admin_users.includes(interaction.user.id)) {
            logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/say ${message}' in '${interaction.guild.name} #${interaction.channel.name}' issued => NOT ADMIN`);
            return interaction.reply({content: `You are not an Admin of Stolas Bot.`, ephemeral: true});
        }

        await interaction.reply(message);
    },
};
