const { SlashCommandBuilder, EmbedBuilder, time } = require('discord.js');
const { bold, italic, strikethrough, underscore, spoiler, quote, blockQuote } = require('discord.js');
const logger = require('../../logger.js');
var moment = require('moment');

function quizResult(interaction, answer, topic) {
    const collectorFilter = (collected) => collected.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({ filter: collectorFilter, max: 1, time: 30000 });

    collector.on('collect', (collected) => {
        now = moment().format('MM/DD/YYYY HH:mm:ss');
        const userAnswer = collected.content;
        const isCorrect = answer.toString() === collected.content.toLowerCase();

        logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) 'quizAnswer : ${collected.content.toLowerCase()}' in '${interaction.guild.name} #${interaction.channel.name}' issued => isCorrect:${isCorrect}`);

        const responseEmbed = new EmbedBuilder()
            .setColor(isCorrect ? '#00ff00' : '#ff0000')
            .setAuthor({ name: 'Stolas Bot by Eth22', iconURL: interaction.client.user.displayAvatarURL(), url: 'https://eth22.fr' })
            .setDescription(`Your answer: ${userAnswer}\n${isCorrect ? 'Correct!' : 'Incorrect!'}`)
            .setFooter({ text: `${now}`, iconURL: interaction.client.user.displayAvatarURL() });

        if (!isCorrect) {
            responseEmbed.addFields({ name: `${bold('Correct answer:')}`, value: `${answer.toString()}`},)
        }

        interaction.followUp({ embeds: [responseEmbed] });
    });

    collector.on('end', (collected) => {
        now = moment().format('MM/DD/YYYY HH:mm:ss');

        if (collected.size === 0) {
            logger.log('info', `${now} - '/quiz ${topic}' in '${interaction.guild.name} #${interaction.channel.name}' issued => TIMEOUT`);

            const timeoutEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({ name: 'Stolas Bot by Eth22', iconURL: interaction.client.user.displayAvatarURL(), url: 'https://eth22.fr' })
                .setDescription('Time is up! You did not answer the quiz question.')
                .setFooter({ text: `${now}`, iconURL: interaction.client.user.displayAvatarURL() });

            interaction.followUp({ embeds: [timeoutEmbed] });
        }
    });
}

module.exports = {
	cooldown: 30,
	data: new SlashCommandBuilder()
		.setName('quiz')
		.setDescription('Ask a question about the specified topic')
        .setDMPermission(false)

        .addStringOption(option =>
            option
                .setName('topic')
                .setDescription('The topic on which the question(s) will be')
                .setRequired(true)
                .addChoices(
                    { name: 'Math', value: 'math' },
                    { name: 'Helluva Boss', value: 'helluva_boss' },
                )),
    async execute(interaction) {

        const topic = interaction.options.getString('topic');
        const Timer = Math.round((Date.now() + 30000) / 1000);
        var now = moment().format('MM/DD/YYYY HH:mm:ss');


        if (topic === 'math') {

            const Math_questionList = [
                ['51 + 12', 63], ['54 + 9', 63], ['72 + 5', 77], ['72 + 8', 80], ['73 + 1', 74], ['81 + 7', 88], ['85 + 6', 91], ['87 + 4', 91],

                ['63 - 12', 51], ['69 - 15', 54], ['70 - 14', 56], ['72 - 10', 62], ['76 - 8', 68], ['84 - 9', 75], ['88 - 11', 77],

                ['58 * 7', 406], ['58 * 10', 580], ['58 * 11', 638], ['63 * 4', 252], ['64 * 9', 576], ['65 * 3', 195],

                ['76 / 8', 9], ['91 / 7', 13], ['92 / 4', 23], ['99 / 9', 11], ['58 / 2', 29], ['42 / 6', 7], ['84 / 12', 7], ['60 / 5', 12], ['72 / 9', 8], ['80 / 10', 8],
                ['63 / 7', 9], ['81 / 3', 27], ['88 / 4', 22], ['96 / 6', 16], ['100 / 5', 20], ['105 / 7', 15], ['110 / 10', 11], ['144 / 12', 12], ['156 / 13', 12], ['168 / 7', 24],

                ['52 % 8', 4], ['53 % 11', 9], ['55 % 6', 1], ['56 % 5', 1], ['57 % 12', 3],
            ];

            const Math_randomIndex = Math.floor(Math.random() * Math_questionList.length);
            const Math_question = Math_questionList[Math_randomIndex][0];
            const Math_answer = Math_questionList[Math_randomIndex][1];
            console.log(`${now} - ${interaction.user.username} (${interaction.user.id}) '/quiz ${topic}' in '${interaction.guild.name} #${interaction.channel.name}' issued => ${Math_question}`);

            const quizEmbed = new EmbedBuilder()
                .setColor('#6b048a')
                .setAuthor({name: 'Stolas Bot by Eth22', iconURL: interaction.client.user.displayAvatarURL(), url: 'https://eth22.fr'})
                .setTitle('Quiz!')
                .addFields(
                    { name: `${underscore(bold('Requested by'))}`, value: `<@${interaction.user.id}>`},
                    { name: `Theme:`, value: `Math`},
                    { name: `Question:`, value: `${Math_question}`},
                    { name: `Timer:`, value: `<t:${Timer}:R>`},
                )
                .setFooter({text: `${now}`, iconURL: interaction.client.user.displayAvatarURL()})

            await interaction.reply({embeds: [quizEmbed], fetchReply: true});
            await quizResult(interaction, Math_answer, topic);

        } else if (topic === "helluva_boss") {

            const Helluva_questionList = [
                ["What's the name of Stolas' daughter?", 'octavia'],
                ["What's the name of Stolas' father?", 'paimon'],
                ["What's the name of the amusement park where Blitzo has been tasked to protect Stolas?", 'loolooland'],
                ["What's the name of the company Blitzo owns?", 'imp'],
                ["How old was Loona when Blitzo adopted her?", '17'],
            ];

            const Helluva_randomIndex = Math.floor(Math.random() * Helluva_questionList.length);
            const Helluva_question = Helluva_questionList[Helluva_randomIndex][0];
            const Helluva_answer = Helluva_questionList[Helluva_randomIndex][1];
            logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/quiz ${topic}' in '${interaction.guild.name} #${interaction.channel.name}' issued => ${Helluva_question}`);

            const quizEmbed = new EmbedBuilder()
                .setColor('#6b048a')
                .setAuthor({name: 'Stolas Bot by Eth22', iconURL: interaction.client.user.displayAvatarURL(), url: 'https://eth22.fr'})
                .setTitle('Quiz!')
                .addFields(
                    { name: `${underscore(bold('Requested by'))}`, value: `<@${interaction.user.id}>`},
                    { name: `Theme:`, value: `Helluva Boss`},
                    { name: `Question:`, value: `${Helluva_question}`},
                    { name: `Timer:`, value: `<t:${Timer}:R>`},
                )
                .setFooter({text: `${now}`, iconURL: interaction.client.user.displayAvatarURL()})

            await interaction.reply({embeds: [quizEmbed], fetchReply: true});
            await quizResult(interaction, Helluva_answer, topic);

        } else {
            return interaction.reply({content: `I seem to have run into a problem using \`${interaction.commandName}\`. Please try again.`, ephemeral: true});
        }
    },
};
