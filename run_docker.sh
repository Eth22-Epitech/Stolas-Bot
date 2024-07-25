#!/bin/bash

# Step 1: Stop and remove the previous container and image if exists
docker-compose down --remove-orphans

# Step 2: Build the Docker image using docker-compose
docker-compose build --remove-orphans

# Step 3: Run the Docker container
docker-compose up -d