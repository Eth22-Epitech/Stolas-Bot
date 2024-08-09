const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const logger = require('../../logger.js');
const { nekomoe_key, trusted_users } = require('../../config.json');
const moment = require('moment');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('furry')
		.setDescription('Sends a random furry image from the yiffy api')
        .setDMPermission(false)

        .addBooleanOption(option =>
            option.setName('nsfw')
                .setDescription('This parameter, when true, only works in nsfw channels!'))

        .addStringOption(option =>
            option
                .setName('tag')
                .setDescription('The type of image you want to receive (default to Hug)')
                .setRequired(false)
                .addChoices(
                    { name: 'Boop (SFW)', value: 'boop' },
                    { name: 'Cuddle (SFW)', value: 'cuddle' },
                    { name: 'Flop (SFW)', value: 'flop' },
                    { name: 'Fursuit (SFW)', value: 'fursuit' },
                    { name: 'Hold (SFW)', value: 'hold' },
                    { name: 'Howl (SFW)', value: 'howl' },
                    { name: 'Hug (SFW)', value: 'hug' },
                    { name: 'Kiss (SFW)', value: 'kiss' },
                    { name: 'Lick (SFW)', value: 'lick' },
                    { name: 'Propose (SFW)', value: 'propose' },

                    { name: 'Bulge (NSFW)', value: 'bulge' },
                    { name: 'Straight (NSFW)', value: 'yiff/straight' },
                    { name: 'Gay (NSFW)', value: 'yiff/gay' },
                    { name: 'Lesbian (NSFW)', value: 'yiff/lesbian' },
                    { name: 'Futanari (NSFW)', value: 'yiff/gynomorph' },
                )),

    async execute(interaction) {

        const now = moment().format('MM/DD/YYYY HH:mm:ss');
        if (!trusted_users.includes(interaction.user.id)) {
            logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/furry ${tag}' in '${interaction.guild.name} #${interaction.channel.name}' issued => NOT TRUSTED USER`);
            return interaction.reply({content: `Ah, I do apologize, but it seems you're forbidden from executing that particular command.`, ephemeral: true});
        }

        const isActive = await fetch('https://v2.yiff.rest/online');
        if (isActive.status !== 200) {
            return interaction.reply({content: `The API I traverse hath descended into the abyss of offline. Return dear, and I, Stolas, shall endeavor to serve thee again.`, ephemeral: true});
        }

        const nsfw = interaction.options.getBoolean('nsfw') ?? false;
        const tag = interaction.options.getString('tag') ?? 'hug';

        let headers = new Headers({
            "User-Agent" : "Stolas Bot"
        });

        if (nsfw === false) {

            const url = `https://v2.yiff.rest/furry/${tag}?amount=1`;
            const res = await fetch(url, {headers : headers});
            const json = await res.json();

            if (res.status === 200) {

                const randomImage = json.images[0].url;
                logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/furry nsfw:false ${tag}' in '${interaction.guild.name} #${interaction.channel.name}' issued => ${randomImage}`);

                const resultGif = new EmbedBuilder()
                    .setColor('#6b048a')
                    .setAuthor({name: 'Stolas Bot by Eth22', iconURL: interaction.client.user.displayAvatarURL(), url: 'https://eth22.fr'})
                    .setTitle(`Furry (SFW)`)
                    .setURL(randomImage)
                    .setImage(randomImage)
                    .setFooter({text: `${now}`, iconURL: interaction.client.user.displayAvatarURL()})

                return interaction.reply({embeds: [resultGif]});
            } else {
                return interaction.reply({content: `I seem to have run into a problem using \`${interaction.commandName}\`. Please try again.`, ephemeral: true});
            }

        } else if (nsfw === true) {

            if (interaction.channel.nsfw) {
                const url = `https://v2.yiff.rest/furry/${tag}?amount=1`;
                const res = await fetch(url, {headers : headers});
                const json = await res.json();

                if (res.status === 200) {

                    const randomImage = json.images[0].url;
                    logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/furry nsfw:true ${tag}' in '${interaction.guild.name} #${interaction.channel.name}' issued => ${randomImage}`);

                    const resultGif = new EmbedBuilder()
                        .setColor('#6b048a')
                        .setAuthor({name: 'Stolas Bot by Eth22', iconURL: interaction.client.user.displayAvatarURL(), url: 'https://eth22.fr'})
                        .setTitle(`Furry (NSFW)`)
                        .setURL(randomImage)
                        .setImage(randomImage)
                        .setFooter({text: `${now}`, iconURL: interaction.client.user.displayAvatarURL()})

                    return interaction.reply({embeds: [resultGif]});
                } else {
                    return interaction.reply({content: `I seem to have run into a problem using \`${interaction.commandName}\`. Please try again.`, ephemeral: true});
                }
            } else {
                logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/furry nsfw:true ${tag}' in '${interaction.guild.name} #${interaction.channel.name}' issued => (Not a nsfw channel)`);
                return interaction.reply({content: `My dear, I'm afraid I must inform you that such commands are not permitted in this particular location. (Not a nsfw channel)`, ephemeral: true});
            }
        }
    },
};
