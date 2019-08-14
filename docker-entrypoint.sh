#!/bin/bash
set -e

function printHelp {
    cat <<EOF

Optional parameters:
  --trustedUrlBase XXX  - sets the trusted url of the instance (default: http://localhost:3000)
  --sandboxUrlBase XXX  - sets the sandbox url of the instance (default: http://localhost:3003)
  --publicUrlBase XXX   - sets the public url of the instance (default: http://localhost:3004)
  --withProxy           - use if Mailtrain is behind an http reverse proxy
  --mongoHost XXX       - sets mongo host (default: mongo)
  --redisHost XXX       - sets redis host (default: redis)
  --mySqlHost XXX       - sets mysql host (default: mysql)
  --withLdap            - use if you want to enable LDAP authentication
  --ldapHost XXX        - LDAP Host for authentication (default: ldap)
  --ldapPort XXX        - LDAP port (default: 389)
  --ldapSecure          - use if you want to use LDAP with ldaps protocol
  --ldapBindUser XXX    - User for LDAP connexion
  --ldapBindPass XXX    - Password for LDAP connexion
  --ldapFilter XXX      - LDAP filter
  --ldapBaseDN XXX      - LDAP base DN
  --ldapUidTag XXX      - LDAP UID tag (e.g. uid/cn/username)
EOF

    exit 1
}


urlBaseTrusted=http://localhost:3000
urlBaseSandbox=http://localhost:3003
urlBasePublic=http://localhost:3004
wwwProxy=false
withLdap=false
ldapHost=ldap
ldapPort=389
ldapSecure=false
ldapBindUser=""
ldapBindPass=""
ldapFilter=""
ldapBaseDN=""
ldapUidTag=""
mongoHost=mongo
redisHost=redis
mySqlHost=mysql

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
        --mongoHost)
            mongoHost="$2"
            shift 2
            ;;
        --redisHost)
            redisHost="$2"
            shift 2
            ;;
        --mySqlHost)
            mySqlHost="$2"
            shift 2
            ;;
        --withLdap)
            withLdap=true
            shift 1
            ;;
        --ldapHost)
            ldapHost="$2"
            shift 2
            ;;
        --ldapPort)
            ldapPort="$2"
            shift 2
            ;;
        --ldapSecure)
            ldapSecure=true
            shift 1
            ;;
        --ldapBindUser)
            ldapBindUser="$2"
            shift 2
            ;;
        --ldapBindPass)
            ldapBindPass="$2"
            shift 2
            ;;
        --ldapFilter)
            ldapFilter="$2"
            shift 2
            ;;
        --ldapBaseDN)
            ldapBaseDN="$2"
            shift 2
            ;;
        --ldapUidTag)
            ldapUidTag="$2"
            shift 2
            ;;
        *)
            echo "Error: unrecognized option $1."
            printHelp
    esac
done

if [ "$ldapBindUser" == "" ]; then
  ldapBindUserLine=""
else
  ldapBindUserLine="bindUser: $ldapBindUser"
fi
if [ "$ldapBindPass" == "" ]; then
  ldapBindPassLine=""
else
  ldapBindPassLine="bindPassword: $ldapBindPass"
fi
if [ "$ldapFilter" == "" ]; then
  ldapFilterLine=""
else
  ldapFilterLine="filter: $ldapFilter"
fi
if [ "$ldapBaseDN" == "" ]; then
  ldapBaseDNLine=""
else
  ldapBaseDNLine="baseDN: $ldapBaseDN"
fi
if [ "$ldapUidTag" == "" ]; then
  ldapUidTagLine=""
else
  ldapUidTagLine="uidTag: $ldapUidTag"
fi

cat > server/config/production.yaml <<EOT
www:
  host: 0.0.0.0
  proxy: $wwwProxy
  secret: "`pwgen -1`"
  trustedUrlBase: $urlBaseTrusted
  sandboxUrlBase: $urlBaseSandbox
  publicUrlBase: $urlBasePublic

mysql:
  host: $mySqlHost

redis:
  enabled: true
  host: $redisHost

log:
  level: info

builtinZoneMTA:
  log:
    level: warn
  mongo: mongodb://${mongoHost}:27017/zone-mta
  redis: redis://${redisHost}:6379/2

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
  host: $mySqlHost
log:
  level: warn
EOT

# Wait for the other services to start
while ! nc -z $mySqlHost 3306; do sleep 1; done
while ! nc -z $redisHost 6379; do sleep 1; done
while ! nc -z $mongoHost 27017; do sleep 1; done

cd server
NODE_ENV=production node index.js