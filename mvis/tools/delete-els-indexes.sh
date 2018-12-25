#!/bin/sh

SIGSETS=`curl -X GET "localhost:9200/_cat/indices?v" | grep 'signal_set_' | sed -e 's:.*\(signal_set_[^ ]*\).*:\1:g'`

for SIGSET in $SIGSETS ; do
    curl -X DELETE "localhost:9200/$SIGSET"
done
