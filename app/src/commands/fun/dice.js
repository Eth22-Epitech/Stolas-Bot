const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { admin_users } = require('../../config.json');
const logger = require('../../logger.js');
const moment = require('moment');

module.exports = {
	cooldown: 1,
	data: new SlashCommandBuilder()
		.setName('dice')
		.setDescription(`Roll x dice with y faces`)
        .setDMPermission(false)
        .addStringOption(option => option.setName('dices').setDescription('Dice to roll written in a xdy format (ex: 2d20 for 2 dices with 20 faces).').setRequired(true)),
    async execute(interaction) {

        const argument = interaction.options.getString('dices');
        const now = moment().format('MM/DD/YYYY HH:mm:ss');

        // Validate the argument
        const regex = /^(\d+d\d+\s*\+\s*)*\d+d\d+$/;
        if (!regex.test(argument)) {
            logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/dice ${argument}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Invalid format (xdy)`);
            await interaction.reply({ content: 'Invalid format for dices. It should be in the xdy format (ex: 3d20 for 3 dices with 20 faces). You can add multiple dice with + (ex: 2d20+1d6).', ephemeral: true });
            return;
        }

        // Split the argument into an array of 'xdy' elements
        const diceArray = argument.split(/\s*\+\s*/);

        // Check total number of dice and faces before rolling
        let totalDice = 0;
        for (let dice of diceArray) {
            const [numDice, numFaces] = dice.split('d').map(Number);
            totalDice += numDice;
            if (numFaces > 100 && !admin_users.includes(interaction.user.id)) {
                logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/dice ${argument}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Invalid face number value: ${numFaces} > 100`);
                await interaction.reply({ content: 'Ah, no dice with faces surpassing a hundred are permitted in this realm.', ephemeral: true });
                return;
            }
        }
        if (totalDice > 50 && !admin_users.includes(interaction.user.id)) {
            logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/dice ${argument}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Invalid dice number value: ${totalDice} > 50`);
            await interaction.reply({ content: 'Ah, attempting to roll over 50 dice at once is strictly forbidden in this domain.', ephemeral: true });
            return;
        }

        // Create variables for dice roll results and total
        const rollResults = [];
        let total = 0;

        // Roll the dice
        diceArray.forEach(dice => {
            const [numDice, numFaces] = dice.split('d').map(Number);

            for (let i = 0; i < numDice; i++) {
                const roll = Math.floor(Math.random() * numFaces) + 1;

                // Add the roll result to the array
                rollResults.push(roll);

                // Add the roll result to the total
                total += roll;
            }
        });

        // Debug: show the roll results and the total
        logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/dice ${argument}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Roll: ${rollResults} | Total: ${total}`);

        // Send result Embed
        const resultEmbed = new EmbedBuilder()
            .setColor('#6b048a')
            .setTitle('Dice Roll')
            .setAuthor({ name: 'Stolas Bot by Eth22', iconURL: interaction.client.user.displayAvatarURL(), url: 'https://eth22.fr' })
            .setDescription(`<@${interaction.user.id}> request \`[${diceArray.join(', ')}]\`, rolled \`[${rollResults.join(', ')}]\` and got \`${total}\`!`)
            .setFooter({ text: `${now}`, iconURL: interaction.client.user.displayAvatarURL() });

        await interaction.reply({embeds: [resultEmbed], fetchReply: true});
    },
};
