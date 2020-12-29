#!/usr/bin/env bash

# Get the PID of the task that runs 8080 and kill process.
lsof -t -i tcp:8080 | xargs kill