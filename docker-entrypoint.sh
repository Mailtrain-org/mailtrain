#!/bin/bash
set -e

cat > server/config/production.yaml <<EOT
www:
  host: 0.0.0.0
  proxy: true
  secret: "`pwgen -1`"
  trustedUrlBase: $TRUSTED_URL
  sandboxUrlBase: $SANDBOX_URL
  publicUrlBase: $PUBLIC_URL

mysql:
  host: $MYSQL_HOSTNAME
  user: $MYSQL_USERNAME
  password: $MYSQL_PASSWORD
  database: $MYSQL_DATABASE

redis:
  enabled: true
  host: $REDIS_HOST

gdpr:
  deleteDataAfterUnsubscribe:
    enabled: false
  deleteSubscriptionAfterUnsubscribe:
    enabled: false

builtinZoneMTA:
  enabled: false

log:
  level: info

queue:
  processes: 5

ldap:
  enabled: $withLdap
  host: $ldapHost
  port: $ldapPort
  secure: $ldapSecure
  $ldapBindUserLine
  $ldapBindPassLine
  $ldapFilterLine
  $ldapBaseDNLine
  $ldapUidTagLine
EOT

cat > server/services/workers/reports/config/production.yaml <<EOT
mysql:
  host: $MYSQL_HOSTNAME
  user: $MYSQL_USERNAME
  password: $MYSQL_PASSWORD
  database: $MYSQL_DATABASE

log:
  level: warn
EOT

cd server
NODE_ENV=production node index.js
