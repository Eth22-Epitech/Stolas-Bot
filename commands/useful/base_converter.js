const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { bold, italic, strikethrough, underscore, spoiler, quote, blockQuote, inlineCode, codeBlock } = require('discord.js');
const logger = require('../../logger.js');
var moment = require('moment');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('base_converter')
		.setDescription('A command to convert any number into one of the implemented bases')
        .setDMPermission(true)
        .addIntegerOption(option =>
            option
                .setName('number')
                .setDescription('The number you want to convert')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('base')
                .setDescription('The base in which you want to convert the number')
                .setRequired(true)
                .addChoices(
                    { name: 'Binary', value: 'bin' },
                    { name: 'Octal', value: 'oct' },
                    { name: 'Decimal', value: 'dec' },
                    { name: 'Hexadecimal', value: 'hex' },
                )),

    async execute(interaction) {
        var now = moment().format('MM/DD/YYYY HH:mm:ss');

        const num = interaction.options.getInteger('number');
        const base = interaction.options.getString('base');

        let result;
        switch (base) {
            case 'bin':
                result = '0b' + num.toString(2);
                break;
            case 'oct':
                result = '0o' + num.toString(8);
                break;
            case 'dec':
                result = num.toString(10);
                break;
            case 'hex':
                result = '0x' + num.toString(16);
                break;
            default:
                return interaction.reply({content: `Invalid base. Please try again with a valid base.`, ephemeral: true});
        }

        logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/base_converter ${num} ${base}' in '${interaction.guild.name} #${interaction.channel.name}' issued => ${result} `);
        return interaction.reply({content:`${result}`, ephemeral: true});
    },
};