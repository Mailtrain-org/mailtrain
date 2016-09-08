#!/bin/bash

# This installation script works on Ubuntu 14.04 and 16.04
# Run as root!

if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 1>&2
   exit 1
fi

set -e

export DEBIAN_FRONTEND=noninteractive

apt-add-repository -y ppa:chris-lea/redis-server

curl -sL https://deb.nodesource.com/setup_6.x | bash -
apt-get -q -y install mariadb-server pwgen redis-server nodejs git ufw build-essential dnsutils
apt-get clean

PUBLIC_IP=`curl -s https://api.ipify.org`
if [ ! -z "$PUBLIC_IP" ]; then
    HOSTNAME=`dig +short -x $PUBLIC_IP | sed 's/\.$//'`
    HOSTNAME="${HOSTNAME:-$PUBLIC_IP}"
fi
HOSTNAME="${HOSTNAME:-`hostname`}"

MYSQL_PASSWORD=`pwgen 12 -1`
DKIM_API_KEY=`pwgen 12 -1`
SMTP_PASS=`pwgen 12 -1`

# Setup MySQL user for Mailtrain
mysql -u root -e "CREATE USER 'mailtrain'@'localhost' IDENTIFIED BY '$MYSQL_PASSWORD';"
mysql -u root -e "GRANT ALL PRIVILEGES ON mailtrain.* TO 'mailtrain'@'localhost';"
mysql -u mailtrain --password="$MYSQL_PASSWORD" -e "CREATE database mailtrain;"

# Enable firewall, allow connections to SSH, HTTP, HTTPS and SMTP
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 25/tcp
ufw --force enable

# Fetch Mailtrain files
mkdir -p /opt/mailtrain
cd /opt/mailtrain
git clone git://github.com/andris9/mailtrain.git .

# Normally we would let Mailtrain itself to import the initial SQL data but in this case
# we need to modify it, before we start Mailtrain
mysql -u mailtrain -p"$MYSQL_PASSWORD" mailtrain < setup/sql/mailtrain.sql

mysql -u mailtrain -p"$MYSQL_PASSWORD" mailtrain <<EOT
INSERT INTO \`settings\` (\`key\`, \`value\`) VALUES ('admin_email','admin@$HOSTNAME') ON DUPLICATE KEY UPDATE \`value\`='admin@$HOSTNAME';
INSERT INTO \`settings\` (\`key\`, \`value\`) VALUES ('default_address','admin@$HOSTNAME') ON DUPLICATE KEY UPDATE \`value\`='admin@$HOSTNAME';
INSERT INTO \`settings\` (\`key\`, \`value\`) VALUES ('smtp_hostname','localhost') ON DUPLICATE KEY UPDATE \`value\`='localhost';
INSERT INTO \`settings\` (\`key\`, \`value\`) VALUES ('smtp_disable_auth','') ON DUPLICATE KEY UPDATE \`value\`='';
INSERT INTO \`settings\` (\`key\`, \`value\`) VALUES ('smtp_user','mailtrain') ON DUPLICATE KEY UPDATE \`value\`='mailtrain';
INSERT INTO \`settings\` (\`key\`, \`value\`) VALUES ('smtp_pass','$SMTP_PASS') ON DUPLICATE KEY UPDATE \`value\`='$SMTP_PASS';
INSERT INTO \`settings\` (\`key\`, \`value\`) VALUES ('smtp_encryption','NONE') ON DUPLICATE KEY UPDATE \`value\`='NONE';
INSERT INTO \`settings\` (\`key\`, \`value\`) VALUES ('smtp_port','587') ON DUPLICATE KEY UPDATE \`value\`='587';
INSERT INTO \`settings\` (\`key\`, \`value\`) VALUES ('default_homepage','http://$HOSTNAME/') ON DUPLICATE KEY UPDATE \`value\`='http://$HOSTNAME/';
INSERT INTO \`settings\` (\`key\`, \`value\`) VALUES ('service_url','http://$HOSTNAME/') ON DUPLICATE KEY UPDATE \`value\`='http://$HOSTNAME/';
INSERT INTO \`settings\` (\`key\`, \`value\`) VALUES ('dkim_api_key','$DKIM_API_KEY') ON DUPLICATE KEY UPDATE \`value\`='$DKIM_API_KEY';
EOT

# Add new user for the mailtrain daemon to run as
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
chown -R mailtrain:mailtrain .

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

if [ -d "/run/systemd/system" ]; then
    # Set up systemd service script
    cp setup/mailtrain.service /etc/systemd/system/
    systemctl enable mailtrain.service
else
    # Set up upstart service script
    cp setup/mailtrain.conf /etc/init/
fi

# Fetch ZoneMTA files
mkdir -p /opt/zone-mta
cd /opt/zone-mta
git clone git://github.com/zone-eu/zone-mta.git .

# Ensure queue folder
mkdir -p /var/data/mailtrain

# Setup installation configuration
cat >> config/production.json <<EOT
{
    "user": "mailtrain",
    "group": "mailtrain",
    "queue": {
        "db": "/var/data/mailtrain"
    },
    "feeder": {
        "port": 587,
        "authentication": true,
        "user": "mailtrain",
        "pass": "$SMTP_PASS"
    },
    "log": {
        "level": "info"
    },
    "bounces": {
        "enabled": false,
        "url": "http://localhost/webhooks/zone-mta"
    },
    "getSenderConfig": "http://localhost/webhooks/zone-mta/sender-config?api_token=$DKIM_API_KEY",
    "zones": {
        "transactional": {
            "processes": 1,
            "connections": 1
        }
    }
}
EOT

# Install required node packages
npm install --no-progress --production

# Setup log rotation to not spend up entire storage on logs
cat <<EOM > /etc/logrotate.d/zone-mta
/var/log/zone-mta.log {
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

chown -R mailtrain:mailtrain .
chown -R mailtrain:mailtrain /var/data/mailtrain

if [ -d "/run/systemd/system" ]; then
    # Set up systemd service script
    cp setup/zone-mta.service /etc/systemd/system/
    systemctl enable zone-mta.service
else
    # Set up upstart service script
    cp setup/zone-mta.conf /etc/init/
fi

# Start the service
service zone-mta start
service mailtrain start

echo "Success! Open http://$HOSTNAME/ and log in as admin:test";
