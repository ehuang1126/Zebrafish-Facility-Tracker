#!/bin/bash

# This file should be run from the project root.

DB_NAME=sqlite3.db

# Backup an existing database if one exists.
if [ -f ./data/$DB_NAME ]; then
  # generate a timestamp with format yyyy-mm-dd_hh-mm-ss
  timestamp=$(date +%Y-%m-%d_%H-%M-%S)
  # rename the file with the timestamp appended
  mkdir -p ./data/backups/
  cp ./data/$DB_NAME ./data/backups/backup_$timestamp.db
  echo "existing ${DB_NAME} moved to backups"
  else 
    # If doesn't exist, create new database and table
    echo "creating new ${DB_NAME}"
    sqlite3 ./data/$DB_NAME < ./src/server/schema.sql
fi
