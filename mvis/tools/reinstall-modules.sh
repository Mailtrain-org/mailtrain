#!/bin/sh

PACKAGE_DIRS="client server test-embed ivis-core/client ivis-core/shared ivis-core/server ivis-core/embedding"

for i in $PACKAGE_DIRS; do echo $i; cd $i; rm -rf node_modules; npm install; cd -; done