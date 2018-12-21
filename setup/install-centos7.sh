#!/bin/bash

# This installation script works on CentOS 7
# Run as root!

if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 1>&2
   exit 1
fi

set -e

yum -y install epel-release

curl --silent --location https://rpm.nodesource.com/setup_11.x | bash -
cat > /etc/yum.repos.d/mongodb-org.repo <<EOT
[mongodb-org-4.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/$releasever/mongodb-org/4.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-4.0.asc
EOT

yum -y install mariadb-server nodejs ImageMagick git python redis pwgen bind-utils gcc-c++ make mongodb-org

systemctl start mariadb
systemctl enable mariadb

systemctl start redis
systemctl enable redis

systemctl start mongod
systemctl enable mongod


PUBLIC_IP=`curl -s https://api.ipify.org`
if [ ! -z "$PUBLIC_IP" ]; then
    HOSTNAME=`dig +short -x $PUBLIC_IP | sed 's/\.$//'`
    HOSTNAME="${HOSTNAME:-$PUBLIC_IP}"
fi
HOSTNAME="${HOSTNAME:-`hostname`}"

MYSQL_PASSWORD=`pwgen 12 -1`
MYSQL_RO_PASSWORD=`pwgen 12 -1`

# Setup MySQL user for Mailtrain
mysql -u root -e "CREATE USER 'mailtrain'@'localhost' IDENTIFIED BY '$MYSQL_PASSWORD';"
mysql -u root -e "GRANT ALL PRIVILEGES ON mailtrain.* TO 'mailtrain'@'localhost';"
mysql -u root -e "CREATE USER 'mailtrain_ro'@'localhost' IDENTIFIED BY '$MYSQL_RO_PASSWORD';"
mysql -u root -e "GRANT SELECT ON mailtrain.* TO 'mailtrain_ro'@'localhost';"
mysql -u mailtrain --password="$MYSQL_PASSWORD" -e "CREATE database mailtrain;"

# Enable firewall, allow connections to SSH, HTTP, HTTPS and SMTP
for port in 80/tcp 443/tcp 25/tcp; do firewall-cmd --add-port=$port --permanent; done
firewall-cmd --reload

# Fetch Mailtrain files
mkdir -p /opt/mailtrain
cd /opt/mailtrain
git clone git://github.com/Mailtrain-org/mailtrain.git .

# Add new user for the mailtrain daemon to run as
useradd mailtrain || true

# Setup installation configuration
cat > config/production.yaml <<EOT
user: mailtrain
group: mailtrain
roUser: nobody
roGroup: nobody

www:
  port: 3000
  secret: "`pwgen -1`"
  trustedUrlBase: http://$HOSTNAME:3000
  sandboxUrlBase: http://$HOSTNAME:3003
  publicUrlBase: http://$HOSTNAME:3004


mysql:
  password: "$MYSQL_PASSWORD"

redis:
  enabled: true

log:
  level: warn

builtinZoneMTA:
  log:
    level: info

queue:
  processes: 5
EOT

cat >> workers/reports/config/production.yaml <<EOT
log:
  level: warn

mysql:
  user: mailtrain_ro
  password: "$MYSQL_RO_PASSWORD"
EOT

# Install required node packages
for idx in client shared server zone-mta; do
    (cd $idx && npm install)
done

(cd client && npm run build)

chown -R mailtrain:mailtrain .
chmod o-rwx server/config

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

# Set up systemd service script
cp setup/mailtrain-centos7.service /etc/systemd/system/mailtrain.service
systemctl enable mailtrain.service

# Start the service
systemctl daemon-reload

systemctl start mailtrain.service

echo "Success! Open http://$HOSTNAME/ and log in as admin:test";
