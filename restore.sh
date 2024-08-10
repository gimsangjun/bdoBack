#!/bin/bash

# Define the directory containing backup data
backup_path="mongodb_backup/"

# Database name
dbname="blackdesert"

# MongoDB user and password
username="tkwk327"
password="password1234"
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
# --authenticationDatabase=admin은 admin에 계정을 만들었을경우 필요, 어느 db에서 사용자 정보를 찾을것인가. 기본적으로는 사용자가 접근할 db에서 찾음.
mongorestore --uri "$uri" --nsInclude=${dbname}.items --drop $backup_path/${dbname}/items.bson
mongorestore --uri "$uri" --nsInclude=${dbname}.itemstocks --drop $backup_path/${dbname}/itemstocks.bson
mongorestore --uri "$uri" --nsInclude=${dbname}.reinforcements --drop $backup_path/${dbname}/reinforcements.bson

echo "Database restoration completed successfully."
