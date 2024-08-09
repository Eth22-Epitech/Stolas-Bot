const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const logger = require('../../logger.js');
const { nekomoe_key, trusted_users } = require('../../config.json');
const moment = require('moment');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('animal')
		.setDescription('Sends a random animal image from various sites')
        .setDMPermission(false)

        .addStringOption(option =>
            option
                .setName('specie')
                .setDescription('The specie of animal you want an image of')
                .setRequired(true)
                .addChoices(
                    { name: 'Bird', value: 'birb' },
                    { name: 'Deer', value: 'dikdik' },
                )),

    async execute(interaction) {

        const now = moment().format('MM/DD/YYYY HH:mm:ss');

        const isActive = await fetch('https://v2.yiff.rest/online');
        if (isActive.status !== 200) {
            return interaction.reply({content: `The API I traverse hath descended into the abyss of offline. Return dear, and I, Stolas, shall endeavor to serve thee again.`, ephemeral: true});
        }

        const specie = interaction.options.getString('specie');

        let headers = new Headers({
            "User-Agent"   : "Stolas Bot"
        });

        if (1) {

            const url = `https://v2.yiff.rest/animals/${specie}?amount=1`;
            const res = await fetch(url, {headers : headers});
            const json = await res.json();

            if (res.status === 200) {

                const randomImage = json.images[0].url;
                logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/animal ${specie}' in '${interaction.guild.name} #${interaction.channel.name}' issued => ${randomImage}`);

                const resultGif = new EmbedBuilder()
                    .setColor('#6b048a')
                    .setAuthor({name: 'Stolas Bot by Eth22', iconURL: interaction.client.user.displayAvatarURL(), url: 'https://eth22.fr'})
                    .setTitle(`Animal`)
                    .setURL(randomImage)
                    .setImage(randomImage)
                    .setFooter({text: `${now}`, iconURL: interaction.client.user.displayAvatarURL()})

                return interaction.reply({embeds: [resultGif]});
            } else {
                return interaction.reply({content: `I seem to have run into a problem using \`${interaction.commandName}\`. Please try again.`, ephemeral: true});
            }

        } else {
            logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/animal ${specie}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Unexpected issue`);
            return interaction.reply({content: `I seem to have run into a problem using \`${interaction.commandName}\`. Please try again.`, ephemeral: true});
        }
    },
};
