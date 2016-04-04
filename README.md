# Mailtrain

[Mailtrain](http://mailtrain.org) is a self hosted newsletter application built on Node.js (v5+) and MySQL (v5.5+ or MariaDB).

![](http://mailtrain.org/mailtrain.png)

## Features

Mailtrain supports subscriber list management, list segmentation, custom fields, email templates, large CSV list import files, etc.

Subscribe to Mailtrain Newsletter [here](http://mailtrain.org/subscription/EysIv8sAx) (uses Mailtrain obviously)

## Cons

  * Alpha-grade software. Might or might not work as expected
  * Awful code base, needs refactoring
  * No tests
  * No documentation

## Requirements

  * Nodejs v5+
  * MySQL v5.5 or MariaDB
  * Redis (optional, used for session storage only)

## Installation

  1. Download and unpack Mailtrain [sources](https://github.com/andris9/mailtrain/archive/master.zip)
  2. Run `npm install` in the Mailtrain folder to install required dependencies
  3. Copy [config/default.toml](config/default.toml) as `config/production.toml` and update MySQL Settings in it
  4. Import SQL tables by running `mysql -u MYSQL_USER -p MYSQL_DB < setup/mailtrain.sql`
  5. Run the server `NODE_ENV=production npm start`
  6. Open [http://localhost:3000/](http://localhost:3000/)
  7. Authenticate as `admin`:`test`
  8. Navigate to [http://localhost:3000/settings](http://localhost:3000/settings) and update service configuration
  9. Navigate to [http://localhost:3000/users/account](http://localhost:3000/users/account) and update user information and password

### Running behind Nginx proxy

Edit [mailtrain.nginx](setup/mailtrain.nginx) (update `server_name` directive) and copy it to `/etc/nginx/sites-enabled`

### Running as an Upstart service in Ubuntu 14.04

Edit [mailtrain.conf](setup/mailtrain.conf) (update application folder) and copy it to `/etc/init`

## Bounce handling

Mailtrain uses webhooks integration to detect bounces and spam complaints. Currently supported webhooks are:

  * **AWS SES** – create a SNS topic for complaints and bounces and use `http://domain/webhooks/aws` as the subscriber URL for these topics
  * **SparkPost** – use `http://domain/webhooks/aws` as the webhook URL for bounces and complaints
  * **SendGrid** – use `http://domain/webhooks/sendgrid` as the webhook URL for bounces and complaints
  * **Mailgun** – use `http://domain/webhooks/mailgun` as the webhook URL for bounces and complaints

## License

**GPL-V3.0**
