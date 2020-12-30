#!/usr/bin/env bash

APP_PATH=/home/ec2-user

sudo yum update -y
sudo yum install java-1.8.0-openjdk -y

# Check if the port 8080 is active, then stop.
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "Restarting the app"
    lsof -t -i tcp:8080 | xargs kill
    # Run the jar file in the background and log to aws-spring.log file whn still running.
    java -jar $APP_PATH/aws-spring-0.1.jar > aws-spring.log < /dev/null &
else
    echo "Starting the app."
    # Run the jar file in the background and log to aws-spring.log file whn still running.
    java -jar $APP_PATH/aws-spring-0.1.jar > aws-spring.log < /dev/null &
fi