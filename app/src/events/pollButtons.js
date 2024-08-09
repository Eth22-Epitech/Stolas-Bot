const { ButtonInteraction }  = require("discord.js");
var moment = require('moment');

const votedMembers = new Set();

module.exports = {
    name: "interactionCreate",
    /**
     *
     * @param {ButtonInteraction} interaction
     */
    async execute(interaction) {

        var now = moment().format('MM/DD/YYYY HH:mm:ss');

        if (!interaction.isButton()) {
            return;
        }

        const pollEmbed = interaction.message.embeds[0];
        if (!pollEmbed) {
            return interaction.reply({content: `The blasted poll seems to have slipped through my infernal grasp! How vexing! Pray, summon the wretched developer at once, Eth22#2510, and demand answers for this abomination!`, ephemeral: true});
        }

        if (votedMembers.has(`${interaction.user.id}-${interaction.message.id}`)) {
            for (let x = 1; x <= 11; x++) {
                if (interaction.customId == `choice${x}_id`) {
                    console.log((`${now} - ${interaction.user.username} (${interaction.user.id}) button:'${pollEmbed.fields[x + 1].name.replace(' :', '')}' from poll:'${pollEmbed.fields[0].name.replace(/__\*\*(.*?)\*\*__/g, '$1')}' in '${interaction.guild.name} #${interaction.channel.name}' issued => ALREADY VOTED`));
                }
            }
            return interaction.reply({content: `Alas, your vote has already been cast, much to my dismay.`, ephemeral: true});
        }

        votedMembers.add(`${interaction.user.id}-${interaction.message.id}`);

        var pollFields = {}
        for (let x = 0; x <= 10; x++) {
            if (pollEmbed.fields[x]) {
                pollFields[x] = pollEmbed.fields[x];
            }
        }

        const voteReply = "Ah, splendid! Your precious vote has been duly noted and recorded, my dear.";
        for (let x = 1; x <= 11; x++) {
            if (interaction.customId == `choice${x}_id`) {
                const newCount = parseInt(pollFields[x + 1].value) + 1;
                pollFields[x + 1].value = newCount;

                console.log((`${now} - ${interaction.user.username} (${interaction.user.id}) button:'${pollFields[x + 1].name.replace(' :', '')}' from poll:'${pollFields[0].name.replace(/__\*\*(.*?)\*\*__/g, '$1')}' in '${interaction.guild.name} #${interaction.channel.name}' issued => ${pollFields[x + 1].value}`));
                interaction.reply({content: voteReply, ephemeral: true});
                interaction.message.edit({embeds: [pollEmbed]});
            }
        }
    }
}
