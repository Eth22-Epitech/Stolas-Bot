#!/bin/bash

# Step 1: Stop the Docker container
docker stop stolas_bot_container

# Step 2: Remove previous container
docker rmi -f stolas_bot_image

# Step 3: Remove previous image
docker rm -f stolas_bot_container

# Step 4: Build the Docker image
docker build -t stolas_bot_image .

# Step 5: Run the Docker container
docker run -d --name stolas_bot_container -v $(pwd)/logs:/stolas_bot/logs stolas_bot_image