#!/bin/bash

MYSQL_PASSWORD=`pwgen 12 -1`

# Setup MySQL user for Mailtrain
mysql -u root -p -e "CREATE USER 'mvis'@'localhost' IDENTIFIED BY '$MYSQL_PASSWORD';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON mvis.* TO 'mvis'@'localhost';"
mysql -u mvis --password="$MYSQL_PASSWORD" -e "CREATE database mvis;"

cat >> config/production.yaml <<EOT
mysql:
  password: $MYSQL_PASSWORD
EOT
