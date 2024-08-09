const { SlashCommandBuilder, EmbedBuilder, CommandInteraction } = require('discord.js');
const { bold, italic, strikethrough, underscore, spoiler, quote, blockQuote } = require('discord.js');
const logger = require('../../logger.js');
const moment = require('moment');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('ask')
		.setDescription('Ask Stolas a question')
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName('question')
                .setDescription(`The question to ask Stolas (It should be a yes/no question for more accurate result")`)
                .setRequired(true)),
    async execute(interaction) {

        const question = interaction.options.getString('question');
        const now = moment().format('MM/DD/YYYY HH:mm:ss');

        if (question) {

            const answer = ["Yes, but not in the way you might think.",
                            "Yes, but it comes with certain conditions.",
                            "Yes, indeed. It is as clear as day, my sweet.",
                            "Oh, most certainly. What a silly question, my dear.",
                            "Definitely, my sweet. Let's make it happen!",
                            "Absolutely, my dear. You have my full support and commitment.",
                            "Absolutely, my sweet. The answer is a resounding yes!",

                            "I'm afraid that's confidential information.",
                            "My answer is irrelevant, my dear. The real question is, what are you going to do about it?",

                            "No, but I wouldn't rule it out entirely.",
                            "No, I'm afraid not. But do not despair, my sweet.",
                            "No, my dear. But let us not dwell on the negative. There are still many possibilities to explore.",
                            "No, my dear. But let's not let that spoil our time together.",
                            "No, my dear. But don't worry, there are still plenty of options to consider.",
                            "I'm sorry, my dear. The answer is no. But perhaps I can make it up to you somehow~.",
                            "I'm sorry, my dear. The answer is no. But please don't take it personally."
            ];

            const randomIndex = Math.floor(Math.random() * answer.length)

            const answerEmbed = new EmbedBuilder()
            .setColor('#6b048a')
            .setAuthor({name: 'Stolas Bot by Eth22', iconURL: interaction.client.user.displayAvatarURL(), url: 'https://eth22.fr'})
            .setTitle(`Ask Stolas`)
            .addFields(
                { name: `${underscore(bold('Requested by'))}`, value: `<@${interaction.user.id}>`},
                { name: `${underscore(bold('Question'))}`, value: `${question}`},
                { name: `${underscore(bold('Answer'))}`, value: `${answer[randomIndex]}`},
            )
            .setFooter({text: `${now}`, iconURL: interaction.client.user.displayAvatarURL()})

            logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/ask ${question}' in '${interaction.guild.name} #${interaction.channel.name}' issued => ${answer[randomIndex]}`);
            return interaction.reply({embeds: [answerEmbed]});
        } else {
            return interaction.reply({content: `I seem to have run into a problem using \`${interaction.commandName}\`. Please try again.`, ephemeral: true});
        }

    },
};
