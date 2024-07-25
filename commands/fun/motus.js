const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const logger = require('../../logger.js');
const randomWord = require('random-word-by-length');
const moment = require('moment');

module.exports = {
	cooldown: 30,
	data: new SlashCommandBuilder()
		.setName('motus')
		.setDescription('Try to guess the word')
        .setDMPermission(false)
        .addStringOption(option =>
            option
                .setName('length')
                .setDescription('The desired length of the word to guess')
                .setRequired(true)
                .addChoices(
                    { name: '5', value: '5' },
                    { name: '6', value: '6' },
                    { name: '7', value: '7' },
                    { name: '8', value: '8' },
                )),
    async execute(interaction) {
        // Get option
        const length = parseInt(interaction.options.getString('length'));
        const now = moment().format('MM/DD/YYYY HH:mm:ss');

        logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/motus ${length}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Running...`);

        // Call API
        try {
            var word = randomWord(length);
            while(word.length !== length) {
                word = randomWord(length);
            }
        } catch (error) {
            logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/motus ${length}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Couldn't fetch word!`);
            await interaction.reply({ content: "Ah, it seems there's a hiccup in fetching the word. My apologies for the inconvenience.", ephemeral: true });
        }
        // Send init Embed
        const initEmbed = new EmbedBuilder()
            .setColor('#6b048a')
            .setTitle('Motus')
            .setAuthor({ name: 'Stolas Bot by Eth22', iconURL: interaction.client.user.displayAvatarURL(), url: 'https://eth22.fr' })
            .setDescription(`Word Length: ${length} | Guesses Remaining: 6`)
            .setFooter({ text: `${now}`, iconURL: interaction.client.user.displayAvatarURL() });

        await interaction.reply({embeds: [initEmbed], fetchReply: true});

        logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/motus ${length}' in '${interaction.guild.name} #${interaction.channel.name}' issued => OK : ${word}`);

        // Create a message collector
        const filter = m => m.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, max: 18 });

        // Setup Guess list & Guess amount
        const guessList = [];
        let guessLeft = 6;

        collector.on('collect', async m => {
            // Check the length of the guess
            if (m.content.length !== word.length) {
                await m.reply({ content: 'Ah, your conjecture should match the length of the word, my dear.', ephemeral: true });
                m.delete();
                return;
            }

            // Increase the number of valid guesses
            guessLeft--;

            // Delete user guess
            m.delete();

            // Check the guess
            const guess = m.content.toLowerCase();
            let colorCode = '';

            // Count the number of times each letter appears in the word and in the guess
            const wordCounts = Array(26).fill(0);
            const guessCounts = Array(26).fill(0);
            for (let i = 0; i < word.length; i++) {
                wordCounts[word.charCodeAt(i) - 97]++;
                guessCounts[guess.charCodeAt(i) - 97]++;
            }

            // Create an array to store the colors of the letters
            const colors = Array(guess.length).fill(':black_large_square:');

            for (let i = 0; i < guess.length; i++) {
                if (guess[i] === word[i]) {
                    colors[i] = ':green_square:';
                    wordCounts[word.charCodeAt(i) - 97]--;
                    guessCounts[guess.charCodeAt(i) - 97]--;
                }
            }

            for (let i = 0; i < guess.length; i++) {
                if (colors[i] === ':black_large_square:' && wordCounts[guess.charCodeAt(i) - 97] > 0) {
                    colors[i] = ':orange_square:';
                    wordCounts[guess.charCodeAt(i) - 97]--;
                }
            }

            // Combine the colors into a string
            colorCode = colors.join('');

            // Add the guess to the list
            guessList.push({ guess: m.content, colorCode });

            // Edit the embed
            const editedEmbed = new EmbedBuilder()
                .setColor('#6b048a')
                .setTitle('Motus')
                .setAuthor({ name: 'Stolas Bot by Eth22', iconURL: interaction.client.user.displayAvatarURL(), url: 'https://eth22.fr' })
                .setDescription(`Word Length: ${length} | Guesses Remaining: ${guessLeft}`)
                .setFooter({ text: `${now}`, iconURL: interaction.client.user.displayAvatarURL() })
                for (const guess of guessList) {
                    editedEmbed.addFields({ name: guess.guess + ':', value: guess.colorCode });
                }

            await interaction.editReply({embeds: [editedEmbed]});

            // Check if the user has won or lost
            if (guess === word) {
                collector.stop('correctGuess');
            } else if (guessLeft === 0) {
                collector.stop('maxGuesses');
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'correctGuess') {
                interaction.followUp(`Spot on! The term in question was none other than ${word}.`);
            } else if (reason === 'maxGuesses') {
                interaction.followUp(`Well, it appears you've exhausted your attempts! The elusive word was none other than ${word}.`);
            } else {
                interaction.followUp(`Seems the motus concluded unexpectedly, perhaps due to a tad too much enthusiasm or a glitch in the infernal system. The undisclosed word, my dear, was ${word}.`);
            }
        });
    },
};
