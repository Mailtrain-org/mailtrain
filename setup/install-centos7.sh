#!/bin/bash

# This installation script works on CentOS 7
# Run as root!

if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 1>&2
   exit 1
fi

set -e

SCRIPT_PATH=$(dirname $(realpath -s $0))
cd $SCRIPT_PATH/..

#Help function
function HELP {
cat << EOF

Basic usage: install-centos7.sh <trusted URL base> <sandbox URL base> <public URL base>

Installs Mailtrain 2 on CentOS 7.

Command line options. The following switches are recognized.
  --with-httpd-proxy     -- URL of the ssio-template GIT repository (default: git@gitlab.sathyasai.org:webs/ssio-template.git)
  --db-name ...          -- Name of DB and user in the DB (defaults to id with - -> _ substitution)
  --aliases ...          -- Server aliases divided by spaces (e.g. "www.esse-institute.org www.esse-institut.de")
  --cert-domains ...     -- Domains for which to get certs via letsencrypt (e.g. "www.esse-institute.org www.esse-institut.de")
  --dont-push            -- Don't push the website to gitlab. It stops after creating a directory, setting the remote and doing commit



Example (local installation): install-centos7.sh http://localhost:3000 http://localhost:3003 http://localhost:3004
Example (installation behind HTTPD proxy - see mailtrain-apache-sample.conf): install-centos7.sh https://mailtrain.example.com https://sbox.mailtrain.example.com https://mail.example.com
EOF

  exit 1
}

if [ $# -lt 3 ]; then
        echo "Error: incorrect number of parameters."
        HELP
fi

URL_BASE_TRUSTED="$1"
URL_BASE_SANDBOX="$2"
URL_BASE_PUBLIC="$3"


yum -y install epel-release

curl --silent --location https://rpm.nodesource.com/setup_11.x | bash -
cat > /etc/yum.repos.d/mongodb-org.repo <<EOT
[mongodb-org-4.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/4.0/x86_64/
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


MYSQL_PASSWORD=`pwgen 12 -1`
MYSQL_RO_PASSWORD=`pwgen 12 -1`

# Setup MySQL user for Mailtrain
mysql -u root -e "CREATE USER 'mailtrain'@'localhost' IDENTIFIED BY '$MYSQL_PASSWORD';"
mysql -u root -e "GRANT ALL PRIVILEGES ON mailtrain.* TO 'mailtrain'@'localhost';"
mysql -u root -e "CREATE USER 'mailtrain_ro'@'localhost' IDENTIFIED BY '$MYSQL_RO_PASSWORD';"
mysql -u root -e "GRANT SELECT ON mailtrain.* TO 'mailtrain_ro'@'localhost';"
mysql -u mailtrain --password="$MYSQL_PASSWORD" -e "CREATE database mailtrain;"

# Add new user for the mailtrain daemon to run as
useradd mailtrain || true

# Setup installation configuration
cat > server/config/production.yaml <<EOT
user: mailtrain
group: mailtrain
roUser: nobody
roGroup: nobody

www:
  port: 3000
  secret: "`pwgen -1`"
  trustedUrlBase: $URL_BASE_TRUSTED
  sandboxUrlBase: $URL_BASE_SANDBOX
  publicUrlBase: $URL_BASE_PUBLIC


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

cat >> server/services/workers/reports/config/production.yaml <<EOT
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
