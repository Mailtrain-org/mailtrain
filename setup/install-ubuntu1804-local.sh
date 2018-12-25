#!/bin/bash

set -e
set -x

SCRIPT_PATH=$(dirname $(realpath -s $0))
. $SCRIPT_PATH/functions ubuntu1804
cd $SCRIPT_PATH/..

performInstallLocal "$#"
