#!/bin/bash

set -e

hostType=centos7

SCRIPT_PATH=$(dirname $(realpath -s $0))
. $SCRIPT_PATH/functions
cd $SCRIPT_PATH/..

performInstallLocal "$#"