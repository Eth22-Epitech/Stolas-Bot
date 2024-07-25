const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const logger = require('../../logger.js');
const { tenor_key } = require('../../config.json');
const moment = require('moment');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('stolas')
		.setDescription('Sends a random Stolas gif')
        .setDMPermission(false),
    async execute(interaction) {

        const url = `https://tenor.googleapis.com/v2/search?q=${'Stolas'}&key=${tenor_key}&limit=${'50'}&media_filter=${'gif'}`;
        const res = await fetch(url);
        const now = moment().format('MM/DD/YYYY HH:mm:ss');

        if (res.status === 200) {

            const json = await res.json();
            const randomIndex = Math.floor(Math.random() * 50);
            const randomGif = json.results[randomIndex].media_formats.gif.url
            logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/stolas' in '${interaction.guild.name} #${interaction.channel.name}'  issued => ${randomGif}`);

            const resultGif = new EmbedBuilder()
                .setColor('#6b048a')
                .setAuthor({name: 'Stolas Bot by Eth22', iconURL: interaction.client.user.displayAvatarURL(), url: 'https://eth22.fr'})
                .setTitle('Stolas gif')
                .setURL(randomGif)
                .setDescription(`Run by <@${interaction.user.id}>`)
                .setImage(randomGif)
                .setFooter({text: `${now}`, iconURL: interaction.client.user.displayAvatarURL()})

            return interaction.reply({embeds: [resultGif]});
        } else {
            return interaction.reply({content: `I seem to have run into a problem using \`${interaction.commandName}\`. Please try again.`, ephemeral: true});
        }
    },
};
