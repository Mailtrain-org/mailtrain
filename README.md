# Mailtrain

[Mailtrain](http://mailtrain.org) is a self hosted newsletter application built on Node.js (v7+) and MySQL (v5.5+ or MariaDB).

![](http://mailtrain.org/mailtrain.png)

> Mailtrain requires at least **Node.js v7**. If you want to use an older version of Node.js then you should use version v1.24 of Mailtrain. You can either download it [here](https://github.com/Mailtrain-org/mailtrain/archive/v1.24.0.zip) or if using git then run `git checkout v1.24.0` before starting it

## Features

* subscriber list management
* list segmentation
* custom fields
* email templates
* large CSV list import files

Subscribe to Mailtrain Newsletter [here](http://mailtrain.org/subscription/EysIv8sAx) (uses Mailtrain obviously)

## Hardware Requirements
* 1 vCPU
* 1024 MB RAM

## Quick Start - Deploy with Docker
#### Requirements:

  * [Docker](https://www.docker.com/)
  * [Docker Compose](https://docs.docker.com/compose/)

#### Steps:

* Download Mailtrain files using git: `git clone git://github.com/Mailtrain-org/mailtrain.git` (or download [zipped repo](https://github.com/Mailtrain-org/mailtrain/archive/master.zip)) and open Mailtrain folder `cd mailtrain`
* **Note**: depending on how you have configured your system and Docker you may need to prepend the commands below with `sudo`.
* Copy the file `docker-compose.override.yml.tmpl` to `docker-compose.override.yml` and modify it if you need to.
* Bring up the stack with: `docker-compose up -d`
    * by default it will use the included `docker-compose.yml` file and override some configurations taken from the `docker-compose.override.yml` file.
* If you want to use only / copy the `docker-compose.yml` file (for example, if you were deploying with Rancher), you may need to first run `docker-compose build` to make sure your system has a Docker image `mailtrain:latest`.
* Open [http://localhost:3000/](http://localhost:3000/) (change the host name `localhost` to the name of the host where you are deploying the system).
* Authenticate as user `admin` with password `test`
* Navigate to [http://localhost:3000/settings](http://localhost:3000/settings) and update service configuration.
* Navigate to [http://localhost:3000/users/account](http://localhost:3000/users/account) and update user information and password.

**Note**: If you need to add or modify custom configurations, copy the file `config/docker-production.toml.tmpl` to `config/production.toml` and modify as you need. By default, the Docker image will do just that, automatically, so you can bring up the stack and it will work with default configurations.
  

## Manual Install (any OS that supports Node.js)

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

  * Versions 1.22.0 and up **GPL-V3.0**
  * Versions 1.21.0 and up: **EUPL-1.1**
  * Versions 1.19.0 and up: **MIT**
  * Up to versions 1.18.0 **GPL-V3.0**
