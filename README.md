# Mailtrain v2 (beta)

Mailtrain is a self hosted newsletter application built on Node.js (v10+) and MySQL (v8+) or MariaDB (v10+).

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
- *sbox.mailtrain.example.com* - sandbox endpoint (CNAME record `sbox.mailtrain` under `example.com` domain that points to `lists`)


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
    git checkout development
    ```

4. Run the installation script. Replace the urls and your email address with the correct values. **NOTE** that running this script you agree
   Let's Encrypt's conditions.

   For Centos 7 type:
    ```
    bash setup/install-centos7-https.sh mailtrain.example.com sbox.mailtrain.example.com lists.example.com admin@example.com
    ```

   For Ubuntu 18.04 LTS type:
    ```
    bash setup/install-ubuntu1804-https.sh mailtrain.example.com sbox.mailtrain.example.com lists.example.com admin@example.com
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
    git checkout development
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
- http://localhost:3003 -> https://sbox.mailtrain.example.com
- http://localhost:3004 -> https://lists.example.com

To deploy Mailtrain with Docker, you need the following three dependencies installed:

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

These are the steps to start Mailtrain via docker-compose:

1. Download Mailtrain's docker-compose build file
    ```
    curl -O https://raw.githubusercontent.com/Mailtrain-org/mailtrain/development/docker-compose.yml
    ```

2. Deploy Mailtrain via docker-compose (in the directory to which you downloaded the `docker-compose.yml` file). This will take quite some time when run for the first time. Subsequent executions will be fast.
    ```
    docker-compose up
    ```

3. Open the trusted endpoint http://localhost:3000

4. Authenticate as `admin`:`test`

The instructions above use an automatically built Docker image on DockerHub (https://hub.docker.com/r/mailtrain/mailtrain). If you want to build the Docker image yourself (e.g. when doing development), use the `docker-compose-local.yml` located in the project's root directory.

### Docker Environment Variables

| Parameter        | Description |
| ---------        | ----------- |
| URL_BASE_TRUSTED | sets the trusted url of the instance (default: http://localhost:3000) |
| URL_BASE_SANDBOX | sets the sandbox url of the instance (default: http://localhost:3003) |
| URL_BASE_PUBLIC  | sets the public url of the instance (default: http://localhost:3004)  |
| WITH_PROXY       | use if Mailtrain is behind an http reverse proxy                      |
| MONGO_HOST       | sets mongo host (default: mongo)                                      |
| REDIS_HOST       | sets redis host (default: redis)                                      |
| MYSQL_HOST       | sets mysql host (default: mysql)                                      |
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

## License

  **GPL-V3.0**
