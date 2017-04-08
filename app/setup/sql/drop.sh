#!/bin/bash

mysqldump -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" "-p${MYSQL_PASSWORD}" --add-drop-table --no-data "$MYSQL_DB" | grep -e '^DROP \| FOREIGN_KEY_CHECKS' | mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" "-p${MYSQL_PASSWORD}" "$MYSQL_DB"
