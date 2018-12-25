#!/bin/bash

# This installation script works on CentOS 7
# Run as root!

if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 1>&2
   exit 1
fi

set -e

SCRIPT_PATH=$(dirname $(realpath -s $0))
. $SCRIPT_PATH/functions
cd $SCRIPT_PATH/..


# Help function
function HELP {
cat <<EOF

Basic usage: install-centos7-https.sh <trusted host> <sandbox host> <public host> <email>

Installs Mailtrain 2 on CentOS 7. This performs installation for external use. It installs Mailtrain, sets up
a reverse HTTPS proxy using Apache HTTPD, sets up firewall rules, and obtains a certificate from Letsencrypt.

You have to allocate three endpoints for Mailtrain - trusted (admin UI), sandbox (editors for templates), public (subscription forms and archive).
These endpoints have to differ in hostname. It's fine to host them all from one IP address. The email parameters is needed by certbot.

Note, that this will automatically accept the Let's Encrypt's Terms of Service.
Thus, by running this script below, you agree with the Let's Encrypt's Terms of Service (https://letsencrypt.org/documents/LE-SA-v1.2-November-15-2017.pdf).

Example: install-centos7-https.sh mailtrain.example.com sbox.mailtrain.example.com lists.example.com admin@example.com
EOF

  exit 1
}

if [ $# -lt 4 ]; then
        echo "Error: incorrect number of parameters."
        HELP
fi

hostTrusted="$1"
hostSandbox="$2"
hostPublic="$3"
email="$4"

installPrerequisities

createCertificates "${hostTrusted}" "${hostSandbox}" "${hostPublic}" "${email}"

installHttps "${hostTrusted}" 443 "${hostSandbox}" 443 "${hostPublic}" 443 "/etc/letsencrypt/live/${hostPublic}/cert.pem" "/etc/letsencrypt/live/${hostPublic}/privkey.pem" "/etc/letsencrypt/live/${hostPublic}/chain.pem" 

installMailtrain "https://${hostTrusted}" "https://${hostSandbox}" "https://${hostPublic}" 127.0.0.1

installService
