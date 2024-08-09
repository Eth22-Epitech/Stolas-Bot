const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { bold, italic, strikethrough, underscore, spoiler, quote, blockQuote } = require('discord.js');
const logger = require('../../logger.js');
const { tenor_key } = require('../../config.json');
const moment = require('moment');

module.exports = {
	cooldown: 30,
	data: new SlashCommandBuilder()
		.setName('poll')
		.setDescription('create a poll in the current channel (Admins only)')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        .addStringOption(option =>
            option.setName('poll_content')
                .setDescription(`The main question your poll is aiming to answer.`)
                .setRequired(true))
        .addStringOption(option =>
            option.setName(`choice1`)
                .setDescription(`The first choice.`)
                .setRequired(true))
        .addStringOption(option =>
            option.setName(`choice2`)
                .setDescription(`The second choice.`)
                .setRequired(true))
        .addStringOption(option =>
            option.setName(`choice3`)
                .setDescription(`A third choice.`)
                .setRequired(false))
        .addStringOption(option =>
            option.setName(`choice4`)
                .setDescription(`A fourth choice.")`)
                .setRequired(false))
        /*.addStringOption(option =>
            option.setName(`choice5`)
                .setDescription(`A fifth choice.")`)
                .setRequired(false))
        .addStringOption(option =>
            option.setName(`choice6`)
                .setDescription(`A sixth choice.")`)
                .setRequired(false))
        .addStringOption(option =>
            option.setName(`choice7`)
                .setDescription(`A seventh choice.")`)
                .setRequired(false))
        .addStringOption(option =>
            option.setName(`choice8`)
                .setDescription(`A eighth choice.")`)
                .setRequired(false))*/,
    async execute(interaction) {

        const now = moment().format('MM/DD/YYYY HH:mm:ss');

        if (1 === 1) {
            const pollString = interaction.options.getString('poll_content');

            var choices = {};
            for (let x = 0; x <= 10; x++) {
                if (interaction.options.getString(`choice${x}`)) {
                    choices["choice" + x] = interaction.options.getString(`choice${x}`);
                }
            }

            logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/poll '${pollString}' '`);
            for (let x = 0; x <= 10; x++) {
                if (interaction.options.getString(`choice${x}`)) {
                    process.stdout.write(`${choices['choice' + x]}, `);
                }
            }
            logger.log('info', `' in '${interaction.guild.name} #${interaction.channel.name}' issued => POLL\n`);

            const pollEmbed = new EmbedBuilder()
            .setColor('#6b048a')
            .setAuthor({name: 'Stolas Bot by Eth22', iconURL: interaction.client.user.displayAvatarURL(), url: 'https://eth22.fr'})
            .setTitle(`${bold(`${interaction.user.username} just created a new poll!`)} :`)
            .addFields({name: `${underscore(bold(`${pollString}`))}`, value: `Poll by <@${interaction.user.id}>`})
            .setFooter({text: `${now}`, iconURL: interaction.client.user.displayAvatarURL()})

            pollEmbed.addFields({ name: `\u200B`, value: `\u200B`})
            for (let x = 0; x <= 10; x++) {
                if (interaction.options.getString(`choice${x}`)) {
                    pollEmbed.addFields({name: `${choices['choice' + x]} :`, value: "0"})
                }
            }

            var buttonlist = {}
            for (let x = 0; x <= 10; x++) {
                if (interaction.options.getString(`choice${x}`)) {
                    buttonlist["button" + x] = new ButtonBuilder()
                    .setCustomId(`choice${x}_id`)
                    .setLabel(`${choices['choice' + x]}`)
                    .setStyle(ButtonStyle.Primary);
                }
            }

            const answerRow = new ActionRowBuilder()

            for (const buttonKey in buttonlist) {
                if (buttonlist.hasOwnProperty(buttonKey)) {
                    const button = buttonlist[buttonKey];
                    answerRow.addComponents(button);
                }
            }

            await interaction.reply({embeds: [pollEmbed], components: [answerRow]});
        } else {
            return interaction.reply({content: `I seem to have run into a problem using \`${interaction.commandName}\`. Please try again.`, ephemeral: true});
        }
    },
};
