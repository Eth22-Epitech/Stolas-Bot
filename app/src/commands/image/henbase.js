const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const { bold, italic, strikethrough, underscore, spoiler, quote, blockQuote, inlineCode, codeBlock } = require('discord.js');
const logger = require('../../logger.js');
const { henbase_url, henbase_key, henbase_admin_key, trusted_users, admin_users } = require('../../config.json');
const moment = require('moment');

// Function to convert size to appropriate unit
async function formatSize(size) {
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB'];
    let unitIndex = 0;

    while (size >= 1000 && unitIndex < units.length - 1) {
        size /= 1000;
        unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
}

// Function to get an entry's data and file from its id
async function getEntryData(now, interaction, entryId, current_index = -1, max_index = -1) {
    const command_url = `${henbase_url}/getEntry?entryId=${entryId}`;
    const content_url = `${henbase_url}/content/${entryId}`;

    try {
        const response = await fetch(command_url, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'api-key': henbase_key,
            },
        });

        if (response.ok) {
            const responseData = await response.json();
            const entryData = responseData.entry;

            // Fetch the entry content
            const contentResponse = await fetch(content_url, {
                method: 'GET',
                headers: {
                    'api-key': henbase_key,
                },
            });

            let attachment;
            if (contentResponse.ok) {
                const buffer = await contentResponse.arrayBuffer();

                if (entryData.format === 'image') {
                    attachment = new AttachmentBuilder(Buffer.from(buffer), {name: 'entry_image.png'});
                } else if (entryData.format === 'video') {
                    attachment = new AttachmentBuilder(Buffer.from(buffer), {name: 'entry_video.mp4'});
                } else if (entryData.format === 'gif') {
                    attachment = new AttachmentBuilder(Buffer.from(buffer), {name: 'entry_image.gif'});
                }
            } else {
                return null;
            }

            // Calculate entry's size with correct unit
            let size = await formatSize(entryData.size);

            // Sort tags alphabetically
            const sortedTags = entryData.tags.sort();

            const embed = new EmbedBuilder()
                .setColor('#6b048a')
                .setAuthor({name: 'Stolas Bot by Eth22', iconURL: interaction.client.user.displayAvatarURL(), url: 'https://eth22.fr'})
                .setTitle(`${underscore(`Henbase Entry ${entryData.id}:`)}`)
                .addFields(
                    { name: `Name`, value: `${entryData.name}` },
                    { name: 'Tags', value: `\`${sortedTags.join(', ')}\`` || 'None' },
                    { name: 'Format & Extension', value: `${entryData.format} > \`.${entryData.extension}\``, inline: true },
                    { name: 'Size', value: `\`${size}\``, inline: true },
                )
                .setFooter({text: `${now}`, iconURL: interaction.client.user.displayAvatarURL()});

            if (entryData.artist) {
                embed.addFields(
                    { name: 'Artist', value: `${entryData.artist}` }
                );
            }

            if (current_index !== -1 && max_index !== -1) {
                embed.addFields(
                    { name: 'Search Index', value: `${current_index + 1} / ${max_index}` }
                );
            }

            if (attachment) {
                if (entryData.format === 'image') {
                    embed.setImage('attachment://entry_image.png');
                }  else if (entryData.format === 'gif') {
                    embed.setImage('attachment://entry_image.gif');
                }
            }

            return { embed, attachment };
        } else {
            return null;
        }
    } catch (error) {
        logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase /content/${entryId}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Error: ${error.message}`);
        return null
    }
}

module.exports = {
    cooldown: 2,
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
                .addAttachmentOption(option => option.setName('file').setDescription('File of the entry').setRequired(true))
                .addStringOption(option => option.setName('artist').setDescription('Artist of the entry')))
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
                .addStringOption(option => option.setName('tags').setDescription('Tags to give the entry (separated by comma ",")'))
                .addStringOption(option => option.setName('name').setDescription('(Optional) New name of the entry'))
                .addStringOption(option => option.setName('artist').setDescription('Artist of the entry')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('add_tags_to_entry')
                .setDescription('(ADMIN) Add tags to an existing entry')
                .addIntegerOption(option => option.setName('id').setDescription('Id of the entry').setRequired(true))
                .addStringOption(option => option.setName('tags').setDescription('Tags to give the entry (separated by comma ",")').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('search_entries')
                .setDescription('Search the database for entries')
                .addStringOption(option => option.setName('tags').setDescription('Tags to search for (separated by comma ",")').setRequired(true))
                .addStringOption(option => option.setName('negative_tags').setDescription('(Optional) Tags to ban from the search (separated by comma ",")'))
                .addStringOption(option => option.setName('format').setDescription(`(Optional) File format to search for`).addChoices(
                    { name: 'Image', value: 'image' },
                    { name: 'Gif', value: 'gif' },
                    { name: 'Video', value: 'video' }
                ))
                .addStringOption(option => option.setName('artist').setDescription('Artist of the entry')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('search_random_entry')
                .setDescription('Search the database for a random entry matching the search terms')
                .addStringOption(option => option.setName('tags').setDescription('Tags to search for (separated by comma ",")').setRequired(true))
                .addStringOption(option => option.setName('negative_tags').setDescription('(Optional) Tags to ban from the search (separated by comma ",")'))
                .addStringOption(option => option.setName('format').setDescription(`(Optional) File format to search for`).addChoices(
                    { name: 'Image', value: 'image' },
                    { name: 'Gif', value: 'gif' },
                    { name: 'Video', value: 'video' }
                ))
                .addStringOption(option => option.setName('artist').setDescription('Artist of the entry')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('search_tags')
                .setDescription('(Trusted User) Search for tags with the given prefix')
                .addStringOption(option => option.setName('search').setDescription('Prefix to search tags starting with it').setRequired(true))),

    async execute(interaction) {
        const now = moment().format('MM/DD/YYYY HH:mm:ss');

        // Return if channel isn't nsfw
        if (!interaction.channel.nsfw) {
            logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase' in '${interaction.guild.name} #${interaction.channel.name}' issued => NOT in NSFW Channel`);
            return interaction.reply({content: 'This command can only be used in NSFW channels.', ephemeral: true});
        }

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
                    return interaction.reply({ content: `Added tag \`${tag}\` successfully.` });
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
                    return interaction.reply({ content: `Removed tag \`${tag}\` successfully.` });
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
                    return interaction.reply({ content: `Edited tag \`${old_tag}\` to \`${new_tag}\` successfully.` });
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

            if (!trusted_users.includes(interaction.user.id)) {
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
                    const tags = data.tags.sort((a, b) => a.name.localeCompare(b.name));
                    const tagsPerPage = 10;
                    const totalPages = Math.ceil(tags.length / tagsPerPage);

                    const generateEmbed = (page) => {
                        const start = (page - 1) * tagsPerPage;
                        const end = start + tagsPerPage;
                        const pageTags = tags.slice(start, end).map(tag => `\`${tag.name}\``);

                        return new EmbedBuilder()
                            .setColor('#6b048a')
                            .setAuthor({
                                name: 'Stolas Bot by Eth22',
                                iconURL: interaction.client.user.displayAvatarURL(),
                                url: 'https://eth22.fr'
                            })
                            .setTitle('Henbase Tags List')
                            .setDescription(pageTags.join('\n'))
                            .setFooter({text: `${now}`, iconURL: interaction.client.user.displayAvatarURL()})
                            .addFields({name: `Page ${page} of ${totalPages}`, value: '\u200B', inline: true});
                    };

                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('previous')
                                .setLabel('⬅️')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setCustomId('next')
                                .setLabel('➡️')
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
                                            .setLabel('⬅️')
                                            .setStyle(ButtonStyle.Primary)
                                            .setDisabled(currentPage === 1),
                                        new ButtonBuilder()
                                            .setCustomId('next')
                                            .setLabel('➡️')
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

        // Add Entry
        else if (interaction.options.getSubcommand() === 'add_entry') {
            const name = interaction.options.getString('name', true);
            const tags = interaction.options.getString('tags', true).split(',').map(tag => tag.trim());
            const file = interaction.options.getAttachment('file', true);
            const artist = interaction.options.getString('artist');

            if (!admin_users.includes(interaction.user.id)) {
                logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase add_entry ${name}' in '${interaction.guild.name} #${interaction.channel.name}' issued => NOT ADMIN`);
                return interaction.reply({content: `You are not an Admin of Stolas Bot.`, ephemeral: true});
            }

            let command_url = `${henbase_url}/addEntry?name=${encodeURIComponent(name)}`;
            if (artist) { command_url += `&artist=${encodeURIComponent(artist)}`; }

            try {
                const formData = new FormData();
                formData.append('tags', tags.join(','));
                formData.append('file', new Blob([await fetch(file.url).then(res => res.arrayBuffer())], { type: file.contentType }), file.name);

                const response = await fetch(command_url, {
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'admin-key': henbase_admin_key,
                    },
                    body: formData,
                });

                if (response.ok) {
                    logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase add_entry ${name}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Success`);

                    // Fetch the file again to send it back in the reply
                    const fileBuffer = await fetch(file.url).then(res => res.arrayBuffer());
                    const attachment = new AttachmentBuilder(Buffer.from(fileBuffer), file.name);

                    return interaction.reply({ content: `Added entry \`${name}\` successfully.`, files: [attachment] });
                } else {
                    logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase add_entry ${name}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Response Not OK`);
                    return interaction.reply({ content: `Failed to add entry \`${name}\`.: ${response.statusText}`, ephemeral: true });
                }
            } catch (error) {
                logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase add_entry ${name}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Error: ${error.message}`);
                return interaction.reply({ content: `Error while adding entry \`${name}\`.: ${error.message}`, ephemeral: true });
            }
        }

        // Get Entry
        else if (interaction.options.getSubcommand() === 'get_entry') {
            const entryId = interaction.options.getInteger('id', true);

            if (!trusted_users.includes(interaction.user.id)) {
                logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase get_entry ${entryId}' in '${interaction.guild.name} #${interaction.channel.name}' issued => NOT Trusted User`);
                return interaction.reply({content: `${interaction.user.username} is not a Trusted User of Stolas Bot.`, ephemeral: true});
            }

            const entry = await getEntryData(now, interaction, entryId);

            if (entry) {
                logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase get_entry ${entryId}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Success`);
                return interaction.reply({ embeds: [entry.embed], files: [entry.attachment] });
            } else {
                logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase get_entry ${entryId}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Failed to get entry ${entryId}`);
                return interaction.reply({ content: `Failed to get entry \`${entryId}\`.`, ephemeral: true });
            }
        }

        // Remove Entry
        else if (interaction.options.getSubcommand() === 'remove_entry') {
            const entryId = interaction.options.getInteger('id', true);

            if (!admin_users.includes(interaction.user.id)) {
                logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase remove_entry ${entryId}' in '${interaction.guild.name} #${interaction.channel.name}' issued => NOT ADMIN`);
                return interaction.reply({content: `You are not an Admin of Stolas Bot.`, ephemeral: true});
            }

            const command_url = `${henbase_url}/removeEntry?entryId=${entryId}`;

            try {
                const response = await fetch(command_url, {
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'admin-key': henbase_admin_key,
                    },
                });

                if (response.ok) {
                    logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase remove_entry ${entryId}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Success`);
                    return interaction.reply({ content: `Removed entry \`${entryId}\` successfully.` });
                } else {
                    logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase remove_entry ${entryId}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Response Not OK`);
                    return interaction.reply({ content: `Failed to remove entry \`${entryId}\`.: ${response.statusText}`, ephemeral: true });
                }
            } catch (error) {
                logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase remove_entry ${entryId}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Error: ${error.message}`);
                return interaction.reply({ content: `Error while removing entry \`${entryId}\`.: ${error.message}`, ephemeral: true });
            }
        }

        // Edit Entry
        else if (interaction.options.getSubcommand() === 'edit_entry') {
            const entryId = interaction.options.getInteger('id', true);
            const new_tags = interaction.options.getString('tags')?.split(',').map(tag => tag.trim());
            const new_name = interaction.options.getString('name');
            const new_artist = interaction.options.getString('artist');

            if (!admin_users.includes(interaction.user.id)) {
                logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase edit_entry ${entryId}' in '${interaction.guild.name} #${interaction.channel.name}' issued => NOT ADMIN`);
                return interaction.reply({content: `${interaction.user.username} is not an Admin of Stolas Bot.`, ephemeral: true});
            }

            if (!new_tags && !new_name && !new_artist) {
                return interaction.reply({ content: `No parameters provided to edit entry \`${entryId}\`.`, ephemeral: true });
            }

            let command_url = `${henbase_url}/editEntry?entryId=${entryId}`;
            if (new_name) {
                command_url += `&name=${encodeURIComponent(new_name)}`;
            }
            if (new_artist) {
                command_url += `&artist=${encodeURIComponent(new_artist)}`;
            }

            let body = null;
            if (new_tags) {
                body = JSON.stringify(new_tags);
            }

            try {
                const response = await fetch(command_url, {
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'admin-key': henbase_admin_key,
                        'Content-Type': 'application/json',
                    },
                    body: body,
                });

                if (response.ok) {
                    logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase edit_entry ${entryId}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Success`);
                    return interaction.reply({ content: `Edited entry \`${entryId}\` successfully.` });
                } else {
                    logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase edit_entry ${entryId}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Response Not OK`);
                    return interaction.reply({ content: `Failed to edit entry \`${entryId}\`.: ${response.statusText}`, ephemeral: true });
                }
            } catch (error) {
                logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase edit_entry ${entryId}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Error: ${error.message}`);
                return interaction.reply({ content: `Error while editing entry \`${entryId}\`.: ${error.message}`, ephemeral: true });
            }
        }

        // Add Tags to Entry
        else if (interaction.options.getSubcommand() === 'add_tags_to_entry') {
            const entryId = interaction.options.getInteger('id', true);
            const tags = interaction.options.getString('tags', true).split(',').map(tag => tag.trim());

            if (!admin_users.includes(interaction.user.id)) {
                logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase add_tags_to_entry ${entryId}' in '${interaction.guild.name} #${interaction.channel.name}' issued => NOT ADMIN`);
                return interaction.reply({content: `${interaction.user.username} is not an Admin of Stolas Bot.`, ephemeral: true});
            }

            const getEntryUrl = `${henbase_url}/getEntry?entryId=${entryId}`;

            try {
                // Fetch the entry data
                const entryResponse = await fetch(getEntryUrl, {
                    method: 'GET',
                    headers: {
                        'accept': 'application/json',
                        'api-key': henbase_key,
                    },
                });

                if (!entryResponse.ok) {
                    return interaction.reply({ content: `Failed to get entry \`${entryId}\`.: ${entryResponse.statusText}`, ephemeral: true });
                }

                const entryData = await entryResponse.json();
                const currentTags = entryData.entry.tags || [];

                const editEntryUrl = `${henbase_url}/editEntry?entryId=${entryId}&name=${encodeURIComponent(entryData.entry.name)}`;

                // Add new tags without duplicates
                const updatedTags = [...new Set([...currentTags, ...tags])];

                // Update the entry with the new tag list
                const editResponse = await fetch(editEntryUrl, {
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'admin-key': henbase_admin_key,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedTags),
                });

                if (editResponse.ok) {
                    logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase add_tags_to_entry ${entryId}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Success`);
                    return interaction.reply({ content: `Edited entry \`${entryId}\` successfully.` });
                } else {
                    logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase add_tags_to_entry ${entryId}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Response Not OK`);
                    return interaction.reply({ content: `Failed to edit entry \`${entryId}\`.: ${editResponse.statusText}`, ephemeral: true });
                }
            } catch (error) {
                logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase add_tags_to_entry ${entryId}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Error: ${error.message}`);
                return interaction.reply({ content: `Error while editing entry \`${entryId}\`.: ${error.message}`, ephemeral: true });
            }
        }

        // Search Entries
        else if (interaction.options.getSubcommand() === 'search_entries') {
            const tags = interaction.options.getString('tags', true).split(',').map(tag => tag.trim());
            const negative_tags = interaction.options.getString('negative_tags') ? interaction.options.getString('negative_tags').split(',').map(tag => tag.trim()) : [];
            const format = interaction.options.getString('format');
            const artist = interaction.options.getString('artist');

            if (!trusted_users.includes(interaction.user.id)) {
                logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase search_entries' in '${interaction.guild.name} #${interaction.channel.name}' issued => NOT Trusted User`);
                return interaction.reply({content: `${interaction.user.username} is not a Trusted User of Stolas Bot.`, ephemeral: true});
            }

            // Construct the URL
            let command_url = `${henbase_url}/searchEntries?`;

            // Append tags
            if (!tags) {
                logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase search_entries' in '${interaction.guild.name} #${interaction.channel.name}' issued => No tag provided`);
                return interaction.reply({ content: `At least one tag is expected.`, ephemeral: true });
            }
            tags.forEach(tag => {
                if (typeof tag !== 'string') {
                    tag = String(tag);
                }
                command_url += `tags=${encodeURIComponent(tag)}&`;
            });
            // Append negative tags
            if (negative_tags) {
                negative_tags.forEach(negative_tag => {
                    command_url += `negativeTags=${encodeURIComponent(negative_tag)}&`;
                });
            }
            // Append format if provided
            if (format) {
                command_url += `file_format=${encodeURIComponent(format)}&`;
            }
            // Append artist if provided
            if (artist) {
                command_url += `artist=${encodeURIComponent(artist)}&`;
            }
            // Remove the trailing '&' or '?' if no parameters were added
            command_url = command_url.slice(0, -1);

            try {
                const response = await fetch(command_url, {
                    method: 'GET',
                    headers: {
                        'accept': 'application/json',
                        'api-key': henbase_key,
                    },
                });

                if (response.ok) {
                    const responseData = await response.json();
                    const entryIds = responseData.entries ? responseData.entries.map(entry => entry[0]) : [];

                    if (entryIds.length === 0) {
                        return interaction.reply({ content: `No entries found.`, ephemeral: true });
                    }

                    let currentIndex = 0;

                    const displayEntry = async (index, maxIndex) => {
                        const entry = await getEntryData(now, interaction, entryIds[index], index, maxIndex);
                        if (entry) {
                            await interaction.editReply({ embeds: [entry.embed], files: [entry.attachment], components: [navigationRow] });
                        } else {
                            await interaction.editReply({ content: `Failed to get entry \`${entryIds[index]}\`.`, ephemeral: true });
                        }
                    };

                    const navigationRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('prev')
                                .setLabel('⬅️')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(currentIndex === 0),
                            new ButtonBuilder()
                                .setCustomId('next')
                                .setLabel('➡️')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(currentIndex === entryIds.length - 1)
                        );

                    await interaction.reply({
                        content: ``, components: [navigationRow]
                    });
                    await displayEntry(currentIndex, entryIds.length);

                    const filter = i => i.user.id === interaction.user.id;
                    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

                    collector.on('collect', async i => {
                        if (i.customId === 'prev' && currentIndex > 0) {
                            currentIndex--;
                        } else if (i.customId === 'next' && currentIndex < entryIds.length - 1) {
                            currentIndex++;
                        }

                        navigationRow.components[0].setDisabled(currentIndex === 0);
                        navigationRow.components[1].setDisabled(currentIndex === entryIds.length - 1);

                        await i.update({ components: [navigationRow] });
                        await displayEntry(currentIndex, entryIds.length);
                    });

                    collector.on('end', async () => {
                        navigationRow.components.forEach(button => button.setDisabled(true));
                        await interaction.editReply({ components: [navigationRow] });
                    });

                } else {
                    logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase search_entries' in '${interaction.guild.name} #${interaction.channel.name}' issued => Response Not OK`);
                    return interaction.reply({ content: `Failed to search entries.: ${response.statusText}`, ephemeral: true });
                }
            } catch (error) {
                logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase search_entries' in '${interaction.guild.name} #${interaction.channel.name}' issued => Error: ${error.message}`);
                return interaction.reply({ content: `Error while searching entries.: ${error.message}`, ephemeral: true });
            }
        }

        // Search Random Entry
        else if (interaction.options.getSubcommand() === 'search_random_entry') {
            const tags = interaction.options.getString('tags', true).split(',').map(tag => tag.trim());
            const negative_tags = interaction.options.getString('negative_tags') ? interaction.options.getString('negative_tags').split(',').map(tag => tag.trim()) : [];
            const format = interaction.options.getString('format');
            const artist = interaction.options.getString('artist');

            if (!trusted_users.includes(interaction.user.id)) {
                logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase search_random_entry' in '${interaction.guild.name} #${interaction.channel.name}' issued => NOT Trusted User`);
                return interaction.reply({content: `${interaction.user.username} is not a Trusted User of Stolas Bot.`, ephemeral: true});
            }

            // Construct the URL
            let command_url = `${henbase_url}/searchEntries/random?`;

            // Append tags
            tags.forEach(tag => {
                command_url += `tags=${encodeURIComponent(tag)}&`;
            });
            // Append negative tags
            if (negative_tags.length > 0) {
                negative_tags.forEach(negative_tag => {
                    command_url += `negativeTags=${encodeURIComponent(negative_tag)}&`;
                });
            }
            // Append format if provided
            if (format) {
                command_url += `file_format=${encodeURIComponent(format)}&`;
            }
            // Append artist if provided
            if (artist) {
                command_url += `artist=${encodeURIComponent(artist)}&`;
            }
            // Remove the trailing '&' or '?' if no parameters were added
            command_url = command_url.slice(0, -1);

            const rerollButton = new ButtonBuilder()
                .setCustomId('reroll')
                .setLabel('🔄')
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder().addComponents(rerollButton);

            // Initial reply with loading message and reroll button
            await interaction.reply({ content: 'Fetching entry...', components: [row] });

            const fetchAndDisplayEntry = async () => {
                try {
                    const response = await fetch(command_url, {
                        method: 'GET',
                        headers: {
                            'accept': 'application/json',
                            'api-key': henbase_key,
                        },
                    });

                    if (response.ok) {
                        const responseData = await response.json();
                        const entry = responseData.entry;

                        if (!entry || !entry[0]) {
                            return interaction.editReply({ content: `No entries found.`, components: [] });
                        }

                        const entryData = await getEntryData(now, interaction, entry[0]);
                        if (entryData) {
                            const embed = entryData.embed;
                            const attachment = entryData.attachment;

                            logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase search_random_entry' in '${interaction.guild.name} #${interaction.channel.name}' issued => Entry ${entry[0]}`);
                            await interaction.editReply({ embeds: [embed], files: [attachment], components: [row] });

                            const filter = i => i.customId === 'reroll' && i.user.id === interaction.user.id;
                            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

                            collector.on('collect', async i => {
                                if (i.customId === 'reroll') {
                                    // Fetch new entry data from the API
                                    const newResponse = await fetch(command_url, {
                                        method: 'GET',
                                        headers: {
                                            'accept': 'application/json',
                                            'api-key': henbase_key,
                                        },
                                    });

                                    if (newResponse.ok) {
                                        const newResponseData = await newResponse.json();
                                        const newEntry = newResponseData.entry;

                                        if (!newEntry || !newEntry[0]) {
                                            return i.update({ content: `No entries found.`, components: [] });
                                        }

                                        const newEntryData = await getEntryData(now, interaction, newEntry[0]);
                                        if (newEntryData) {
                                            const newEmbed = newEntryData.embed;
                                            const newAttachment = newEntryData.attachment;
                                            logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) 'reroll search_random_entry' in '${interaction.guild.name} #${interaction.channel.name}' issued => Entry ${newEntry[0]}`);
                                            await i.update({ embeds: [newEmbed], files: [newAttachment], components: [row] });
                                        }
                                    }
                                }
                            });

                            collector.on('end', async () => {
                                row.components.forEach(button => button.setDisabled(true));
                                await interaction.editReply({ components: [row] });
                            });

                        } else {
                            return interaction.editReply({ content: `Failed to get entry data.`, components: [] });
                        }
                    } else {
                        const errorText = await response.text();
                        logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase search_random_entry' in '${interaction.guild.name} #${interaction.channel.name}' issued => Response Not OK: ${errorText}`);
                        return interaction.editReply({ content: `Failed to search for random entry.: ${response.statusText}`, components: [] });
                    }
                } catch (error) {
                    logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase search_random_entry' in '${interaction.guild.name} #${interaction.channel.name}' issued => Error: ${error.message}`);
                    return interaction.editReply({ content: `Error while searching for random entry.: ${error.message}`, components: [] });
                }
            };

            fetchAndDisplayEntry();
        }

        // Search Tags
        else if (interaction.options.getSubcommand() === 'search_tags') {
            const searchPrefix = interaction.options.getString('search', true);

            if (!trusted_users.includes(interaction.user.id)) {
                logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase search_tags ${searchPrefix}' in '${interaction.guild.name} #${interaction.channel.name}' issued => NOT Trusted User`);
                return interaction.reply({content: `${interaction.user.username} is not a Trusted User of Stolas Bot.`, ephemeral: true});
            }

            const searchTagsUrl = `${henbase_url}/searchTags?prefix=${encodeURIComponent(searchPrefix)}`;

            try {
                // Fetch the tags matching the search prefix
                const searchResponse = await fetch(searchTagsUrl, {
                    method: 'GET',
                    headers: {
                        'accept': 'application/json',
                        'api-key': henbase_key,
                    },
                });

                if (searchResponse.ok) {
                    const searchData = await searchResponse.json();
                    const foundTags = searchData.tags.sort((a, b) => a.localeCompare(b));
                    const tagsPerPage = 10;
                    const totalPages = Math.ceil(foundTags.length / tagsPerPage);

                    const generateEmbed = (page) => {
                        const start = (page - 1) * tagsPerPage;
                        const end = start + tagsPerPage;
                        const pageTags = foundTags.slice(start, end).map(tag => `\`${tag}\``);

                        return new EmbedBuilder()
                            .setColor('#6b048a')
                            .setAuthor({
                                name: 'Stolas Bot by Eth22',
                                iconURL: interaction.client.user.displayAvatarURL(),
                                url: 'https://eth22.fr'
                            })
                            .setTitle('Henbase Tags Search Results')
                            .setDescription(pageTags.join('\n'))
                            .setFooter({text: `${now}`, iconURL: interaction.client.user.displayAvatarURL()})
                            .addFields({name: `Page ${page} of ${totalPages}`, value: '\u200B', inline: true});
                    };

                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('previous')
                                .setLabel('⬅️')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setCustomId('next')
                                .setLabel('➡️')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(totalPages <= 1)
                        );

                    logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase search_tags ${searchPrefix}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Page 1`);
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

                        logger.log('info', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase search_tags ${searchPrefix}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Page ${currentPage}`);
                        await i.update({
                            embeds: [generateEmbed(currentPage)],
                            components: [
                                new ActionRowBuilder()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setCustomId('previous')
                                            .setLabel('⬅️')
                                            .setStyle(ButtonStyle.Primary)
                                            .setDisabled(currentPage === 1),
                                        new ButtonBuilder()
                                            .setCustomId('next')
                                            .setLabel('➡️')
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
                    const errorText = await searchResponse.text();
                    logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase search_tags ${searchPrefix}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Response Not OK: ${errorText}`);
                    return interaction.reply({ content: `Failed to search tags with prefix \`${searchPrefix}\`.: ${searchResponse.statusText}`, ephemeral: true });
                }
            } catch (error) {
                logger.log('error', `${now} - ${interaction.user.username} (${interaction.user.id}) '/henbase search_tags ${searchPrefix}' in '${interaction.guild.name} #${interaction.channel.name}' issued => Error: ${error.message}`);
                return interaction.reply({ content: `Error while searching tags with prefix \`${searchPrefix}\`.: ${error.message}`, ephemeral: true });
            }
        }

        else {
            return interaction.reply({content: `Invalid subcommand`, ephemeral: true});
        }
    },
};
