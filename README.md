# Mailtrain

[Mailtrain](http://mailtrain.org) is a self hosted newsletter application built on Node.js (v5+) and MySQL (v5.5+ or MariaDB).

![](http://mailtrain.org/mailtrain.png)

> **NB!** I'm running an IndieGoGo campaign to help fund developing first class automation support into Mailtrain. See all details here: [https://igg.me/at/mailtrain/8720095](https://igg.me/at/mailtrain/8720095)

## Features

Mailtrain supports subscriber list management, list segmentation, custom fields, email templates, large CSV list import files, etc.

Subscribe to Mailtrain Newsletter [here](http://mailtrain.org/subscription/EysIv8sAx) (uses Mailtrain obviously)

## Cons

  * Alpha-grade software. Might or might not work as expected
  * Awful code base, needs refactoring
  * No tests
  * Almost no documentation (there are some guides in the [Wiki](https://github.com/andris9/mailtrain/wiki))

## Requirements

  * Nodejs v5+
  * MySQL v5.5 or MariaDB
  * Redis (optional, disabled by default, used only for session storage)

## Installation

### Automatic install (Ubuntu 14.04)

You can download and run [install.sh](setup/install.sh) in your blank Ubuntu 14.04 VPS to set up
Mailtrain and all required dependencies (including MySQL).

If you are using DigitalOcean then you can copy the contents of the [installation script](setup/install.sh) to the User Data textarea field when creating a new VPS (select Ubuntu 14.04 as the droplet Distribution image). After your droplet is created it should already have Mailtrain up and running. Navigate to http://droplet-hostname-or-ip/ and authenticate as `admin`:`test`. Do not forget to update your account information and set up SMTP settings.

### Manual (any OS that supports Node.js)

  1. Download Mailtrain files using git: `git clone git://github.com/andris9/mailtrain.git` (or download [zipped repo](https://github.com/andris9/mailtrain/archive/master.zip)) and open Mailtrain folder `cd mailtrain`
  2. Run `npm install --production` in the Mailtrain folder to install required dependencies
  3. Copy [config/default.toml](config/default.toml) as `config/production.toml` and update MySQL and any other settings in it
  4. Run the server `NODE_ENV=production npm start`
  5. Open [http://localhost:3000/](http://localhost:3000/)
  6. Authenticate as `admin`:`test`
  7. Navigate to [http://localhost:3000/settings](http://localhost:3000/settings) and update service configuration
  8. Navigate to [http://localhost:3000/users/account](http://localhost:3000/users/account) and update user information and password

## Upgrade

  * Replace old files with new ones by running in the Mailtrain folder `git pull origin master` if you used Git to set Mailtrain up or just download [new files](https://github.com/andris9/mailtrain/archive/master.zip) and replace old ones with these
  * Run `npm install --production` in the Mailtrain folder

## Using environment variables

Some servers expose custom port and hostname options through environment variables. To support these, create a new configuration file `config/local.js`:

```
module.exports = {
    www: {
        port: process.env.OPENSHIFT_NODEJS_PORT,
        host: process.env.OPENSHIFT_NODEJS_IP
    }
};
```

Mailtrain uses [node-config](https://github.com/lorenwest/node-config) for configuration management and thus the config files are loaded in the following order:

  1. default.toml
  2. {NODE_ENV}.toml (eg. development.toml or production.toml)
  3. local.js

### Running behind Nginx proxy

Edit [mailtrain.nginx](setup/mailtrain.nginx) (update `server_name` directive) and copy it to `/etc/nginx/sites-enabled`

### Running as an Upstart service in Ubuntu 14.04

Edit [mailtrain.conf](setup/mailtrain.conf) (update application folder) and copy it to `/etc/init`

## Nitrous Quickstart

You can quickly create a free development environment for this Mailtrain project in the cloud on www.nitrous.io:

<a href="https://www.nitrous.io/quickstart">
  <img src="https://nitrous-image-icons.s3.amazonaws.com/quickstart.png" alt="Nitrous Quickstart" width=142 height=34>
</a>

In the IDE, start Mailtrain via `Run > Start Mailtrain` and access your site via `Preview > 3000`.

## Bounce handling

Mailtrain uses webhooks integration to detect bounces and spam complaints. Currently supported webhooks are:

  * **AWS SES** – create a SNS topic for complaints and bounces and use `http://domain/webhooks/aws` as the subscriber URL for these topics
  * **SparkPost** – use `http://domain/webhooks/sparkpost` as the webhook URL for bounces and complaints ([instructions](https://github.com/andris9/mailtrain/wiki/Setting-up-Webhooks-for-SparkPost))
  * **SendGrid** – use `http://domain/webhooks/sendgrid` as the webhook URL for bounces and complaints ([instructions](https://github.com/andris9/mailtrain/wiki/Setting-up-Webhooks-for-SendGrid))
  * **Mailgun** – use `http://domain/webhooks/mailgun` as the webhook URL for bounces and complaints ([instructions](https://github.com/andris9/mailtrain/wiki/Setting-up-Webhooks-for-Mailgun))

Additionally Mailtrain (v1.1+) is able to use VERP-based bounce handling. This would require to have a compatible SMTP relay (the services mentioned above strip out or block VERP addresses in the SMTP envelope) and you also need to set up special MX DNS name that points to your Mailtrain installation server.

## License

**GPL-V3.0**
