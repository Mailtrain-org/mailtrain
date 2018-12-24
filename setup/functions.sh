# This is not a standalone script. It provides common functions to server-*.sh scripts

function installBase {
    local urlBaseTrusted="$1"
    local urlBaseSandbox="$2"
    local urlBasePublic="$3"
    
    yum -y install epel-release
    
    curl --silent --location https://rpm.nodesource.com/setup_11.x | bash -
    cat > /etc/yum.repos.d/mongodb-org.repo <<EOT
    [mongodb-org-4.0]
    name=MongoDB Repository
    baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/4.0/x86_64/
    gpgcheck=1
    enabled=1
    gpgkey=https://www.mongodb.org/static/pgp/server-4.0.asc
    EOT
    
    yum -y install mariadb-server nodejs ImageMagick git python redis pwgen bind-utils gcc-c++ make mongodb-org
    
    systemctl start mariadb
    systemctl enable mariadb
    
    systemctl start redis
    systemctl enable redis
    
    systemctl start mongod
    systemctl enable mongod
    
    
    mysqlPassword=`pwgen 12 -1`
    mysqlRoPassword=`pwgen 12 -1`
    
    # Setup MySQL user for Mailtrain
    mysql -u root -e "CREATE USER 'mailtrain'@'localhost' IDENTIFIED BY '$mysqlPassword';"
    mysql -u root -e "GRANT ALL PRIVILEGES ON mailtrain.* TO 'mailtrain'@'localhost';"
    mysql -u root -e "CREATE USER 'mailtrain_ro'@'localhost' IDENTIFIED BY '$mysqlRoPassword';"
    mysql -u root -e "GRANT SELECT ON mailtrain.* TO 'mailtrain_ro'@'localhost';"
    mysql -u mailtrain --password="$mysqlPassword" -e "CREATE database mailtrain;"
    
    # Add new user for the mailtrain daemon to run as
    useradd mailtrain || true
    
    # Setup installation configuration
    cat > server/config/production.yaml <<EOT
    user: mailtrain
    group: mailtrain
    roUser: nobody
    roGroup: nobody
    
    www:
      secret: "`pwgen -1`"
      trustedUrlBase: $urlBaseTrusted
      sandboxUrlBase: $urlBaseSandbox
      publicUrlBase: $urlBasePublic
    
    
    mysql:
      password: "$mysqlPassword"
    
    redis:
      enabled: true
    
    log:
      level: warn
    
    builtinZoneMTA:
      log:
        level: info
    
    queue:
      processes: 5
    EOT
    
    cat >> server/services/workers/reports/config/production.yaml <<EOT
    log:
      level: warn
    
    mysql:
      user: mailtrain_ro
      password: "$mysqlRoPassword"
    EOT
    
    # Install required node packages
    for idx in client shared server zone-mta; do
        (cd $idx && npm install)
    done
    
    (cd client && npm run build)
    
    chown -R mailtrain:mailtrain .
    chmod o-rwx server/config
    
    # Setup log rotation to not spend up entire storage on logs
    cat <<EOM > /etc/logrotate.d/mailtrain
    /var/log/mailtrain.log {
        daily
        rotate 12
        compress
        delaycompress
        missingok
        notifempty
        copytruncate
        nomail
    }
    EOM
    
    # Set up systemd service script
    cp setup/mailtrain-centos7.service /etc/systemd/system/mailtrain.service
    systemctl enable mailtrain.service
    
    # Start the service
    systemctl daemon-reload
    
    systemctl start mailtrain.service
    
    echo "Success! Open http://$urlBaseTrusted/"
    echo "If this is a fresh installation, log in as admin:test". If this is an upgrade over existing Mailtrain DB, use the original admin password."
}



function installHttps {
    local hostTrusted="$1"
    local portTrusted="$2"
    local hostSandbox="$3"
    local portSandbox="$4"
    local hostPublic="$5"
    local portPublic="$6"
    local certificateFile="$7"
    local certificateKey="$8"
    local caChainFile="$9"
    local skipHttpRedirect="$10"

    echo > /etc/httpd/conf.d/mailtrain.conf

    if [ "$skipHttpRedirect" = "--skip-http-redirect" ]; then
        cat >> /etc/httpd/conf.d/mailtrain.conf <<EOT
    <VirtualHost ${hostTrusted}:80>
        ServerName ${hostTrusted}

        ServerSignature Off

        RewriteEngine On
        RewriteRule ^ https://%{SERVER_NAME}%{REQUEST_URI} [END,QSA,R=permanent]

        ErrorLog logs/${hostTrusted}_redirect_error.log
        LogLevel warn
    </VirtualHost>

    <VirtualHost ${hostSandbox}:80>
        ServerName ${hostSandbox}

        ServerSignature Off

        RewriteEngine On
        RewriteRule ^ https://%{SERVER_NAME}%{REQUEST_URI} [END,QSA,R=permanent]

        ErrorLog logs/${hostSandbox}_redirect_error.log
        LogLevel warn
    </VirtualHost>

    <VirtualHost ${hostPublic}:80>
        ServerName ${hostPublic}

        ServerSignature Off

        RewriteEngine On
        RewriteRule ^ https://%{SERVER_NAME}%{REQUEST_URI} [END,QSA,R=permanent]

        ErrorLog logs/${hostPublic}_redirect_error.log
        LogLevel warn
    </VirtualHost>
EOT
    fi    

    cat >> /etc/httpd/conf.d/mailtrain.conf <<EOT
    <VirtualHost ${hostTrusted}:${portTrusted}>
        ServerName ${hostTrusted}:${portTrusted}

        ErrorLog logs/${hostTrusted}_ssl_error.log
        TransferLog logs/${hostTrusted}_ssl_access.log
        LogLevel warn

        SSLEngine on
        SSLCertificateFile ${certificateFile}
        SSLCertificateKeyFile ${certificateKey}
        SSLCertificateChainFile ${caChainFile}

        ProxyPreserveHost On
        ProxyPass "/" "http://127.0.0.1:3000/"
        ProxyPassReverse "/" "http://127.0.0.1:3000/"
    </VirtualHost>

    <VirtualHost ${hostSandbox}:${portSandbox}>
        ServerName ${hostSandbox}:${portSandbox}

        ErrorLog logs/${hostSandbox}_ssl_error.log
        TransferLog logs/${hostSandbox}_ssl_access.log
        LogLevel warn

        SSLEngine on
        SSLCertificateFile ${certificateFile}
        SSLCertificateKeyFile ${certificateKey}
        SSLCertificateChainFile ${caChainFile}

        ProxyPreserveHost On
        ProxyPass "/" "http://127.0.0.1:3003/"
        ProxyPassReverse "/" "http://127.0.0.1:3003/"
    </VirtualHost>

    <VirtualHost ${hostPublic}:${portPublic}>
        ServerName ${hostPublic}:${portPublic}

        ErrorLog logs/${hostPublic}_ssl_error.log
        TransferLog logs/${hostPublic}_ssl_access.log
        LogLevel warn

        SSLEngine on
        SSLCertificateFile ${certificateFile}
        SSLCertificateKeyFile ${certificateKey}
        SSLCertificateChainFile ${caChainFile}

        ProxyPreserveHost On
        ProxyPass "/" "http://127.0.0.1:3004/"
        ProxyPassReverse "/" "http://127.0.0.1:3004/"
    </VirtualHost>
EOT
}



function installHttps {
    local hostTrusted="$1"
    local portTrusted="$2"
    local hostSandbox="$3"
    local portSandbox="$4"
    local hostPublic="$5"
    local portPublic="$6"
    local certificateFile="$7"
    local certificateKey="$8"
    local caChainFile="$9"
    local installHttpRedirect="$10"

    yum -y install httpd mod_ssl

    echo > /etc/httpd/conf.d/mailtrain.conf

    if [ "$installHttpRedirect" != "yes" ]; then
        cat >> /etc/httpd/conf.d/mailtrain.conf <<EOT
    <VirtualHost ${hostTrusted}:80>
        ServerName ${hostTrusted}

        ServerSignature Off

        RewriteEngine On
        RewriteRule ^ https://%{SERVER_NAME}%{REQUEST_URI} [END,QSA,R=permanent]

        ErrorLog logs/${hostTrusted}_redirect_error.log
        LogLevel warn
    </VirtualHost>

    <VirtualHost ${hostSandbox}:80>
        ServerName ${hostSandbox}

        ServerSignature Off

        RewriteEngine On
        RewriteRule ^ https://%{SERVER_NAME}%{REQUEST_URI} [END,QSA,R=permanent]

        ErrorLog logs/${hostSandbox}_redirect_error.log
        LogLevel warn
    </VirtualHost>

    <VirtualHost ${hostPublic}:80>
        ServerName ${hostPublic}

        ServerSignature Off

        RewriteEngine On
        RewriteRule ^ https://%{SERVER_NAME}%{REQUEST_URI} [END,QSA,R=permanent]

        ErrorLog logs/${hostPublic}_redirect_error.log
        LogLevel warn
    </VirtualHost>
EOT

        # Enable port 80 on the firewall
        firewall-cmd --add-port=80/tcp --permanent
    fi

    cat >> /etc/httpd/conf.d/mailtrain.conf <<EOT
    <VirtualHost ${hostTrusted}:${portTrusted}>
        ServerName ${hostTrusted}:${portTrusted}

        ErrorLog logs/${hostTrusted}_ssl_error.log
        TransferLog logs/${hostTrusted}_ssl_access.log
        LogLevel warn

        SSLEngine on
        SSLCertificateFile ${certificateFile}
        SSLCertificateKeyFile ${certificateKey}
        SSLCertificateChainFile ${caChainFile}

        ProxyPreserveHost On
        ProxyPass "/" "http://127.0.0.1:3000/"
        ProxyPassReverse "/" "http://127.0.0.1:3000/"
    </VirtualHost>

    <VirtualHost ${hostSandbox}:${portSandbox}>
        ServerName ${hostSandbox}:${portSandbox}

        ErrorLog logs/${hostSandbox}_ssl_error.log
        TransferLog logs/${hostSandbox}_ssl_access.log
        LogLevel warn

        SSLEngine on
        SSLCertificateFile ${certificateFile}
        SSLCertificateKeyFile ${certificateKey}
        SSLCertificateChainFile ${caChainFile}

        ProxyPreserveHost On
        ProxyPass "/" "http://127.0.0.1:3003/"
        ProxyPassReverse "/" "http://127.0.0.1:3003/"
    </VirtualHost>

    <VirtualHost ${hostPublic}:${portPublic}>
        ServerName ${hostPublic}:${portPublic}

        ErrorLog logs/${hostPublic}_ssl_error.log
        TransferLog logs/${hostPublic}_ssl_access.log
        LogLevel warn

        SSLEngine on
        SSLCertificateFile ${certificateFile}
        SSLCertificateKeyFile ${certificateKey}
        SSLCertificateChainFile ${caChainFile}

        ProxyPreserveHost On
        ProxyPass "/" "http://127.0.0.1:3004/"
        ProxyPassReverse "/" "http://127.0.0.1:3004/"
    </VirtualHost>
EOT


    # Enable and start httpd
    systemctl start httpd
    systemctl enable httpd

    # Enable SSL ports on the firewall
    for port in "${portTrusted}/tcp" "${portSandbox}/tcp" "${portPublic}/tcp"; do
        firewall-cmd --add-port=$port --permanent
    done

    # Activate the firefall settings
    firewall-cmd --reload
}


function createCertificates {
    local hostTrusted="$1"
    local hostSandbox="$2"
    local hostPublic="$3"
    local email="$4"

    yum install -y certbot

    # Temporarily enable port 80 on the firewall
    firewall-cmd --add-port=80/tcp

    certbot certonly --agree-tos --email "${email}" --standalone -n -d "${hostPublic}" -d "${hostTrusted}" -d "${hostSandbox}"

    # Revert firewall to original state
    firewall-cmd --reload
}

