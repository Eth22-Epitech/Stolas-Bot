# Build Image
FROM node:latest

# Create the bot's directory
WORKDIR /stolas_bot

# Install the bot's dependencies
COPY package.json /stolas_bot
RUN npm install

# Copy the bot's files
COPY . /stolas_bot

# Run the bot
CMD npm run start