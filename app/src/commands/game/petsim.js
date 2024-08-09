const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { bold, italic, strikethrough, underscore, spoiler, quote, blockQuote, inlineCode, codeBlock } = require('discord.js');
const logger = require('../../logger.js');
const moment = require('moment');

const requestOptions = {
    method: 'GET',
    redirect: 'follow'
};

function formatValue(num) {
    return num.toLocaleString();
}

let paddingLength = 50

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('petsim')
		.setDescription('Multipurpose pet simulator 99 command (WIP)')
        .setDMPermission(false)

        .addSubcommand(subcommand =>
            subcommand
                .setName('rap')
                .setDescription('Info about the most recent score of a user')
                .addStringOption(option =>
                    option
                        .setName('target')
                        .setDescription('Item you want the rap value of')
                        .setRequired(true)
                        .addChoices(
                            // Enchants
                            { name: 'Chest Mimic', value: 'enchant_cm' },
                            { name: 'Boss Chest Mimic', value: 'enchant_boss_cm' },
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('pet')
                .setDescription('Info about a specified pet')
                .addStringOption(option =>
                    option
                        .setName('target_pet')
                        .setDescription('Pet you want informations on')
                        .setRequired(true)
                        .setAutocomplete(true)
                        )),
    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);

        let choices;

        if (focusedOption.name === 'target_pet')
        {
            choices = [
                // Normal Pets
                'Happy Rock',
                'Kraken',

                // Exclusive Pets
                    // 85%
                'Unicorn Dragon',

                    // 90%

                    // 95%
                'Cosmic Agony',

                // Huge Pets
                'Huge Arcade Cat', 'Huge Atlantean Orca',
                'Huge Balloon Cat', 'Huge BIG Maskot',
                'Huge Chef Cat', 'Huge Chest Mimic', 'Huge Clover Fairy', 'Huge Cosmic Agony', 'Huge Cosmic Axolotl', 'Huge Cow', 'Huge Cupid Corgi',
                'Huge Doodle Fairy',
                'Huge Easter Bunny', 'Huge Easter Dominus', 'Huge Empyrean Agony', 'Huge Error Cat',
                'Huge Festive Cat', 'Huge Firefighter Dalmation', 'Huge Fluffy Cat',
                'Huge Gecko', 'Huge Goblin',
                'Huge Hacked Cat', 'Huge Happy Rock', 'Huge Happy Computer', 'Huge Hell Rock',
                'Huge Jester Dog', 'Huge Jolly Penguin',
                'Huge King Cobra',
                'Huge Marshmallow Agony', 'Huge Mosaic Lamb',
                'Huge Nightfall Wolf', 'Huge Nightmare Spirit', 'Huge Ninja Axolotl',
                'Huge Party Axolotl', 'Huge Party Crown Ducky', 'Huge Pineapple Cat', 'Huge Pixel Corgi', 'Huge Pop Cat', 'Huge Pumpkin Cat',
                'Huge Rainbow Slime', 'Huge Rich Cat',
                'Huge Safari Dog', 'Huge Scary Cat', 'Huge Skeleton', 'Huge Snowman', 'Huge Squirrel',
                'Huge Tiedye Cat',
                'Huge Valentines Cat', 'Huge Vampire Bat',
                'Huge Zebra',

                // Titanic
                'Titanic Bat Cat',
                'Titanic Cat',
            ];
        }

        const filtered = choices.filter(choice => choice.toLowerCase().startsWith(focusedOption.value.toLowerCase())).slice(0, 25);
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        );
    },

    async execute(interaction) {

        const now = moment().format('MM/DD/YYYY HH:mm:ss');

//
// Rap subcommand
//
        if (interaction.options.getSubcommand() === 'rap') {
            const target = interaction.options.getString('target');

// Call Biggames API and get the rap value of the market
            let rapData = null;
            try {
                await fetch("https://biggamesapi.io/api/rap", requestOptions)
                    .then(response => response.text())
                    .then(result => {
                        rapData = JSON.parse(result);
                    })
                    .catch(error => {throw error;});
            } catch (error) {
                logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/petsim rap ${target}' in '${interaction.guild.name} #${interaction.channel.name}' issued => API ERROR`);
                return interaction.reply({content: `The API I traverse hath descended into the abyss of offline. Return dear, and I, Stolas, shall endeavor to serve thee again.`, ephemeral: true});
            }

            // If target is a pet, call API to get Exists number
            let existsData = null;
            if (target.startsWith('pet_')) {
                try {
                    await fetch("https://biggamesapi.io/api/exists", requestOptions)
                        .then(response => response.text())
                        .then(result => {
                            existsData = JSON.parse(result);
                        })
                        .catch(error => {throw error;});
                } catch (error) {
                    logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/petsim rap ${target}' in '${interaction.guild.name} #${interaction.channel.name}' issued => API ERROR`);
                    return interaction.reply({content: `The API I traverse hath descended into the abyss of offline. Return dear, and I, Stolas, shall endeavor to serve thee again.`, ephemeral: true});
                }
            }

// Get the value of the target
            var targetRapData = null;
            var targetImageID = null;
            switch(target) {

                // Enchants
                case 'enchant_cm':
                    targetRapData = rapData.data.find(item => item.category === 'Enchant' && item.configData.id === 'Chest Mimic');
                    targetImageID = "15257719276";
                    break;
                case 'enchant_boss_cm':
                    targetRapData = rapData.data.find(item => item.category === 'Enchant' && item.configData.id === 'Boss Chest Mimic');
                    targetImageID = "16457058891";
                    break;

                // Ultimates
                default:
                    console.log(`${now} - ${interaction.user.username} (${interaction.user.id}) '/petsim rap ${target}' in '${interaction.guild.name} #${interaction.channel.name}' issued => INVALID TARGET`);
                    return interaction.reply({content: `The target item couldn't be found.`, ephemeral: true});
            }
            let targetValue = targetRapData.value;

            // Debug
            //console.log(targetRapData);

            // Get target image with API Call
            let targetImageUrl = (`https://biggamesapi.io/image/${targetImageID}`);

// Create embed and send reply
            let formattedRapValue = formatValue(targetValue);

            const resultEmbed = new EmbedBuilder()
                .setColor('#6b048a')
                .setAuthor({name: 'Stolas Bot by Eth22', iconURL: interaction.client.user.displayAvatarURL(), url: 'https://eth22.fr'})
                .setTitle(`Rap Value - ${target}`)
                .setThumbnail(targetImageUrl)
                .addFields({ name: `${bold('Target Value : ')}`, value: `:gem: ${formattedRapValue}`},)
                .setFooter({text: `${now}`, iconURL: interaction.client.user.displayAvatarURL()})

            logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/petsim rap ${target}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Target Rap : ${formattedRapValue}`);
            return interaction.reply({embeds: [resultEmbed]});
        }

//
// Pet subcommand
//
        else if (interaction.options.getSubcommand() === 'pet') {
            const target = interaction.options.getString('target_pet');

// API Calls for data
            // Call Biggames API and get the rap value of the market
            let rapData = null;
            try {
                await fetch("https://biggamesapi.io/api/rap", requestOptions)
                    .then(response => response.text())
                    .then(result => {
                        rapData = JSON.parse(result);
                    })
                    .catch(error => {throw error;});
            } catch (error) {
                logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/petsim pet ${target}' in '${interaction.guild.name} #${interaction.channel.name}' issued => API ERROR`);
                return interaction.reply({content: `The API I traverse hath descended into the abyss of offline. Return dear, and I, Stolas, shall endeavor to serve thee again.`, ephemeral: true});
            }

            let existsData = null;
            try {
                await fetch("https://biggamesapi.io/api/exists", requestOptions)
                    .then(response => response.text())
                    .then(result => {
                        existsData = JSON.parse(result);
                    })
                    .catch(error => {throw error;});
            } catch (error) {
                logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/petsim pet ${target}' in '${interaction.guild.name} #${interaction.channel.name}' issued => API ERROR`);
                return interaction.reply({content: `The API I traverse hath descended into the abyss of offline. Return dear, and I, Stolas, shall endeavor to serve thee again.`, ephemeral: true});
            }

            let collectionData = null;
            try {
                await fetch("https://biggamesapi.io/api/collection/Pets", requestOptions)
                    .then(response => response.text())
                    .then(result => {
                        collectionData = JSON.parse(result);
                    })
                    .catch(error => {throw error;});
            } catch (error) {
                logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/petsim pet ${target}' in '${interaction.guild.name} #${interaction.channel.name}' issued => API ERROR`);
                return interaction.reply({content: `The API I traverse hath descended into the abyss of offline. Return dear, and I, Stolas, shall endeavor to serve thee again.`, ephemeral: true});
            }

// Get the value of the target
            var targetRapData = rapData.data.find(item => item.category === 'Pet' && item.configData.id === `${target}` && item.configData.pt !== 1 && item.configData.pt !== 2 && item.configData.sh !== true);
            var targetExistsData = existsData.data.find(item => item.category === 'Pet' && item.configData.id === `${target}` && item.configData.pt !== 1 && item.configData.pt !== 2 && item.configData.sh !== true);
            var targetImageID = collectionData.data.find(item => item.configName === `${target}`);

            var targetGoldenRapData = rapData.data.find(item => item.category === 'Pet' && item.configData.id === `${target}` && item.configData.pt === 1 && item.configData.pt !== 2 && item.configData.sh !== true);
            var targetGoldenExistsData = existsData.data.find(item => item.category === 'Pet' && item.configData.id === `${target}` && item.configData.pt === 1 && item.configData.pt !== 2 && item.configData.sh !== true);

            var targetRainbowRapData = rapData.data.find(item => item.category === 'Pet' && item.configData.id === `${target}` && item.configData.pt !== 1 && item.configData.pt === 2 && item.configData.sh !== true);
            var targetRainbowExistsData = existsData.data.find(item => item.category === 'Pet' && item.configData.id === `${target}` && item.configData.pt !== 1 && item.configData.pt === 2 && item.configData.sh !== true);

            var targetShinyRapData = rapData.data.find(item => item.category === 'Pet' && item.configData.id === `${target}` && item.configData.pt !== 1 && item.configData.pt !== 2 && item.configData.sh === true);
            var targetShinyExistsData = existsData.data.find(item => item.category === 'Pet' && item.configData.id === `${target}` && item.configData.pt !== 1 && item.configData.pt !== 2 && item.configData.sh === true);

            var targetShinyGoldenRapData = rapData.data.find(item => item.category === 'Pet' && item.configData.id === `${target}` && item.configData.pt === 1 && item.configData.pt !== 2 && item.configData.sh === true);
            var targetShinyGoldenExistsData = existsData.data.find(item => item.category === 'Pet' && item.configData.id === `${target}` && item.configData.pt === 1 && item.configData.pt !== 2 && item.configData.sh === true);

            var targetShinyRainbowRapData = rapData.data.find(item => item.category === 'Pet' && item.configData.id === `${target}` && item.configData.pt !== 1 && item.configData.pt === 2 && item.configData.sh === true);
            var targetShinyRainbowExistsData = existsData.data.find(item => item.category === 'Pet' && item.configData.id === `${target}` && item.configData.pt !== 1 && item.configData.pt === 2 && item.configData.sh === true);

            let targetValue = targetRapData?.value || 0;
            let targetExists = targetExistsData?.value || 0;

            let targetGoldenValue = targetGoldenRapData?.value || 0;
            let targetGoldenExists = targetGoldenExistsData?.value || 0;

            let targetRainbowValue = targetRainbowRapData?.value || 0;
            let targetRainbowExists = targetRainbowExistsData?.value || 0;

            let targetShinyValue = targetShinyRapData?.value || 0;
            let targetShinyExists = targetShinyExistsData?.value || 0;

            let targetShinyGoldenValue = targetShinyGoldenRapData?.value || 0;
            let targetShinyGoldenExists = targetShinyGoldenExistsData?.value || 0;

            let targetShinyRainbowValue = targetShinyRainbowRapData?.value || 0;
            let targetShinyRainbowExists = targetShinyRainbowExistsData?.value || 0;

            // Error Handling
            if (!targetImageID) {
                logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/petsim pet ${target}' in '${interaction.guild.name} #${interaction.channel.name}' issued => INVALID TARGET`);
                return interaction.reply({content: `Invalid target. Please try again with a valid target.`, ephemeral: true});
            }

            let targetImageUrl = (`https://biggamesapi.io/image/` + targetImageID.configData.thumbnail.split('//')[1]);

// Create embed and send reply
            // Format Number
            let formattedRapValue = formatValue(targetValue);
            let formattedExistsValue = formatValue(targetExists);

            let formattedGoldenRapValue = formatValue(targetGoldenValue);
            let formattedGoldenExistsValue = formatValue(targetGoldenExists);

            let formattedRainbowRapValue = formatValue(targetRainbowValue);
            let formattedRainbowExistsValue = formatValue(targetRainbowExists);

            let formattedShinyRapValue = formatValue(targetShinyValue);
            let formattedShinyExistsValue = formatValue(targetShinyExists);

            let formattedShinyGoldenRapValue = formatValue(targetShinyGoldenValue);
            let formattedShinyGoldenExistsValue = formatValue(targetShinyGoldenExists);

            let formattedShinyRainbowRapValue = formatValue(targetShinyRainbowValue);
            let formattedShinyRainbowExistsValue = formatValue(targetShinyRainbowExists);

            // Format Strings
            let petRegularString = `:gem:\t${formattedRapValue}`;
            petRegularString = petRegularString.padEnd(paddingLength, '​ ');
            petRegularString = `:star:\t${formattedExistsValue}\n` + petRegularString;

            let petGoldenString = `:gem:\t${formattedGoldenRapValue}`;
            petGoldenString = petGoldenString.padEnd(paddingLength, '​ ');
            petGoldenString = `:star:\t${formattedGoldenExistsValue}\n` + petGoldenString;

            let petRainbowString = `:star:\t${formattedRainbowExistsValue}\n:gem:\t${formattedRainbowRapValue}`;

            let petShinyString = `:gem:\t${formattedShinyRapValue}`;
            petShinyString = petShinyString.padEnd(paddingLength, '​ ');
            petShinyString = `:star:\t${formattedShinyExistsValue}\n` + petShinyString;

            let petShinyGoldenString = `:gem:\t${formattedShinyGoldenRapValue}`;
            petShinyGoldenString = petShinyGoldenString.padEnd(paddingLength, '​ ');
            petShinyGoldenString = `:star:\t${formattedShinyGoldenExistsValue}\n` + petShinyGoldenString;

            let petShinyRainbowString = `:star:\t${formattedShinyRainbowExistsValue}\n:gem:\t${formattedShinyRainbowRapValue}`;

            const resultEmbed = new EmbedBuilder()
                .setColor('#6b048a')
                .setAuthor({name: 'Stolas Bot by Eth22', iconURL: interaction.client.user.displayAvatarURL(), url: 'https://eth22.fr'})
                .setTitle(`Rap Value - ${target}`)
                .setThumbnail(targetImageUrl)
                .addFields(
                    { name: `${bold('Regular')}`, value: petRegularString, inline: true},
                    { name: `${bold('Golden')}`, value: petGoldenString, inline: true},
                    { name: `${bold('Rainbow')}`, value: petRainbowString, inline: true},
                    { name: `${bold('Shiny')}`, value: petShinyString, inline: true},
                    { name: `${bold('Shiny Golden')}`, value: petShinyGoldenString, inline: true},
                    { name: `${bold('Shiny Rainbow')}`, value: petShinyRainbowString, inline: true},
                )
                .setFooter({text: `${now}`, iconURL: interaction.client.user.displayAvatarURL()})

            logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/petsim pet ${target}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Target Rap : ${formattedRapValue} | ${formattedGoldenRapValue} | ${formattedRainbowRapValue} `);
            return interaction.reply({embeds: [resultEmbed]});

        }
    },
};
