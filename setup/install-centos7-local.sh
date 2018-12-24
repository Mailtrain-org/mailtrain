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
cat << EOF

Basic usage: install-centos7-local.sh

Installs Mailtrain 2 on CentOS 7. This performs installation for local use on HTTP ports 3000, 3003, 3004. If you want
to make these ports available from outside, setup an HTTPS proxy yourself or use install-centos7-https.sh instead.

Example: install-centos7-local.sh
EOF

  exit 1
}

if [ $# -lt 0 ]; then
        echo "Error: incorrect number of parameters."
        HELP
fi

installBase http://localhost:3000 http://localhost:3003 http://localhost:3004