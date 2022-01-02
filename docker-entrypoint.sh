#!/bin/bash
# Entrypoint for Docker Container

set -e

default_filter="(|(username={{username}})(mail={{username}}))"

PORT_TRUSTED=${PORT_TRUSTED:-'3000'}
PORT_SANDBOX=${PORT_SANDBOX:-'3003'}
PORT_PUBLIC=${PORT_PUBLIC:-'3004'}
URL_BASE_TRUSTED=${URL_BASE_TRUSTED:-"http://localhost:${PORT_TRUSTED}"}
URL_BASE_SANDBOX=${URL_BASE_SANDBOX:-"http://localhost:${PORT_SANDBOX}"}
URL_BASE_PUBLIC=${URL_BASE_PUBLIC:-"http://localhost:${PORT_PUBLIC}"}
WWW_HOST=${WWW_HOST:-'0.0.0.0'}
WWW_PROXY=${WWW_PROXY:-'false'}
WWW_SECRET=${WWW_SECRET:-$(pwgen -1)}
WITH_LDAP=${WITH_LDAP:-'false'}
LDAP_HOST=${LDAP_HOST:-'ldap'}
LDAP_PORT=${LDAP_PORT:-'389'}
LDAP_SECURE=${LDAP_SECURE:-'false'}
LDAP_BIND_USER=${LDAP_BIND_USER:-'name@company.net'}
LDAP_BIND_PASS=${LDAP_BIND_PASS:-'mySecretPassword'}
LDAP_FILTER=${LDAP_FILTER:-${default_filter}}
LDAP_BASEDN=${LDAP_BASEDN:-ou=users,dc=company}
LDAP_UIDTAG=${LDAP_UIDTAG:-'username'}
LDAP_MAILTAG=${LDAP_MAILTAG:-'mail'}
LDAP_NAMETAG=${LDAP_NAMETAG:-'username'}
LDAP_METHOD=${LDAP_METHOD:-'ldapjs'}
WITH_CAS=${WITH_CAS:-'false'}
CAS_URL=${CAS_URL:-'https://example.cas-server.com'}
CAS_NAMETAG=${CAS_NAMETAG:-'username'}
CAS_MAILTAG=${CAS_MAILTAG:-'mail'}
CAS_NEWUSERROLE=${CAS_NEWUSERROLE:-'nobody'}
CAS_NEWUSERNAMESPACEID=${CAS_NEWUSERNAMESPACEID:-'1'}
MONGO_HOST=${MONGO_HOST:-'mongo'}
WITH_REDIS=${WITH_REDIS:-'true'}
REDIS_HOST=${REDIS_HOST:-'redis'}
REDIS_PORT=${REDIS_PORT:-'6379'}
MYSQL_HOST=${MYSQL_HOST:-'mysql'}
MYSQL_PORT=${MYSQL_PORT:-'3306'}
MYSQL_DATABASE=${MYSQL_DATABASE:-'mailtrain'}
MYSQL_USER=${MYSQL_USER:-'mailtrain'}
MYSQL_PASSWORD=${MYSQL_PASSWORD:-'mailtrain'}
WITH_ZONE_MTA=${WITH_ZONE_MTA:-'true'}
POOL_NAME=${POOL_NAME:-$(hostname)}
LOG_LEVEL=${LOG_LEVEL:-'info'}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-'test'}
ADMIN_ACCESS_TOKEN=${ADMIN_ACCESS_TOKEN:-''}
DEFAULT_LANGUAGE=${DEFAULT_LANGUAGE:-'en-US'}
WITH_POSTFIXBOUNCE=${WITH_POSTFIXBOUNCE:-'false'}
POSTFIXBOUNCE_PORT=${POSTFIXBOUNCE_PORT:-'5699'}
POSTFIXBOUNCE_HOST=${POSTFIXBOUNCE_HOST:-'127.0.0.1'}

# Warning for users that already rely on the MAILTRAIN_SETTING variable
# Can probably be removed in the future.
MAILTRAIN_SETTING=${MAILTRAIN_SETTINGS:-}
if [ ! -z "$MAILTRAIN_SETTING" ]; then
    echo 'Error: MAILTRAIN_SETTINGS is no longer supported. See README.md'
    exit 1
fi

if [ -f server/config/production.yaml ]; then
    echo 'Info: application/production.yaml already provisioned'
else
    echo 'Info: Generating application/production.yaml'

    # Basic configuration
    cat >> server/config/production.yaml <<EOT
www:
  host: $WWW_HOST
  proxy: $WWW_PROXY
  secret: $WWW_SECRET
  trustedPort: $PORT_TRUSTED
  sandboxPort: $PORT_SANDBOX
  publicPort: $PORT_PUBLIC
  trustedUrlBase: $URL_BASE_TRUSTED
  sandboxUrlBase: $URL_BASE_SANDBOX
  publicUrlBase: $URL_BASE_PUBLIC

mysql:
  host: $MYSQL_HOST
  database: $MYSQL_DATABASE
  user: $MYSQL_USER
  password: $MYSQL_PASSWORD
  port: $MYSQL_PORT

redis:
  enabled: $WITH_REDIS
  host: $REDIS_HOST
  port: $REDIS_PORT

builtinZoneMTA:
  enabled: $WITH_ZONE_MTA
  log:
    level: warn
  mongo: mongodb://${MONGO_HOST}:27017/zone-mta
  redis: redis://${REDIS_HOST}:6379/2
  poolName: $POOL_NAME

queue:
  processes: 5

log:
  level: $LOG_LEVEL

defaultLanguage: $DEFAULT_LANGUAGE

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
  bindPassword: $LDAP_BIND_PASS
  filter: $LDAP_FILTER
  baseDN: $LDAP_BASEDN
  uidTag: $LDAP_UIDTAG
  mailTag: $LDAP_MAILTAG
  nameTag: $LDAP_NAMETAG
  method: $LDAP_METHOD
EOT
    else
        echo 'Info: LDAP not enabled'
    cat >> server/config/production.yaml <<EOT
ldap:
  enabled: false
EOT
    fi

    # Manage CAS if enabled
    if [ "$WITH_CAS" = "true" ]; then
        echo 'Info: CAS enabled'
    cat >> server/config/production.yaml <<EOT
cas:
  enabled: true
  url: $CAS_URL
  nameTag: $CAS_NAMETAG
  mailTag: $CAS_MAILTAG
  newUserRole: $CAS_NEWUSERROLE
  newUserNamespaceId: $CAS_NEWUSERNAMESPACEID

EOT
    else
        echo 'Info: CAS not enabled'
    cat >> server/config/production.yaml <<EOT
cas:
  enabled: false
EOT
    fi
    
    # Manage POSTFIXBOUNCE if enabled
    if [ "$WITH_POSTFIXBOUNCE" = "true" ]; then
        echo 'Info: POSTFIXBOUNCE enabled'
    cat >> server/config/production.yaml <<EOT

postfixBounce:
  # Enable to allow writing Postfix bounce log to Mailtrain listener
  # If enabled, tail mail.log to Mailtrain with the following command:
  #     tail -f -n +0 /var/log/mail.log | nc POSTFIXBOUNCE_HOST POSTFIXBOUNCE_PORT -
  enabled: true
  port: $POSTFIXBOUNCE_PORT
  host: $POSTFIXBOUNCE_HOST

EOT
    else
        echo 'Info: POSTFIXBOUNCE not enabled'
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
while ! nc -z $MYSQL_HOST $MYSQL_PORT; do sleep 1; done

if [ "$WITH_REDIS" = "true" ]; then
  echo 'Info: Waiting for Redis Server'
  while ! nc -z $REDIS_HOST $REDIS_PORT; do sleep 1; done
fi

if [ "$WITH_ZONE_MTA" = "true" ]; then
  echo 'Info: Waiting for MongoDB Server'
  while ! nc -z $MONGO_HOST 27017; do sleep 1; done
fi

cd server
# Install passport-cas2 node package if CAS selected
if [ "$WITH_CAS" = "true" ]; then
  echo 'Info: Installing passport-cas2'
  NODE_ENV=production npm install passport-cas2
fi

if [ "$WITH_LDAP" = "true" ]; then
  if [ "$LDAP_METHOD" = "ldapjs" ]; then
    echo 'Info: Install passport-ldapjs'
    npm install passport-ldapjs
  fi
  if [ "$LDAP_METHOD" = "ldapauth" ]; then
    echo 'Info: Install passport-ldapauth'
    npm install passport-ldapauth
  fi
fi

NODE_ENV=production node setup/docker-entrypoint-db-setup.js "$ADMIN_PASSWORD" "$ADMIN_ACCESS_TOKEN"

NODE_ENV=production node index.js
