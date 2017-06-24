#!/bin/bash
set -e

if [ ! -f "/app/config/production.toml" ] ; then 
    echo "No production.toml, copying from docker-production.toml.tmpl"
    cp /app/config/docker-production.toml.tmpl /app/config/production.toml
fi
if [ ! -f "/app/workers/reports/config/production.toml" ] ; then 
    echo "No production.toml for reports, copying from docker-production.toml.tmpl"
    cp /app/config/docker-production.toml.tmpl /app/workers/reports/config/production.toml
fi
exec "$@"