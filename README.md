# Mailtrain

[Mailtrain](http://mailtrain.org) is a self hosted newsletter application built on Node.js (v5+) and MySQL (v5.5+ or MariaDB).

## Installation

  1. Download Mailtrain sources
  2. Run `npm install` in the mailtrain folder to install required dependencies
  3. Edit [default.toml](config/default.toml) and update MySQL Settings
  4. Import SQL tables by running `mysql -u MYSQL_USER -p MYSQL_DB < setup/mailtrain.sql`
  5. Run the server `npm start`
  6. Open http://localhost:3000
  7. Authenticate as `admin`:`test`
  8. Navigate to http://localhost:3000/settings and update service configuration
  9. Navigate to http://localhost:3000/users/account and update user information and password

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
