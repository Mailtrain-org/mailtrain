#!/bin/bash
set -e

function printHelp {
    cat <<EOF

Optional parameters:
  --trustedUrlBase XXX  - sets the trusted url of the instance (default: http://localhost:3000)
  --sandboxUrlBase XXX  - sets the sandbox url of the instance (default: http://localhost:3003)
  --publicUrlBase XXX   - sets the public url of the instance (default: http://localhost:3004)
  --withProxy           - use if Mailtrain is behind an http reverse proxy
EOF

    exit 1
}


urlBaseTrusted=http://localhost:3000
urlBaseSandbox=http://localhost:3003
urlBasePublic=http://localhost:3004
wwwProxy=false

while [ $# -gt 0 ]; do
    case "$1" in
        --help)
            printHelp
            ;;
        --trustedUrlBase)
            urlBaseTrusted="$2"
            shift 2
            ;;
        --sandboxUrlBase)
            urlBaseSandbox="$2"
            shift 2
            ;;
        --publicUrlBase)
            urlBasePublic="$2"
            shift 2
            ;;
        --withProxy)
            wwwProxy=true
            shift 1
            ;;
        *)
            echo "Error: unrecognized option $1."
            printHelp
    esac
done


cat > server/config/production.yaml <<EOT
www:
  host: 0.0.0.0
  proxy: $wwwProxy
  secret: "`pwgen -1`"
  trustedUrlBase: $urlBaseTrusted
  sandboxUrlBase: $urlBaseSandbox
  publicUrlBase: $urlBasePublic

mysql:
  host: $MYSQL_HOSTNAME
  user: $MYSQL_USERNAME
  password: $MYSQL_PASSWORD
  database: $MYSQL_DATABASE

redis:
  enabled: true
  host: $REDIS_HOST

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

# Wait for the other services to start
while ! nc -z $mySqlHost 3306; do sleep 1; done
while ! nc -z $redisHost 6379; do sleep 1; done

cd server
NODE_ENV=production node index.js
