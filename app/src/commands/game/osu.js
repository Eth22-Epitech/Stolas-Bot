const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { bold, italic, strikethrough, underscore, spoiler, quote, blockQuote, inlineCode, codeBlock } = require('discord.js');
const logger = require('../../logger.js');
const { osu_key, osu_id, trusted_users } = require('../../config.json');
const { std_ppv2 } = require('booba');
const moment = require('moment');

// To run the bot, type "npm run start"

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('osu')
		.setDescription('Multipurpose osu command (WIP)')
        .setDMPermission(false)

        .addSubcommand(subcommand =>
            subcommand
                .setName('recent_score')
                .setDescription('Info about the most recent score of a user')
                .addStringOption(option => option.setName('user').setDescription('User In-game name').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('recent_medal')
                .setDescription('Info about the most recent medal obtained by a user')
                .addStringOption(option => option.setName('user').setDescription('User In-game name').setRequired(true))),

    async execute(interaction) {

        const now = moment().format('MM/DD/YYYY HH:mm:ss');

        const token_url = `https://osu.ppy.sh/oauth/token`;
        const token_bodyParams = new URLSearchParams({
            client_id: osu_id,
            client_secret: osu_key,
            grant_type: 'client_credentials',
            scope: 'public',
        });

        const token_res = await fetch(token_url, {
            method: 'POST',
            body: token_bodyParams,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        const token_json = await token_res.json();

        if (token_res.status === 200) {

            if (interaction.options.getSubcommand() === 'recent_score') {
                const user = interaction.options.getString('user');

                var getId_url = `https://osu.ppy.sh/api/v2/users/` + user;
                const getId_res = await fetch(getId_url, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token_json.access_token}`,
                    },
                });
                const getId_json = await getId_res.json();

                if (getId_res.status !== 200) {
                    return interaction.reply({content: `Couldn't fetch user_id`, ephemeral: true});
                }
                const userId = getId_json.id;

                var command_url = `https://osu.ppy.sh/api/v2/users/${userId}/scores/recent?limit=1&include_fails=1`;
                const command_res = await fetch(command_url, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token_json.access_token}`,
                    },
                });

                if (!command_res.ok) {
                    console.error(`Server responded with status: ${command_res.status}`);
                    return;
                }

                const command_json = await command_res.json();
                console.log(command_json);

                const max_possible_combo = command_json[0].max_combo;
                const hits_string = `[${command_json[0].statistics.count_300}/${command_json[0].statistics.count_100}/${command_json[0].statistics.count_50}/${command_json[0].statistics.count_miss}]`;

                // calculate pp value of play
                const [score] = command_json;
                const pp_method = new std_ppv2().setPerformance(score);
                const pp_weight = await pp_method.compute();
                // end of pp calculation

                // get a big string with all map informations
                var map_length_string = command_json[0].beatmap.total_length
                var map_bpm_string = command_json[0].beatmap.bpm
                var map_objects_string = command_json[0].beatmap.count_circles + command_json[0].beatmap.count_sliders + command_json[0].beatmap.count_spinners

                var map_cs_string = command_json[0].beatmap.cs;
                var map_ar_string = command_json[0].beatmap.ar;
                var map_od_string = command_json[0].beatmap.accuracy;
                var map_hp_string = command_json[0].beatmap.drain;
                var map_star_string = command_json[0].beatmap.difficulty_rating;

                if (command_json[0].mods.includes('HT')) {
                    map_length_string = (map_length_string * 1.33).toFixed(0);
                    map_bpm_string = (map_bpm_string * 0.75).toFixed(0);
                    map_ar_string = (map_ar_string / 1.27).toFixed(2);
                    map_od_string = (map_od_string / 1.29).toFixed(2);
                } else if (command_json[0].mods.includes('DT')) {

                }

                if (command_json[0].mods.includes('EZ')) {
                    map_cs_string = (map_cs_string / 2).toFixed(1);
                    map_ar_string = (map_ar_string / 2).toFixed(2);
                    map_od_string = (map_od_string / 2).toFixed(2);
                    map_hp_string = (map_hp_string / 2).toFixed(1);
                } else if (command_json[0].mods.includes('HR')) {

                }
                const map_length = `Length: ${inlineCode(`${Math.floor(map_length_string / 60)}:${('0' + (map_length_string % 60)).slice(-2)}`)}`;
                const map_bpm = `BPM: ${inlineCode(Math.floor(map_bpm_string))}`;
                const map_objects = `Objects: ${inlineCode(map_objects_string)}`;

                const map_circles = `Circles: ${inlineCode(command_json[0].beatmap.count_circles)}`
                const map_sliders = `Sliders: ${inlineCode(command_json[0].beatmap.count_sliders)}`
                const map_spinners = `Spinners: ${inlineCode(command_json[0].beatmap.count_spinners)}`

                const map_cs = `CS: ${inlineCode(map_cs_string)}`;
                const map_ar = `AR: ${inlineCode(map_ar_string)}`;
                const map_od = `OD: ${inlineCode(map_od_string)}`;
                const map_hp = `HP: ${inlineCode(map_hp_string)}`;

                const map_star = `Stars: ${inlineCode(map_star_string)}`;
                const map_mapper = `Mapper: ${inlineCode(command_json[0].beatmapset.creator)}`
                const map_status = `Status: ${inlineCode(command_json[0].beatmapset.status)}`

                const map_stat = `${map_length} ${map_bpm} ${map_objects}
                                ${map_circles} ${map_sliders} ${map_spinners}
                                ${map_cs} ${map_ar} ${map_od} ${map_hp}
                                ${map_star} ${map_mapper} ${map_status}`;
                // end of map info calculations
                var mods;
                if (command_json[0].mods.length == 0) {
                    mods = 'NM';
                } else {
                    mods = command_json[0].mods;
                }

                const commandResult = new EmbedBuilder()
                    .setColor('#6b048a')
                    .setAuthor({name: 'Stolas Bot by Eth22', iconURL: interaction.client.user.displayAvatarURL(), url: 'https://eth22.fr'})
                    .setThumbnail(`https://a.ppy.sh/${userId}?1598637145.jpeg`)
                    .setTitle(`${command_json[0].beatmapset.artist} - ${command_json[0].beatmapset.title} [${command_json[0].beatmap.version}]`)
                    .setURL(`${command_json[0].beatmap.url}`)
                    .setImage(`${command_json[0].beatmapset.covers['cover@2x']}`)
                    .setFooter({text: `${now}`, iconURL: interaction.client.user.displayAvatarURL()})
                    .addFields(
                        {name: `${bold('Player')}`, value: `${command_json[0].user.username}`},
                        {name: `${bold('Grade')}`, value: `${command_json[0].rank} + [${mods}]`, inline: true},
                        {name: `${bold('Score')}`, value: `${command_json[0].score.toLocaleString()}`, inline: true},
                        {name: `${bold('Accuracy')}`, value: `${(command_json[0].accuracy * 100).toFixed(2)}%`, inline: true},
                        {name: `${bold('PP')}`, value: `${bold(pp_weight['total'].toFixed(2))}/${'Max'}`, inline: true},
                        {name: `${bold('Hits')}`, value: `${hits_string}`, inline: true},
                        {name: `${bold('Combo')}`, value: `${bold(`${command_json[0].max_combo}x`)}/${max_possible_combo}`, inline: true},

                        {name: `\u200B`, value: `\u200B`},

                        {name: `${bold('Map informations')}`, value: `${(map_stat)}`, inline: true},
                    )
                return interaction.reply({embeds: [commandResult]});
            }

            if (interaction.options.getSubcommand() === 'recent_medal') {
                const user = interaction.options.getString('user');

                var getId_url = `https://osu.ppy.sh/api/v2/users/` + user;
                console.log(`user is ${user}, url is ${getId_url}`)
                const getId_res = await fetch(getId_url, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token_json.access_token}`,
                    },
                });
                const getId_json = await getId_res.json();

                if (getId_res.status != 200) {
                    return interaction.reply({content: `Couldn't fetch user_id`, ephemeral: true});
                }
                const userId = getId_json.id;
                console.log(userId);

                var command_url = `https://osu.ppy.sh/api/v2/users/${userId}`;
                const command_res = await fetch(command_url, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token_json.access_token}`,
                    },
                });
                const command_json = await command_res.json();
                console.log(command_json);

                if (command_json.user_achievements.length > 0) {

                    // get medal info here
                        const commandResult = new EmbedBuilder()
                        .setColor('#6b048a')
                        .setAuthor({name: 'Stolas Bot by Eth22', iconURL: interaction.client.user.displayAvatarURL(), url: 'https://eth22.fr'})
                        .setThumbnail(`https://a.ppy.sh/${userId}?1598637145.jpeg`)
                        .setTitle(`User's most recent medal`)
                        .setURL(`https://osu.ppy.sh/users/${userId}`)
                        .setImage(`medal image here`)
                        .setFooter({text: `${now}`, iconURL: interaction.client.user.displayAvatarURL()})
                        .addFields(
                            {name: `${bold('Name')}`, value: `Medal name`},
                            {name: `${bold('Description')}`, value: `Medal description`, inline: true},
                            {name: `${bold('Date Achieved')}`, value: `Medal date`, inline: true},
                            {name: `\u200B`, value: `\u200B`},
                        )
                    return interaction.reply({embeds: [commandResult]});

                } else {
                    const commandResult = new EmbedBuilder()
                    .setColor('#6b048a')
                    .setAuthor({name: 'Stolas Bot by Eth22', iconURL: interaction.client.user.displayAvatarURL(), url: 'https://eth22.fr'})
                    .setThumbnail(`https://a.ppy.sh/${userId}?1598637145.jpeg`)
                    .setTitle(`User's most recent medal`)
                    .setURL(`https://osu.ppy.sh/users/${userId}`)
                    .setImage(`medal image here`)
                    .setFooter({text: `${now}`, iconURL: interaction.client.user.displayAvatarURL()})
                    .addFields(
                        {name: `${bold('Error')}`, value: `This user has no medals!`},
                        {name: `\u200B`, value: `\u200B`},
                    )
                    return interaction.reply({embeds: [commandResult]});
                }
            }

            return interaction.reply({content: `Nothing? POG`, ephemeral: true});
        } else {
            return interaction.reply({content: `Error? BAD`, ephemeral: true});
        }
    },
};
