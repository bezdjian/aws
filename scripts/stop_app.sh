#!/usr/bin/env bash

# Check if the port 8080 is active, then stop.
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "App is running, stopping the app"
    lsof -t -i tcp:8080 | xargs kill
else
    echo "App is not running.. continue."
fi