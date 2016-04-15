#!/bin/bash

export DEBIAN_FRONTEND=noninteractive

sudo apt-add-respository ppa:chris-lea/redis-server

sudo apt-get update
sudo -E apt-get -q -y install mysql-server pwgen redis-server
sudo apt-get clean

MYSQL_PASSWORD=`pwgen -1`

mysql -u root -e "CREATE USER 'mailtrain'@'localhost' IDENTIFIED BY '$MYSQL_PASSWORD';"
mysql -u root -e "GRANT ALL PRIVILEGES ON mailtrain.* TO 'mailtrain'@'%' WITH GRANT OPTION;"
mysql -u mailtrain --password="$MYSQL_PASSWORD" -e "CREATE database mailtrain;"
mysql -u mailtrain --password="$MYSQL_PASSWORD" -D mailtrain < setup/mailtrain.sql

cat >> config/production.toml <<EOT
[log]
level="error"
[www]
secret="`pwgen -1`"
[mysql]
password="$MYSQL_PASSWORD"
[redis]
enabled=true
EOT

echo "running npm install..."
npm install --no-progress --production
echo "npm install done"
