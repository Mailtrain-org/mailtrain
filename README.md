# Mailtrain v2

Mailtrain is a self hosted newsletter application built on Node.js (v14+) and MySQL (v8+) or MariaDB (v10+).

This is version 2 of Mailtrain. It mostly implements all features of v1 and add some more. It is a complete rewrite, so you will have to install it from scratch.

If you are upgrading from Mailtrain v1, backup the DB and use it for Mailtrain v2. Mailtrain v2 should be able to upgrade the DB to the new schema.

![](https://mailtrain.org/mailtrain.png)

## Features

* Subscriber lists management
* List segmentation
* Custom fields
* Email templates (including MJML-based templates)
* Custom reports
* Automation (triggered and RSS campaigns)
* Multiple users with granular user permissions and flexible sharing
* Hierarchical namespaces for enterprise-level situations
* Builtin Zone-MTA (https://github.com/zone-eu/zone-mta) for close-to-zero setup of mail delivery

## Recommended minimal hardware Requirements
* 2 vCPU
* 4096 MB RAM


## Quick Start

### Preparation
Mailtrain creates three URL endpoints, which are referred to as "trusted", "sandbox" and "public". This allows Mailtrain
to guarantee security and avoid XSS attacks in the multi-user settings. The function of these three endpoints is as follows:
- *trusted* - This is the main endpoint for the UI that a logged-in user uses to manage lists, send campaigns, etc.
- *sandbox* - This is an endpoint not directly visible to a user. It is used to host WYSIWYG template editors.
- *public* - This is an endpoint for subscribers. It is used to host subscription management forms, files and archive.

The recommended deployment of Mailtrain would use 3 DNS entries that all points to the **same** IP address. For example as follows:
- *lists.example.com* - public endpoint (A record `lists` under `example.com` domain)
- *mailtrain.example.com* - trusted endpoint (CNAME record `mailtrain` under `example.com` domain that points to `lists`)
- *sbox-mailtrain.example.com* - sandbox endpoint (CNAME record `sbox-mailtrain` under `example.com` domain that points to `lists`)


### Installation on fresh CentOS 7 or Ubuntu 18.04 LTS (public website secured by SSL)

This will setup a publicly accessible Mailtrain instance. All endpoints (trusted, sandbox, public) will provide both HTTP (on port 80)
and HTTPS (on port 443). The HTTP ports just issue HTTP redirect to their HTTPS counterparts.

The script below will also acquire a valid certificate from [Let's Encrypt](https://letsencrypt.org/).
If you are hosting Mailtrain on AWS or some other cloud provider, make sure that **before** running the installation
script you allow inbound connection to ports 80 (HTTP) and 443 (HTTPS).

**Note,** that this will automatically accept the Let's Encrypt's Terms of Service.
Thus, by running this script below, you agree with the Let's Encrypt's Terms of Service (https://letsencrypt.org/documents/LE-SA-v1.2-November-15-2017.pdf).



1. Login as root. (I had some problems running npm as root on CentOS 7 on AWS. This seems to be fixed by the seemingly extraneous `su` within `sudo`.)
    ```
    sudo su -
    ```

2. Install GIT

   For Centos 7 type:
    ```
    yum install -y git
    ```

   For Ubuntu 18.04 LTS type
    ```
    apt-get install -y git
    ```

3. Download Mailtrain using git to the `/opt/mailtrain` directory
    ```
    cd /opt
    git clone https://github.com/Mailtrain-org/mailtrain.git
    cd mailtrain
    git checkout v2
    ```

4. Run the installation script. Replace the urls and your email address with the correct values. **NOTE** that running this script you agree
   Let's Encrypt's conditions.

   For Centos 7 type:
    ```
    bash setup/install-centos7-https.sh mailtrain.example.com sbox-mailtrain.example.com lists.example.com admin@example.com
    ```

   For Ubuntu 18.04 LTS type:
    ```
    bash setup/install-ubuntu1804-https.sh mailtrain.example.com sbox-mailtrain.example.com lists.example.com admin@example.com
    ```

5. Start Mailtrain and enable to be started by default when your server starts.
    ```
    systemctl start mailtrain
    systemctl enable mailtrain
    ```

6. Open the trusted endpoint (like `https://mailtrain.example.com`)

7. Authenticate as `admin`:`test`

8. Update your password under admin/Account

9. Update your settings under Administration/Global Settings.

10. If you intend to sign your email by DKIM, set the DKIM key and DKIM selector under Administration/Send Configurations.


### Installation on fresh CentOS 7 or Ubuntu 18.04 LTS (local installation)

This will setup a locally accessible Mailtrain instance (primarily for development and testing).
All endpoints (trusted, sandbox, public) will provide only HTTP as follows:
- http://localhost:3000 - trusted endpoint
- http://localhost:3003 - sandbox endpoint
- http://localhost:3004 - public endpoint

1. Login as root. (I had some problems running npm as root on CentOS 7 on AWS. This seems to be fixed by the seemingly extraneous `su` within `sudo`.)
    ```
    sudo su -
    ```

2. Install git

   For Centos 7 type:
    ```
    yum install -y git
    ```

   For Ubuntu 18.04 LTS type:
    ```
    apt-get install -y git
    ```

3. Download Mailtrain using git to the `/opt/mailtrain` directory
    ```
    cd /opt
    git clone https://github.com/Mailtrain-org/mailtrain.git
    cd mailtrain
    git checkout v2
    ```

4. Run the installation script. Replace the urls and your email address with the correct values. **NOTE** that running this script you agree
   Let's Encrypt's conditions.

   For Centos 7 type:
    ```
    bash setup/install-centos7-local.sh
    ```

   For Ubuntu 18.04 LTS type:
    ```
    bash setup/install-ubuntu1804-local.sh
    ```

5. Start Mailtrain and enable to be started by default when your server starts.
    ```
    systemctl start mailtrain
    systemctl enable mailtrain
    ```

6. Open the trusted endpoint http://localhost:3000

7. Authenticate as `admin`:`test`



### Deployment with Docker and Docker compose

This setup starts a stack composed of Mailtrain, MongoDB, Redis, and MariaDB. It will setup a locally accessible Mailtrain instance with HTTP endpoints as follows.
- http://localhost:3000 - trusted endpoint
- http://localhost:3003 - sandbox endpoint
- http://localhost:3004 - public endpoint

To make this publicly accessible, you should add reverse proxy that makes these endpoints publicly available over HTTPS. If using the proxy, you also need to set the URL bases and `--withProxy` parameter via `MAILTRAIN_SETTING` as shown below.
An example of such proxy would be:
- http://localhost:3000 -> https://mailtrain.example.com
- http://localhost:3003 -> https://sbox-mailtrain.example.com
- http://localhost:3004 -> https://lists.example.com

To deploy Mailtrain with Docker, you need the following two dependencies installed:

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

These are the steps to start Mailtrain via docker-compose:

1. Download Mailtrain's docker-compose build file
    ```
    curl -O https://raw.githubusercontent.com/Mailtrain-org/mailtrain/v2/docker-compose.yml
    ```

2. Deploy Mailtrain via docker-compose (in the directory to which you downloaded the `docker-compose.yml` file). This will take quite some time when run for the first time. Subsequent executions will be fast.
    ```
    docker-compose up
    ```

3. Open the trusted endpoint http://localhost:3000

4. Authenticate as `admin`:`test`

The instructions above use an automatically built Docker image on DockerHub (https://hub.docker.com/r/mailtrain/mailtrain). If you want to build the Docker image yourself (e.g. when doing development), use the `docker-compose-local.yml` located in the project's root directory.


### Deployment with Docker and Docker compose (for development)
This setup starts a stack like above, but is tweaked to be used for local development using docker containers.

1. Clone this repository

2. Bring up the development stack
    ```
    docker-compose -f docker-compose-develop.yml up -d
    ```
3. Connect to a shell inside the container
    ```
    docker-compose exec mailtrain bash
    ```
4. Run these commands once to install all the node modules and build the client webapp
    ```
    cd /app
    bash setup/reinstall-modules.sh
    cd /app/client && npm run build && cd /app

5. Start the server for the first time with this command, to generate the `server/config/production.yaml`
    ```
    bash docker-entrypoint.sh
    ```


### Docker Environment Variables
When using Docker, you can override the default Mailtrain settings via the following environment variables. These variables have to be defined in the docker-compose config
file. You can give them a value directly in the `docker-compose.yml` config file. 

Alternatively, you can just declare them there leaving their value empty 
(see https://docs.docker.com/compose/environment-variables/#pass-environment-variables-to-containers). In that case, the 
value can be provided via a file called `.env` or via environment 
variables (e.g. `URL_BASE_TRUSTED=https://mailtrain.domain.com (and more env-vars..) docker-compose -f docker-compose.yml build (or up)`)  

#### !!!WARNING!!! Always set ADMIN_PASSWORD, as it will leave your instance otherwise vurnerable with the default password being `test`!

| Parameter        | Description |
| ---------        | ----------- |
| ADMIN_PASSWORD | sets Admin Password, Admin users name can be changed, but password will always be overwritten by this, please set it always, as it otherwise defaults to `test` |
| ADMIN_ACCESS_TOKEN | sets Access Token for API, this is optional |
| PORT_TRUSTED     | sets the trusted port of the instance (default: 3000)                 |
| PORT_SANDBOX     | sets the sandbox port of the instance (default: 3003)                 |
| PORT_PUBLIC      | sets the public port of the instance (default: 3004)                  |
| URL_BASE_TRUSTED | sets the external trusted url of the instance (default: http://localhost:3000), e.g. https://mailtrain.example.com |
| URL_BASE_SANDBOX | sets the external sandbox url of the instance (default: http://localhost:3003), e.g. https://sbox-mailtrain.example.com |
| URL_BASE_PUBLIC  | sets the external public url of the instance (default: http://localhost:3004), e.g. https://lists.example.com |
| WWW_HOST         | sets the address that the server binds to (default: 0.0.0.0)          |
| WWW_PROXY        | use if Mailtrain is behind an http reverse proxy (default: false)     |
| WWW_SECRET       | sets the secret for the express session (default: `$(pwgen -1)`)      |
| MONGO_HOST       | sets mongo host (default: mongo)                                      |
| WITH_REDIS       | enables or disables redis (default: true)                             |
| REDIS_HOST       | sets redis host (default: redis)                                      |
| REDIS_PORT       | sets redis host (default: 6379)                                       |
| MYSQL_HOST       | sets mysql host (default: mysql)                                      |
| MYSQL_PORT       | sets mysql port (default: 3306)                                       |
| MYSQL_DATABASE   | sets mysql database (default: mailtrain)                              |
| MYSQL_USER       | sets mysql user (default: mailtrain)                                  |
| MYSQL_PASSWORD   | sets mysql password (default: mailtrain)                              |
| WITH_LDAP        | use if you want to enable LDAP authentication                         |
| LDAP_HOST        | LDAP Host for authentication (default: ldap)                          |
| LDAP_PORT        | LDAP port (default: 389)                                              |
| LDAP_SECURE      | use if you want to use LDAP with ldaps protocol                       |
| LDAP_BIND_USER   | User for LDAP connexion                                               |
| LDAP_BIND_PASS   | Password for LDAP connexion                                           |
| LDAP_FILTER      | LDAP filter                                                           |
| LDAP_BASEDN      | LDAP base DN                                                          |
| LDAP_UIDTAG      | LDAP UID tag (e.g. uid/cn/username)                                   |
| WITH_ZONE_MTA    | enables or disables builtin Zone-MTA (default: true)                  |
| POOL_NAME        | sets builtin Zone-MTA pool name (default: os.hostname())              |
| WITH_CAS         | use if you want to use CAS                                            |
| CAS_URL          | CAS base URL                                                          |
| CAS_NAMETAG      | The field used to save the name (default: username)                   |
| CAS_MAILTAG      | The field used to save the email (default: mail)                      |
| CAS_NEWUSERROLE  | The role of new users (default: nobody)                               |
| CAS_NEWUSERNAMESPACEID | The namespace id of new users (default: 1)                      |
| LOG_LEVEL        | sets log level among `silly|verbose|info|http|warn|error|silent` (default: `info`) |
| DEFAULT_LANGUAGE | sets default language (default: en-US) |
| WITH_POSTFIXBOUNCE | enables PostfixBounce TCP listener (default: false) |
| POSTFIXBOUNCE_PORT | sets PostfixBounce Listening TCP-Port (default: 5699) |
| POSTFIXBOUNCE_HOST | sets PostfixBounce Listening Host (default: 127.0.0.1) |

If you don't want to modify the original `docker-compose.yml`, you can put your overrides to another file (e.g. `docker-compose.override.yml`) -- like the one below.

```
version: '3'
services:
  mailtrain:
    environment:
    - URL_BASE_TRUSTED
    - URL_BASE_SANDBOX
    - URL_BASE_PUBLIC
```


## License

  **GPL-V3.0**
