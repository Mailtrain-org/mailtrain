#!/bin/bash

set -e

hostType=debian10

SCRIPT_PATH=$(dirname $(realpath -s $0))
. $SCRIPT_PATH/functions
cd $SCRIPT_PATH/..

performInstallHttp-NoSSL "$#" "$1" "$2" "$3" 
