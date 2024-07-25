const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const logger = require('../../logger.js');
const { nekomoe_key, trusted_users } = require('../../config.json');
const moment = require('moment');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('neko')
		.setDescription('Sends a random neko image from neko.moe')
        .setDMPermission(false)

        .addBooleanOption(option =>
            option.setName('nsfw')
                .setDescription('This parameter, when true, only works in nsfw channels!')),
    async execute(interaction) {

        const now = moment().format('MM/DD/YYYY HH:mm:ss');
        /*if (!trusted_users.includes(interaction.user.id)) {
            console.log(`${now} - ${interaction.user.username} (${interaction.user.id}) '/neko nsfw:false' in '${interaction.guild.name} #${interaction.channel.name}' issued => NOT TRUSTED USER`);
            return interaction.reply({content: `Due to some problems using neko.moe api, this command is only available to trusted users as sfw images tend to be too suggestive.`, ephemeral: true});
        }*/

        const nsfw = interaction.options.getBoolean('nsfw') ?? false;

        if (nsfw === false) {
            const url = `https://nekos.moe/api/v1/random/image?nsfw=false`;
            const res = await fetch(url);

            if (res.status === 200) {

                const json = await res.json();
                const randomImage = `https://nekos.moe/image/` + json.images[0].id
                logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/neko nsfw:false' in '${interaction.guild.name} #${interaction.channel.name}' issued => ${randomImage}`);

                const resultGif = new EmbedBuilder()
                    .setColor('#6b048a')
                    .setAuthor({name: 'Stolas Bot by Eth22', iconURL: interaction.client.user.displayAvatarURL(), url: 'https://eth22.fr'})
                    .setTitle('Neko')
                    .setURL(randomImage)
                    .setImage(randomImage)
                    .setFooter({text: `${now}`, iconURL: interaction.client.user.displayAvatarURL()})

                return interaction.reply({embeds: [resultGif]});
            } else {
                return interaction.reply({content: `I seem to have run into a problem using \`${interaction.commandName}\`. Please try again.`, ephemeral: true});
            }
        } else if (nsfw === true) {
            if (interaction.channel.nsfw) {
                const url = `https://nekos.moe/api/v1/random/image?nsfw=true`;
                const res = await fetch(url);

                if (res.status === 200) {

                    const json = await res.json();
                    const randomImage = `https://nekos.moe/image/` + json.images[0].id
                    logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/neko nsfw:true' in '${interaction.guild.name} #${interaction.channel.name}' issued => ${randomImage}`);

                    const resultGif = new EmbedBuilder()
                        .setColor('#6b048a')
                        .setAuthor({name: 'Stolas Bot by Eth22', iconURL: interaction.client.user.displayAvatarURL(), url: 'https://eth22.fr'})
                        .setTitle('Neko')
                        .setURL(randomImage)
                        .setImage(randomImage)
                        .setFooter({text: `${now}`, iconURL: interaction.client.user.displayAvatarURL()})

                    return interaction.reply({embeds: [resultGif]});
                } else {
                    return interaction.reply({content: `I seem to have run into a problem using \`${interaction.commandName}\`. Please try again.`, ephemeral: true});
                }
            } else {
                logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/neko nsfw:true' in '${interaction.guild.name} #${interaction.channel.name}' issued => (Not i nsfw channel)`);
                return interaction.reply({content: `My dear, I'm afraid I must inform you that such commands are not permitted in this particular location. (Not a nsfw channel)`, ephemeral: true});
            }
        }

    },
};
