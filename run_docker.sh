#!/bin/bash

# Step 1: Stop and remove the previous container and image if exists
docker-compose down --remove-orphans

# Step 2: Remove the previous image
docker rmi $(docker images -q stolas_bot_src)

# Step 3: Build the Docker image using docker-compose
docker-compose build --remove-orphans

# Step 4: Run the Docker container
docker-compose up -d