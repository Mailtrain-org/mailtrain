# Mailtrain

[Mailtrain](http://mailtrain.org) is a self hosted newsletter application built on Node.js (v10+) and MySQL (v8+) or MariaDB (v10+).

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

## Hardware Requirements
* 1 vCPU
* 2048 MB RAM

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

2. Install git
    ```
    yum install -y git
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
    sh setup/install-centos7-https.sh mailtrain.example.com sbox.mailtrain.example.com lists.example.com admin@example.com
    ```

   For Ubuntu 18.04 LTS type:
    ```
    sh setup/install-ubuntu1804-https.sh mailtrain.example.com sbox.mailtrain.example.com lists.example.com admin@example.com
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
    ```
    yum install -y git
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
    sh setup/install-centos7-local.sh
    ```

   For Ubuntu 18.04 LTS type:
    ```
    sh setup/install-ubuntu1804-local.sh
    ```

5. Start Mailtrain and enable to be started by default when your server starts.
    ```
    systemctl start mailtrain
    systemctl enable mailtrain
    ```

6. Open the trusted endpoint http://localhost:3000

7. Authenticate as `admin`:`test`



## Quick Start - Deploy with Docker
#### Requirements:

  * [Docker](https://www.docker.com/)
  * [Docker Compose](https://docs.docker.com/compose/)

#### Steps:
Depending on how you have configured your system and Docker you may need to prepend the commands below with `sudo`.

* Download Mailtrain files using git: `git clone git://github.com/Mailtrain-org/mailtrain.git` (or download [zipped repo](https://github.com/Mailtrain-org/mailtrain/archive/master.zip)) and open Mailtrain folder `cd mailtrain`
* Copy the file `docker-compose.override.yml.tmpl` to `docker-compose.override.yml` and modify it if you need to.
* Bring up the stack with: `docker-compose up -d`
* Start: `docker-compose start`
* Open [http://localhost:3000/](http://localhost:3000/) (change the host name `localhost` to the name of the host where you are deploying the system).
* Authenticate as user `admin` with password `test`
* Navigate to [http://localhost:3000/settings](http://localhost:3000/settings) and update service configuration.
* Navigate to [http://localhost:3000/users/account](http://localhost:3000/users/account) and update user information and password.


## License

  **GPL-V3.0**
