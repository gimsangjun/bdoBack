#!/bin/bash

# Define the output directory for backups
backup_path="mongodb_backup/"

# Database name
dbname="blackdesert"

# MongoDB user and password
username="tkwk327"
password="password1234"
host="127.0.0.0"  # MongoDB 서버 주소 (필요에 따라 수정)
port="27017"      # MongoDB 포트 (기본값은 27017)

# URI format
uri="mongodb://$username:$password@$host:$port/$dbname"

# Create backup directory
mkdir -p $backup_path

# Backup specific collections
mongodump --uri "$uri" --collection items --out $backup_path
mongodump --uri "$uri" --collection itemstocks --out $backup_path
mongodump --uri "$uri" --collection reinforcements --out $backup_path

echo "Backup completed successfully."
