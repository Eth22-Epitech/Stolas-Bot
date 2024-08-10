const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const logger = require('../../logger.js');
const { henbase_url, henbase_key, henbase_admin_key, admin_users } = require('../../config.json');
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
                .setName('purge_tags')
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

        // Purge Tag
        else if (interaction.options.getSubcommand() === 'purge_tags') {
            if (!admin_users.includes(interaction.user.id)) {
                logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase purge_tags' in '${interaction.guild.name} #${interaction.channel.name}' issued => NOT ADMIN`);
                return interaction.reply({content: `You are not an Admin of Stolas Bot.`, ephemeral: true});
            }

            const command_url = `${henbase_url}/purgeDb/tag`;

            try {
                const response = await fetch(command_url, {
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'admin-key': henbase_admin_key,
                    },
                });

                if (response.ok) {
                    logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase purge_tags' in '${interaction.guild.name} #${interaction.channel.name}' issued => Success`);
                    return interaction.reply({ content: `Database's unused tags purged successfully.`, ephemeral: true });
                } else {
                    logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase purge_tags' in '${interaction.guild.name} #${interaction.channel.name}' issued => Response Not OK`);
                    return interaction.reply({ content: `Failed to purge database's unused tags: ${response.statusText}`, ephemeral: true });
                }
            } catch (error) {
                logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase purge_tags' in '${interaction.guild.name} #${interaction.channel.name}' issued => Error: ${error.message}`);
                return interaction.reply({ content: `Error while purging database's unused tags: ${error.message}`, ephemeral: true });
            }
        }

        // Purge Temp
        else if (interaction.options.getSubcommand() === 'purge_tmp') {
            if (!admin_users.includes(interaction.user.id)) {
                logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase purge_tmp' in '${interaction.guild.name} #${interaction.channel.name}' issued => NOT ADMIN`);
                return interaction.reply({content: `You are not an Admin of Stolas Bot.`, ephemeral: true});
            }

            const command_url = `${henbase_url}/purgeDb/tmp`;

            try {
                const response = await fetch(command_url, {
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'admin-key': henbase_admin_key,
                    },
                });

                if (response.ok) {
                    logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase purge_tmp' in '${interaction.guild.name} #${interaction.channel.name}' issued => Success`);
                    return interaction.reply({ content: `Local temporary files deleted successfully.`, ephemeral: true });
                } else {
                    logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase purge_tmp' in '${interaction.guild.name} #${interaction.channel.name}' issued => Response Not OK`);
                    return interaction.reply({ content: `Failed to delete local temporary file: ${response.statusText}`, ephemeral: true });
                }
            } catch (error) {
                logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase purge_tmp' in '${interaction.guild.name} #${interaction.channel.name}' issued => Error: ${error.message}`);
                return interaction.reply({ content: `Error while deleting local temporary file: ${error.message}`, ephemeral: true });
            }
        }

        // Add Tag
        else if (interaction.options.getSubcommand() === 'add_tag') {
            const tag = interaction.options.getString('tag', true);

            if (!admin_users.includes(interaction.user.id)) {
                logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase add_tag ${tag}' in '${interaction.guild.name} #${interaction.channel.name}' issued => NOT ADMIN`);
                return interaction.reply({content: `You are not an Admin of Stolas Bot.`, ephemeral: true});
            }

            const command_url = `${henbase_url}/addTag?tag=${encodeURIComponent(tag)}`;

            try {
                const response = await fetch(command_url, {
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'admin-key': henbase_admin_key,
                    },
                });

                if (response.ok) {
                    logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase add_tag ${tag}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Success`);
                    return interaction.reply({ content: `Added tag \`${tag}\` successfully.`, ephemeral: true });
                } else {
                    logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase add_tag ${tag}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Response Not OK`);
                    return interaction.reply({ content: `Failed to add tag \`${tag}\`.: ${response.statusText}`, ephemeral: true });
                }
            } catch (error) {
                logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase add_tag ${tag}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Error: ${error.message}`);
                return interaction.reply({ content: `Error while adding tag \`${tag}\`.: ${error.message}`, ephemeral: true });
            }
        }

        // Remove Tag
        else if (interaction.options.getSubcommand() === 'remove_tag') {
            const tag = interaction.options.getString('tag', true);

            if (!admin_users.includes(interaction.user.id)) {
                logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase remove_tag ${tag}' in '${interaction.guild.name} #${interaction.channel.name}' issued => NOT ADMIN`);
                return interaction.reply({content: `You are not an Admin of Stolas Bot.`, ephemeral: true});
            }

            const command_url = `${henbase_url}/removeTag?tag=${encodeURIComponent(tag)}`;

            try {
                const response = await fetch(command_url, {
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'admin-key': henbase_admin_key,
                    },
                });

                if (response.ok) {
                    logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase remove_tag ${tag}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Success`);
                    return interaction.reply({ content: `Removed tag \`${tag}\` successfully.`, ephemeral: true });
                } else {
                    logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase remove_tag ${tag}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Response Not OK`);
                    return interaction.reply({ content: `Failed to remove tag \`${tag}\`.: ${response.statusText}`, ephemeral: true });
                }
            } catch (error) {
                logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase remove_tag ${tag}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Error: ${error.message}`);
                return interaction.reply({ content: `Error while removing tag \`${tag}\`.: ${error.message}`, ephemeral: true });
            }
        }

        // Edit Tag
        else if (interaction.options.getSubcommand() === 'edit_tag') {
            const old_tag = interaction.options.getString('old_tag', true);
            const new_tag = interaction.options.getString('new_tag', true);

            if (!admin_users.includes(interaction.user.id)) {
                logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase edit_tag ${old_tag} ${new_tag}' in '${interaction.guild.name} #${interaction.channel.name}' issued => NOT ADMIN`);
                return interaction.reply({content: `You are not an Admin of Stolas Bot.`, ephemeral: true});
            }

            const command_url = `${henbase_url}/editTag?oldTag=${encodeURIComponent(old_tag)}&newTag=${encodeURIComponent(new_tag)}`;

            try {
                const response = await fetch(command_url, {
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'admin-key': henbase_admin_key,
                    },
                });

                if (response.ok) {
                    logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase edit_tag ${old_tag} ${new_tag}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Success`);
                    return interaction.reply({ content: `Edited tag \`${old_tag}\` to \`${new_tag}\` successfully.`, ephemeral: true });
                } else {
                    logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase edit_tag ${old_tag} ${new_tag}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Response Not OK`);
                    return interaction.reply({ content: `Failed to edit tag \`${old_tag}\` to \`${new_tag}\`.: ${response.statusText}`, ephemeral: true });
                }
            } catch (error) {
                logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase edit_tag ${old_tag} ${new_tag}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Error: ${error.message}`);
                return interaction.reply({ content: `Error while editing tag \`${old_tag}\` to \`${new_tag}\`.: ${error.message}`, ephemeral: true });
            }
        }

        // List all Tags
        else if (interaction.options.getSubcommand() === 'list_tags') {

            if (!admin_users.includes(interaction.user.id)) {
                logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase list_tags' in '${interaction.guild.name} #${interaction.channel.name}' issued => NOT ADMIN`);
                return interaction.reply({content: `You are not an Admin of Stolas Bot.`, ephemeral: true});
            }

            const command_url = `${henbase_url}/listTags`;

            try {
                const response = await fetch(command_url, {
                    method: 'GET',
                    headers: {
                        'accept': 'application/json',
                        'api-key': henbase_key,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    const tags = data.tags;
                    const tagsPerPage = 10;
                    const totalPages = Math.ceil(tags.length / tagsPerPage);

                    const generateEmbed = (page) => {
                        const start = (page - 1) * tagsPerPage;
                        const end = start + tagsPerPage;
                        const pageTags = tags.slice(start, end).map(tag => tag.name); // Extract tag names

                        const embed = new EmbedBuilder()
                            .setColor('#6b048a')
                            .setAuthor({name: 'Stolas Bot by Eth22', iconURL: interaction.client.user.displayAvatarURL(), url: 'https://eth22.fr'})
                            .setTitle('Tags List')
                            .setDescription(pageTags.join('\n'))
                            .setFooter({text: `${now}`, iconURL: interaction.client.user.displayAvatarURL()})
                            .addFields({ name: `Page ${page} of ${totalPages}`, value: '\u200B', inline: true });

                        return embed;
                    };

                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('previous')
                                .setLabel('Previous')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setCustomId('next')
                                .setLabel('Next')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(totalPages <= 1)
                        );

                    logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase list_tags' in '${interaction.guild.name} #${interaction.channel.name}' issued => Page 1`);
                    await interaction.reply({ embeds: [generateEmbed(1)], components: [row]});

                    const filter = i => i.customId === 'previous' || i.customId === 'next';
                    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

                    let currentPage = 1;

                    collector.on('collect', async i => {
                        if (i.customId === 'previous') {
                            currentPage--;
                        } else if (i.customId === 'next') {
                            currentPage++;
                        }

                        logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase list_tags' in '${interaction.guild.name} #${interaction.channel.name}' issued => Page ${currentPage}`);
                        await i.update({
                            embeds: [generateEmbed(currentPage)],
                            components: [
                                new ActionRowBuilder()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setCustomId('previous')
                                            .setLabel('Previous')
                                            .setStyle(ButtonStyle.Primary)
                                            .setDisabled(currentPage === 1),
                                        new ButtonBuilder()
                                            .setCustomId('next')
                                            .setLabel('Next')
                                            .setStyle(ButtonStyle.Primary)
                                            .setDisabled(currentPage === totalPages)
                                    )
                            ]
                        });
                    });

                    collector.on('end', collected => {
                        interaction.editReply({ components: [] });
                    });
                } else {
                    const errorText = await response.text();
                    logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase list_tags' in '${interaction.guild.name} #${interaction.channel.name}' issued => Response Not OK: ${errorText}`);
                    return interaction.reply({ content: `Failed to list all tags: ${response.statusText}`, ephemeral: true });
                }
            } catch (error) {
                logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase list_tags' in '${interaction.guild.name} #${interaction.channel.name}' issued => Error: ${error.message}`);
                return interaction.reply({ content: `Error while listing all tags: ${error.message}`, ephemeral: true });
            }
        }

        else {
            return interaction.reply({content: `Invalid subcommand`, ephemeral: true});
        }
    },
};
