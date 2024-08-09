const fs = require('node:fs');
const path = require('node:path');
// import discord
const { Client, Collection, Events, GatewayIntentBits, EmbedBuilder } = require('discord.js');
// import sensible data
const { token } = require('./config.json');
// import logger
const logger = require('./logger.js');
// import database
const Sequelize = require('sequelize');


// create discord intents
const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
] });

client.cooldowns = new Collection();
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        if (!command.autocomplete)
            return;

        try {
            await command.autocomplete(interaction);
        } catch (error) {
            console.error(error);
        }
    }
});

client.login(token);