const { SlashCommandBuilder, EmbedBuilder, time } = require('discord.js');
const { bold, italic, strikethrough, underscore, spoiler, quote, blockQuote } = require('discord.js');
const logger = require('../../logger.js');
const { tenor_key } = require('../../config.json');
const moment = require('moment');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('react')
		.setDescription('Sends a react gif')
        .setDMPermission(true)

        .addStringOption(option =>
            option
                .setName('reaction')
                .setDescription('This is the reaction')
                .setRequired(true)
                .addChoices(
                    { name: 'Hug', value: 'hug' },
                    { name: 'Kiss', value: 'kiss' },
                    { name: 'Headpats', value: 'headpat' },
                ))
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription("The target of your reaction")
                .setRequired(true)),
    async execute(interaction) {

        const reaction = interaction.options.getString('reaction');
        const target = interaction.options.getUser('target');
        const now = moment().format('MM/DD/YYYY HH:mm:ss');

        if (reaction === "hug") {

            const url = `https://tenor.googleapis.com/v2/search?q=${'anime + hug'}&key=${tenor_key}&limit=${'50'}&media_filter=${'gif'}`;
            const res = await fetch(url);

            if (res.status === 200) {

                const json = await res.json();
                const randomIndex = Math.floor(Math.random() * 50);
                const randomGif = json.results[randomIndex].media_formats.gif.url
                logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/react hug' in '${interaction.guild.name} #${interaction.channel.name}' issued => ${randomGif}`);

                const resultGif = new EmbedBuilder()
                .setColor('#6b048a')
                .setAuthor({name: 'Stolas Bot by Eth22', iconURL: interaction.client.user.displayAvatarURL(), url: 'https://eth22.fr'})
                .setTitle('Hugs!')
                .setURL(randomGif)
                .setDescription(`<@${interaction.user.id}> hugged <@${target.id}>`)
                .setImage(randomGif)
                .setFooter({text: `${now}`, iconURL: interaction.client.user.displayAvatarURL()})

                return interaction.reply({content:`<@${target.id}>`, embeds: [resultGif]});
            } else {
                return interaction.reply({content: `I seem to have run into a problem using \`${interaction.commandName}\`. Please try again.`, ephemeral: true});
            }
        } else if (reaction === "kiss") {

            const url = `https://tenor.googleapis.com/v2/search?q=${'anime kiss'}&key=${tenor_key}&limit=${'50'}&media_filter=${'gif'}`;
            const res = await fetch(url);

            if (res.status === 200) {

                const json = await res.json();
                const randomIndex = Math.floor(Math.random() * 50);
                const randomGif = json.results[randomIndex].media_formats.gif.url
                logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/react kiss' in '${interaction.guild.name} #${interaction.channel.name}' issued => ${randomGif}`);

                const resultGif = new EmbedBuilder()
                    .setColor('#6b048a')
                    .setAuthor({name: 'Stolas Bot by Eth22', iconURL: interaction.client.user.displayAvatarURL(), url: 'https://eth22.fr'})
                    .setTitle('Kisses!')
                    .setURL(randomGif)
                    .setDescription(`<@${interaction.user.id}> kissed <@${target.id}>`)
                    .setImage(randomGif)
                    .setFooter({text: `${now}`, iconURL: interaction.client.user.displayAvatarURL()})

                return interaction.reply({content:`<@${target.id}>`, embeds: [resultGif]});
            } else {
                return interaction.reply({content: `I seem to have run into a problem using \`${interaction.commandName}\`. Please try again.`, ephemeral: true});
            }
        } else if (reaction === "headpat") {

            const url = `https://tenor.googleapis.com/v2/search?q=${'anime headpat'}&key=${tenor_key}&limit=${'50'}&media_filter=${'gif'}`;
            const res = await fetch(url);

            if (res.status === 200) {

                const json = await res.json();
                const randomIndex = Math.floor(Math.random() * 50);
                const randomGif = json.results[randomIndex].media_formats.gif.url
                logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/react headpat' in '${interaction.guild.name} #${interaction.channel.name}' issued => ${randomGif}`);

                const resultGif = new EmbedBuilder()
                    .setColor('#6b048a')
                    .setAuthor({name: 'Stolas Bot by Eth22', iconURL: interaction.client.user.displayAvatarURL(), url: 'https://eth22.fr'})
                    .setTitle('Headpats!')
                    .setURL(randomGif)
                    .setDescription(`<@${interaction.user.id}> gave headpats to <@${target.id}>`)
                    .setImage(randomGif)
                    .setFooter({text: `${now}`, iconURL: interaction.client.user.displayAvatarURL()})

                return interaction.reply({content:`<@${target.id}>`, embeds: [resultGif]});
            } else {
                return interaction.reply({content: `I seem to have run into a problem using \`${interaction.commandName}\`. Please try again.`, ephemeral: true});
            }
        }

    },
};
