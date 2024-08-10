const { SlashCommandBuilder } = require('discord.js');
const logger = require('../../logger.js');
const { henbase_url, henbase_admin_key, trusted_users, admin_users } = require('../../config.json');
const moment = require('moment');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('henbase')
        .setDescription('(ADMIN / Trusted Users) Command to handle and interact with the Henbase API')
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('create_database')
                .setDescription('(ADMIN) Call method to create database file'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('purge_entries')
                .setDescription('(ADMIN) Purge missing files entries from database'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('purge_tag')
                .setDescription('(ADMIN) Purge unassigned tags from database'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('purge_tmp')
                .setDescription('(ADMIN) Purge temporary files from local files'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('add_tag')
                .setDescription('(ADMIN) Add a tag to the database')
                .addStringOption(option => option.setName('tag').setDescription('Tag to add').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove_tag')
                .setDescription('(ADMIN) Remove a tag from the database')
                .addStringOption(option => option.setName('tag').setDescription('Tag to remove').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('edit_tag')
                .setDescription('(ADMIN) Edit a tag from the database')
                .addStringOption(option => option.setName('old_tag').setDescription('Tag to rename').setRequired(true))
                .addStringOption(option => option.setName('new_tag').setDescription('New tag name').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list_tags')
                .setDescription('(Trusted Users) List all tags in the database'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('add_entry')
                .setDescription('(ADMIN) Add an entry to the database')
                .addStringOption(option => option.setName('name').setDescription('Name of the entry').setRequired(true))
                .addStringOption(option => option.setName('tags').setDescription('Tags to give the entry (separated by comma ",")').setRequired(true))
                .addAttachmentOption(option => option.setName('file').setDescription('File of the entry').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('get_entry')
                .setDescription(`(Trusted Users) Get an entry's info from its id`)
                .addIntegerOption(option => option.setName('id').setDescription('Id of the entry').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove_entry')
                .setDescription(`(ADMIN) Remove an entry with its id`)
                .addIntegerOption(option => option.setName('id').setDescription('Id of the entry').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('edit_entry')
                .setDescription('(ADMIN) Edit an entry to the database')
                .addIntegerOption(option => option.setName('id').setDescription('Id of the entry').setRequired(true))
                .addStringOption(option => option.setName('tags').setDescription('Tags to give the entry (separated by comma ",")').setRequired(true))
                .addStringOption(option => option.setName('name').setDescription('(Optional) New name of the entry')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('search')
                .setDescription('Search the database for entries')
                .addStringOption(option => option.setName('tags').setDescription('Tags to search for (separated by comma ",")').setRequired(true))
                .addStringOption(option => option.setName('negative_tags').setDescription('(Optional) Tags to ban from the search (separated by comma ",")'))
                .addStringOption(option => option.setName('format').setDescription(`(Optional) File format to search for`).addChoices(
                    { name: 'Image', value: 'image' },
                    { name: 'Gif', value: 'gif' },
                    { name: 'Video', value: 'video' }
                ))),

    async execute(interaction) {
        const now = moment().format('MM/DD/YYYY HH:mm:ss');

        // Create Database
        if (interaction.options.getSubcommand() === 'create_database') {
            if (!admin_users.includes(interaction.user.id)) {
                logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase create_database' in '${interaction.guild.name} #${interaction.channel.name}' issued => NOT ADMIN`);
                return interaction.reply({content: `You are not an Admin of Stolas Bot.`, ephemeral: true});
            }

            const command_url = `${henbase_url}/createDb`;

            try {
                const response = await fetch(command_url, {
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'admin-key': henbase_admin_key,
                    },
                });

                if (response.ok) {
                    logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase create_database' in '${interaction.guild.name} #${interaction.channel.name}' issued => Success`);
                    return interaction.reply({ content: 'Database created successfully.', ephemeral: true });
                } else {
                    logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase create_database' in '${interaction.guild.name} #${interaction.channel.name}' issued => Response Not OK`);
                    return interaction.reply({ content: `Failed to create database: ${response.statusText}`, ephemeral: true });
                }
            } catch (error) {
                logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase create_database' in '${interaction.guild.name} #${interaction.channel.name}' issued => Error: ${error.message}`);
                return interaction.reply({ content: `Error while creating database: ${error.message}`, ephemeral: true });
            }
        }

        // Purge Entry
        else if (interaction.options.getSubcommand() === 'purge_entries') {
            if (!admin_users.includes(interaction.user.id)) {
                logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase purge_entries' in '${interaction.guild.name} #${interaction.channel.name}' issued => NOT ADMIN`);
                return interaction.reply({content: `You are not an Admin of Stolas Bot.`, ephemeral: true});
            }

            const command_url = `${henbase_url}/purgeDb/entry`;

            try {
                const response = await fetch(command_url, {
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'admin-key': henbase_admin_key,
                    },
                });

                if (response.ok) {
                    logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase purge_entries' in '${interaction.guild.name} #${interaction.channel.name}' issued => Success`);
                    return interaction.reply({ content: `Database's entries purged successfully.`, ephemeral: true });
                } else {
                    logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase purge_entries' in '${interaction.guild.name} #${interaction.channel.name}' issued => Response Not OK`);
                    return interaction.reply({ content: `Failed to purge database's entries: ${response.statusText}`, ephemeral: true });
                }
            } catch (error) {
                logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase purge_entries' in '${interaction.guild.name} #${interaction.channel.name}' issued => Error: ${error.message}`);
                return interaction.reply({ content: `Error while purging database's entries: ${error.message}`, ephemeral: true });
            }
        }

        else {
            return interaction.reply({content: `Invalid subcommand`, ephemeral: true});
        }
    },
};
