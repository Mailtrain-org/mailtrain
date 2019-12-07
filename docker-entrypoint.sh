#!/bin/bash
# Entrypoint for Docker Container

set -e

URL_BASE_TRUSTED=${URL_BASE_TRUSTED:-'http://localhost:3000'}
URL_BASE_SANDBOX=${URL_BASE_SANDBOX:-'http://localhost:3003'}
URL_BASE_PUBLIC=${URL_BASE_PUBLIC:-'http://localhost:3004'}
WWW_PROXY=${WWW_PROXY:-'false'}
WITH_LDAP=${WITH_LDAP:-'false'}
LDAP_HOST=${LDAP_HOST:-'ldap'}
LDAP_PORT=${LDAP_PORT:-'389'}
LDAP_SECURE=${LDAP_SECURE:-'false'}
LDAP_BIND_USER=${LDAP_BIND_USER:-}
LDAP_BIND_PASS=${LDAP_BIND_PASS:-}
LDAP_FILTER=${LDAP_FILTER:-}
LDAP_BASEDN=${LDAP_BASEDN:-}
LDAP_UIDTAG=${LDAP_UIDTAG:-}
MONGO_HOST=${MONG_HOST:-'mongo'}
REDIS_HOST=${REDIS_HOST:-'redis'}
MYSQL_HOST=${MYSQL_HOST:-'mysql'}
MYSQL_DATABASE=${MYSQL_DATABASE:-'mailtrain'}
MYSQL_USER=${MYSQL_USER:-'mailtrain'}
MYSQL_PASSWORD=${MYSQL_PASSWORD:-'mailtrain'}

# Warning for users that already rely on the MAILTRAIN_SETTING variable
# Can probably be removed in the future.
MAILTRAIN_SETTING=${MAILTRAIN_SETTINGS:-}
if [ ! -z "$MAILTRAIN_SETTING" ]; then
    echo 'Error: MAILTRAIN_SETTINGS is no longer supported. See README'
    exit 1
fi

if [ -f application/config/config.php ]; then
    echo 'Info: application/production.yaml already provisioned'
else
    echo 'Info: Generating application/production.yaml'

    # Basic configuration
    cat > server/config/production.yaml <<EOT
    www:
      host: 0.0.0.0
      proxy: $WWW_PROXY
      secret: "`pwgen -1`"
      trustedUrlBase: $URL_BASE_TRUSTED
      sandboxUrlBase: $URL_BASE_SANDBOX
      publicUrlBase: $URL_BASE_PUBLIC

    mysql:
      host: $MYSQL_HOST
      database: $MYSQL_DATABASE
      user: $MYSQL_USER
      password: $MYSQL_PASSWORD

    redis:
      enabled: true
      host: $REDIS_HOST

    log:
      level: info

    builtinZoneMTA:
      log:
        level: warn
      mongo: mongodb://${MONGO_HOST}:27017/zone-mta
      redis: redis://${REDIS_HOST}:6379/2

    queue:
      processes: 5
EOT

    # Manage LDAP if enabled
    if [ "$WITH_LDAP" = "true" ]; then
        echo 'Info: LDAP enabled'
    cat >> server/config/production.yaml <<EOT
    ldap:
      enabled: true
      host: $LDAP_HOST
      port: $LDAP_PORT
      secure: $LDAP_SECURE
      bindUser: $LDAP_BIND_USER
      bindPasswort: $LDAP_BIND_PASS
      filter: $LDAP_FILTER
      baseDN: $LDAP_BASEDN
      uidTag: $LDAP_UIDTAG
EOT
    else
        echo 'Info: LDAP not enabled'
    cat >> server/config/production.yaml <<EOT
    ldap:
      enabled: false
EOT
    fi

fi

if [ -f server/services/workers/reports/config/production.yaml ]; then
    echo 'Info: server/production.yaml already provisioned'
else
    echo 'Info: Generating server/production.yaml'
    cat > server/services/workers/reports/config/production.yaml <<EOT
    mysql:
      host: $MYSQL_HOST
    log:
      level: warn
EOT
fi

# Wait for the other services to start
echo 'Info: Waiting for MySQL Server'
while ! nc -z $MYSQL_HOST 3306; do sleep 1; done

echo 'Info: Waiting for Redis Server'
while ! nc -z $REDIS_HOST 6379; do sleep 1; done

echo 'Info: Waiting for MongoDB Server'
while ! nc -z $MONGO_HOST 27017; do sleep 1; done

cd server
NODE_ENV=production node index.js
