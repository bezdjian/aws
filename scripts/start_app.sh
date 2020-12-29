#!/usr/bin/env bash

sudo yum update -y
sudo yum install java-1.8.0-openjdk -y

# Run the jar file in the background and log to aws-spring.log file whn still running.
java -jar aws-spring-0.1.jar > aws-spring.log < /dev/null &