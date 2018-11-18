# Mailtrain

[Mailtrain](http://mailtrain.org) is a self hosted newsletter application built on Node.js (v10+) and MySQL (v8+) or MariaDB (v10+).

![](http://mailtrain.org/mailtrain.png)

## Features

* Subscriber list management
* List segmentation
* Custom fields
* Email templates (including MJML-based templates)
* Large CSV list import files
* Custom reports
* Automation (triggered and RSS campaigns)
* Multiple users with granular user permissions and flexible sharing
* Hierarchical namespaces for enterprise-level situations

## Hardware Requirements
* 1 vCPU
* 2048 MB RAM

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

## Quick Start - Manual Install (any OS that supports Node.js)

### Requirements: 
 * Mailtrain requires at least **Node.js v10**.

  1. Download Mailtrain files using git: `git clone git://github.com/Mailtrain-org/mailtrain.git` (or download [zipped repo](https://github.com/Mailtrain-org/mailtrain/archive/master.zip)) and open Mailtrain folder `cd mailtrain`
  2. Run `npm install --production` in the Mailtrain folder to install required dependencies
  3. Copy [config/default.toml](config/default.toml) as `config/production.toml` and update MySQL and any other settings in it
  4. Run the server `NODE_ENV=production npm start`
  5. Open [http://localhost:3000/](http://localhost:3000/)
  6. Authenticate as `admin`:`test`
  7. Navigate to [http://localhost:3000/settings](http://localhost:3000/settings) and update service configuration
  8. Navigate to [http://localhost:3000/users/account](http://localhost:3000/users/account) and update user information and password

## Read The Docs
For more information, please [read the docs](http://docs.mailtrain.org/).


## License

  **GPL-V3.0**
