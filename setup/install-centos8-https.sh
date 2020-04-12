#!/bin/bash

set -e

hostType=centos8

SCRIPT_PATH=$(dirname $(realpath -s $0))
. $SCRIPT_PATH/functions
cd $SCRIPT_PATH/..

performInstallHttps "$#" "$1" "$2" "$3" "$4"