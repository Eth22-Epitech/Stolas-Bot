const winston = require('winston');
const fs = require('node:fs');
const path = require('node:path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// define log infos
const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    modules: 3,
    modwarn: 4,
    modinfo: 5,
    debug: 6,
}

winston.addColors({
    error: 'red',
    warn: 'yellow',
    info: 'green',
    modules: 'cyan',
    modwarn: 'yellow',
    modinfo: 'green',
    debug: 'blue',
})

const logger = winston.createLogger({
    levels: logLevels,
    transports: [
        new winston.transports.Console({ colorize: true, timestamp: true }),
        new winston.transports.File({
            filename: path.join(logsDir, 'stolas.log'),
            maxsize: 1000000, // 1MB
            maxFiles: 5,
            tailable: true, // Newest log entries go into the most recent file
        })
    ],
    format: winston.format.combine(
        winston.format.padLevels({ levels: logLevels }),
        winston.format.timestamp(),
        winston.format.printf(info => `- ${info.level}:${info.message}`),
    ),
    level: 'debug',
});

module.exports = logger;