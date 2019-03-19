## Mailtrain v2 beta is available. Check it out here https://github.com/Mailtrain-org/mailtrain/tree/development

# Mailtrain

[Mailtrain](http://mailtrain.org) is a self hosted newsletter application built on Node.js (v7+) and MySQL (v5.5+ or MariaDB).

![](http://mailtrain.org/mailtrain.png)

## Features

* Subscriber list management
* List segmentation
* Custom fields
* Email templates
* Large CSV list import files

Subscribe to Mailtrain Newsletter [here](https://mailtrain.org/subscription/S18sew2wM) (uses Mailtrain obviously)

## Hardware Requirements
* 1 vCPU
* 1024 MB RAM

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
* Navigate to [http://localhost:3000/settings](http://localhost:3000/settings) and update service configuration, especially replace the value in `Service Address (URL)` from `localhost` to the actual IP or domain if installed on a server, otherwise e.g. image upload will not work.
* Navigate to [http://localhost:3000/users/account](http://localhost:3000/users/account) and update user information and password.

## Quick Start - Manual Install (any OS that supports Node.js)

### Requirements: 
 * Mailtrain requires at least **Node.js v7**. If you want to use an older version of Node.js then you should use version v1.24 of Mailtrain. You can either download it [here](https://github.com/Mailtrain-org/mailtrain/archive/v1.24.0.zip) or if using git then run `git checkout v1.24.0` before starting it

  1. Download Mailtrain files using git: `git clone git://github.com/Mailtrain-org/mailtrain.git` (or download [zipped repo](https://github.com/Mailtrain-org/mailtrain/archive/master.zip)) and open Mailtrain folder `cd mailtrain`
  2. Run `npm install --production` in the Mailtrain folder to install required dependencies
  3. Copy [config/default.toml](config/default.toml) as `config/production.toml` and update MySQL and any other settings in it
  4. Run the server `NODE_ENV=production npm start`
  5. Open [http://localhost:3000/](http://localhost:3000/)
  6. Authenticate as `admin`:`test`
  7. Navigate to [http://localhost:3000/settings](http://localhost:3000/settings) and update service configuration, especially replace the value in `Service Address (URL)` from `localhost` to the actual IP or domain if installed on a server, otherwise e.g. image upload will not work.
  8. Navigate to [http://localhost:3000/users/account](http://localhost:3000/users/account) and update user information and password

## Read The Docs
For more information, please [read the docs](http://docs.mailtrain.org/).


## License

  * Versions 1.22.0 and up **GPL-V3.0**
  * Versions 1.21.0 and up: **EUPL-1.1**
  * Versions 1.19.0 and up: **MIT**
  * Up to versions 1.18.0 **GPL-V3.0**
