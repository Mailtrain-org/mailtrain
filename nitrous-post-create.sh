#!/bin/bash

export DEBIAN_FRONTEND=noninteractive
sudo apt-get update
sudo -E apt-get -q -y install mysql-server
sudo apt-get clean

mysql -u root -e "CREATE USER 'mailtrain'@'localhost' IDENTIFIED BY 'mailtrain';"
mysql -u root -e "GRANT ALL PRIVILEGES ON mailtrain.* TO 'mailtrain'@'%' WITH GRANT OPTION;"
mysql -u mailtrain --password="mailtrain" -e "CREATE database mailtrain;"
mysql -u mailtrain --password="mailtrain" -D mailtrain < setup/mailtrain.sql

cp config/default.toml config/production.toml
echo "running npm install..."
npm install --no-progress
echo "npm install done"
