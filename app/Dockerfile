# Build Image
FROM node:latest

# Create the bot's directory
RUN mkdir /app

# Set the bot's directory as the working directory
WORKDIR /app

# Copy the bot's files
COPY ./src /app

# Install the bot's dependencies
RUN npm install
