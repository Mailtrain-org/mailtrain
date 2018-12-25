#!/bin/bash

set -e

SCRIPT_PATH=$(dirname $(realpath -s $0))
. $SCRIPT_PATH/functions centos7
cd $SCRIPT_PATH/..

performInstallLocal "$#"