#!/bin/bash

# Define the directory containing backup data
backup_path="~/mongodb_backup/"

# Database name
dbname="blackdesert"

# MongoDB user and password
username=""
password=""
host="127.0.0.1"  # MongoDB 서버 주소 (필요에 따라 수정)
port="27017"      # MongoDB 포트 (기본값은 27017)

# URI format for authentication
uri="mongodb://$username:$password@$host:$port/$dbname"

# Check if the backup directory exists
if [ ! -d "$backup_path" ]; then
    echo "Backup directory does not exist: $backup_path"
    exit 1
fi

# Restore the database
echo "Restoring database from $backup_path..."
mongorestore --uri "$uri" --drop --gzip --dir $backup_path

echo "Database restoration completed successfully."
