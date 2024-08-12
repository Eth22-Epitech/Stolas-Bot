const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { bold, italic, strikethrough, underscore, spoiler, quote, blockQuote, inlineCode, codeBlock } = require('discord.js');
const logger = require('../../logger.js');
const { admin_users } = require('../../config.json');
const path = require('path');
const fs = require('fs');
const moment = require('moment');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('logs')
        .setDescription('(ADMIN) Logs manipulation command')
        .setDMPermission(true)

        .addSubcommand(subcommand =>
            subcommand
                .setName('get')
                .setDescription('Print x number of lines from log file to dm')
                .addIntegerOption(option => option.setName('lines').setDescription('Number of lines to get from logs').setRequired(true))),

    async execute(interaction) {

        const now = moment().format('MM/DD/YYYY HH:mm:ss');

        if (!admin_users.includes(interaction.user.id)) {
            logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/dm ${targetUser} ${message}' in '${interaction.guild.name} #${interaction.channel.name}' issued => NOT ADMIN`);
            return interaction.reply({content: `You are not an Admin of Stolas Bot.`, ephemeral: true});
        }

        if (interaction.options.getSubcommand() === 'get') {
            const linesNum = interaction.options.getInteger('lines');
            const logFilePath = '/app/src/logs/stolas.log';

            try {
                const logData = fs.readFileSync(logFilePath, 'utf-8');
                const logLines = logData.trim().split('\n');
                const lastLines = logLines.slice(-linesNum).join('\n');

                const embed = new EmbedBuilder()
                    .setColor('#6b048a')
                    .setAuthor({name: 'Stolas Bot by Eth22', iconURL: interaction.client.user.displayAvatarURL(), url: 'https://eth22.fr'})
                    .setTitle(`Last ${linesNum} lines of logs`)
                    .setDescription(`\`\`\`log\n${lastLines}\n\`\`\``)
                    .setFooter({text: `${now}`, iconURL: interaction.client.user.displayAvatarURL()});

                await interaction.user.send({ embeds: [embed] });
                logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/logs get ${linesNum}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Sent ${linesNum} lines of logs.`);
                return interaction.reply({ content: `Sent the last ${linesNum} lines of the log to your DMs.`, ephemeral: true });
            } catch (error) {
                logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/logs get ${linesNum}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Error while reading logs file.`);
                return interaction.reply({ content: `Failed to read the log file: ${error}.`, ephemeral: true });
            }
        } else {
            return interaction.reply({content: `Error? BAD`, ephemeral: true});
        }
    },
};
