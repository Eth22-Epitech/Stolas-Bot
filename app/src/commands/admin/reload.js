const { SlashCommandBuilder } = require('discord.js');
const logger = require('../../logger.js');
const { admin_users } = require('../../config.json');
const moment = require('moment');

module.exports = {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reloads a command.')
        .addStringOption(option =>
            option.setName('category')
                .setDescription('The command to reload.')
                .setRequired(true)
                .setChoices(
                    { name: 'Admin', value: 'admin' },
                    { name: 'Fun', value: 'fun' },
                    { name: 'Game', value: 'game' },
                    { name: 'Gifs', value: 'gifs' },
                    { name: 'Image', value: 'image' },
                    { name: 'Public', value: 'public' },
                    { name: 'Useful', value: 'useful' }
                ))
        .addStringOption(option =>
            option.setName('command')
                .setDescription('The command to reload.')
                .setRequired(true)),
    async execute(interaction) {
        const now = moment().format('MM/DD/YYYY HH:mm:ss');

        const commandName = interaction.options.getString('command', true).toLowerCase();
        const category = interaction.options.getString('category', true).toLowerCase();
        const command = interaction.client.commands.get(commandName);

        if (!admin_users.includes(interaction.user.id)) {
            logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/reload ${category} ${commandName}' in '${interaction.guild.name} #${interaction.channel.name}' issued => NOT ADMIN`);
            return interaction.reply({content: `You are not an Admin of Stolas Bot.`, ephemeral: true});
        }

        if (!command) {
            logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/reload ${category} ${commandName}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Invalid command name`);
            return interaction.reply(`There is no command with name \`${commandName}\`!`);
        }

        delete require.cache[require.resolve(`../${category}/${command.data.name}.js`)];

        try {
            interaction.client.commands.delete(command.data.name);
            const newCommand = require(`../${category}/${command.data.name}.js`);
            interaction.client.commands.set(newCommand.data.name, newCommand);
            logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/reload ${category} ${commandName}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Reloaded`);
            return interaction.reply({content: `Command \`${newCommand.data.name}\` was reloaded!`, ephemeral: true});
        } catch (error) {
            logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/reload ${category} ${commandName}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Caught Error`);
            return interaction.reply({content: `There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``, ephemeral: true});
        }
    },
};