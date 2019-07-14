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

builtinZoneMTA:
  redis: redis://$REDIS_HOST:6379/2
  mongo: mongodb://jx-mongodb:27017/zone-mta

log:
  level: info

queue:
  processes: 5
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
