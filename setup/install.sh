#!/bin/bash

# This installation script works on Ubuntu 14.04

set -e

export DEBIAN_FRONTEND=noninteractive

apt-add-repository -y ppa:chris-lea/redis-server

curl -sL https://deb.nodesource.com/setup_6.x | bash -
apt-get -q -y install mysql-server pwgen redis-server nodejs git ufw
apt-get clean

HOSTNAME=$(curl -s http://169.254.169.254/metadata/v1/hostname)
MYSQL_PASSWORD=`pwgen -1`

# Setup MySQL user for Mailtrain
mysql -u root -e "CREATE USER 'mailtrain'@'localhost' IDENTIFIED BY '$MYSQL_PASSWORD';"
mysql -u root -e "GRANT ALL PRIVILEGES ON mailtrain.* TO 'mailtrain'@'%' WITH GRANT OPTION;"
mysql -u mailtrain --password="$MYSQL_PASSWORD" -e "CREATE database mailtrain;"

# Enable firewall, allow connections to SSH, HTTP, HTTPS and SMTP
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 25/tcp
ufw --force enable

# Fetch Mailtrain files
cd /opt
git clone git://github.com/andris9/mailtrain.git
cd mailtrain

# Set up upstart service script
cp setup/mailtrain.conf /etc/init

# Add new user for the daemon to run as
useradd mailtrain || true

# Setup installation configuration
cat >> config/production.toml <<EOT
user="mailtrain"
group="mailtrain"
[log]
level="error"
[www]
port=80
secret="`pwgen -1`"
[mysql]
password="$MYSQL_PASSWORD"
[redis]
enabled=true
[verp]
enabled=true
EOT

# Install required node packages
npm install --no-progress --production

# Setup log rotation to not spend up entire storage on logs
cat <<EOM > /etc/logrotate.d/mailtrain
/var/log/mailtrain.log {
    daily
    rotate 12
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
    nomail
}
EOM

# Start the service
service mailtrain start

echo "Success!";
