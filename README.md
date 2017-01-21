# Mailtrain

[Mailtrain](http://mailtrain.org) is a self hosted newsletter application built on Node.js (v5+) and MySQL (v5.5+ or MariaDB).

![](http://mailtrain.org/mailtrain.png)

## Features

Mailtrain supports subscriber list management, list segmentation, custom fields, email templates, large CSV list import files, etc.

Subscribe to Mailtrain Newsletter [here](http://mailtrain.org/subscription/EysIv8sAx) (uses Mailtrain obviously)

## Official partners

### iRedMail

![](https://mailtrain.org/images/iredmail-logo-red-114.png)

[iRedMail](http://www.iredmail.org/) Free, open source mail server solution

### ZoneMTA

Check out [ZoneMTA](https://github.com/zone-eu/zone-mta) as an alternative self hosted MTA

## Cons

  * Beta-grade software. Might or might not work as expected. There are several users with list sizes between 100k and 1M and Mailtrain seems to work for them but YMMV
  * Almost no documentation (there are some guides in the [Wiki](https://github.com/andris9/mailtrain/wiki))

## Requirements

  * Nodejs v6+
  * MySQL v5.5 or MariaDB
  * Redis. Optional, disabled by default. Used for session storage and for caching state between multiple processes. If you do not have Redis enabled then you can only use a single sender process

## Installation

### Simple install (Ubuntu)

You can download and run [install.sh](setup/install.sh) in your blank Ubuntu VPS to set up
Mailtrain and all required dependencies (including MySQL). The installation script assumes a somewhat blank server, so if this is a machine you are already using for something else, you might want to skip the automatic install and proceed manually.

If you like living on the edge and feel adventurous you can run the installation script directly from your command line as root:

```
curl https://raw.githubusercontent.com/andris9/mailtrain/master/setup/install.sh | sudo bash
```

Install script installs and sets up the following:

  * **Node.js** (version 6.x)
  * **MariaDB** (the default version from apt-get)
  * **Mailtrain** (from the master branch) on port 80
  * **UFW** firewall that blocks everything besides ports 22, 25, 80, 443
  * **[ZoneMTA](https://github.com/zone-eu/zone-mta)** to queue and deliver messages (**NB!** using ZoneMTA assumes that outgoing port 25 is open which might not be the case on some hosts like on the Google Cloud)
  * **Redis** server for session cache
  * **logrotate** to rotate Mailtrain log files
  * **upstart** or **systemd** init script to automatically start and manage Mailtrain process

After the install script has finished and you see a success message then you should have a Mailtrain instance running at http://yourdomain.com

#### Next steps after installation

##### 1. Change admin password

Navigate to http://yourdomain.com where yourdomain.com is the address of your server. Click on the Sign In link in the right top corner of the page. Authenticate with the following credentials:

  * Username: **admin**
  * Password: **test**

Once authenticated, click on your username in the right top corner of the page and select "Account". Now you should be able to change your default password.

##### 2. Update page configuration

If signed in navigate to http://yourdomain.com/settings and check that all email addresses and domain names are correct. Mailtrain default installation comes bundled with [ZoneMTA](https://github.com/zone-eu/zone-mta), so you should be able to send out messages right away. ZoneMTA even handles a lot of bounces (not all kind of bounces though) automatically so you do not have to change anything in the SMTP settings to get going.

##### 3. Set up SPF

If you are using the bundled ZoneMTA then you need to add your Mailtrain host to the SPF DNS record of your sending domain. So if you are sending messages as "info@example.com" then the domain "example.com" should have a SPF DNS record that points to the IP address or hostname of your Mailtrain host. Everything should work without the SPF record but setting it up correctly improves the deliverability a lot.

##### 4. Set up DKIM

If you are using the bundled ZoneMTA then you can provide a DKIM key to sign all outgoing messages. You can provide the DKIM private key in Mailtrain Settings page. This key is only used by ZoneMTA, so if you are using some other provider then you check your providers' documentation to see how to set up DKIM. In case of ZoneMTA you only need to open Mailtrain Settings page, scroll to DKIM config section and fill the fields for DKIM selector and DKIM private key. Everything should work without the DKIM signatures but setting it up correctly improves the deliverability a lot.

##### 5. Set up VERP

The bundled ZoneMTA can already handle a large amount of bounces if you use it to deliver messages but not all - namely such bounces that happen *after* the recipient MX accepts the message for local delivery. This might happen for example when a user exists, so the MX accepts the message but the quota for that user is checked only when actually storing the message to users' mailbox. Then a bounce message is generated and sent to the original sender which in your case is the mail address you are sending your list messages from. You can catch these messages and mark such recipients manually as bounced but alternatively you can set up a VERP based bounce handler that does this automatically. In this case the sender on the message envelope would not be your actual address but a rewritten bounce address that points to your Mailtrain installation.

To set it up you need to create an additonal DNS MX entry for a bounce domain, eg "bounces.example.com" if you are sending from "example.com". This entry should point to your Mailtrain server IP address. Next you should enable the VERP handling in Mailtrain Settings page.

> As ZoneMTA uses envelope sender as the default for DKIM addresses, then if using VERP you need to set up DKIM to your bounce domain instead of sender domain and also store the DKIM key as "bouncedomain.selector.pem" in the ZoneMTA key folder.

If you do not use VERP with ZoneMTA then you should get notified most of the bounces so everything should mostly work without it

##### 6. Set up proper PTR record

If you are using the bundled ZoneMTA then you should make sure you are using a proper PTR record for your server. For example if you use DigitalOcean then PTR is set automatically (it's the droplet name, so make sure your droplet name is the same as the domain name you are running Mailtrain from). If you use AWS then you can request setting up PTR records using [this form](https://portal.aws.amazon.com/gp/aws/html-forms-controller/contactus/ec2-email-limit-rdns-request) (requires authentication). Otherwise you would have to check from your service provider, hot to get the PTR record changed. Everything should work without the PTR record but setting it up correctly improves the deliverability a lot.

##### 7. Ready to send!

With proper SPF, DKIM and PTR records (DMARC wouldn't hurt either) I got perfect 10/10 score out from [MailTester](https://www.mail-tester.com/) when sending a campaign message to a MailTester test address. I did not have VERP turned on, so the sender address matched return path address.

### Manual install (any OS that supports Node.js)

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

Edit [mailtrain.nginx](setup/mailtrain-nginx.conf) (update `server_name` directive) and copy it to `/etc/nginx/sites-enabled`

### Running as an Upstart service in Ubuntu 14.04

Edit [mailtrain.conf](setup/mailtrain.conf) (update application folder) and copy it to `/etc/init`

## Cloudron

You can easily install and self-host Mailtrain on the Cloudron to send newsletters from your custom domain:

[![Install](https://cloudron.io/img/button.svg)](https://cloudron.io/button.html?app=org.mailtrain.cloudronapp)

The source code for the Cloudron app is [here](https://git.cloudron.io/cloudron/mailtrain-app).

## Bounce handling

Mailtrain uses webhooks integration to detect bounces and spam complaints. Currently supported webhooks are:

  * **AWS SES** – create a SNS topic for complaints and bounces and use `http://domain/webhooks/aws` as the subscriber URL for these topics
  * **SparkPost** – use `http://domain/webhooks/sparkpost` as the webhook URL for bounces and complaints ([instructions](https://github.com/andris9/mailtrain/wiki/Setting-up-Webhooks-for-SparkPost))
  * **SendGrid** – use `http://domain/webhooks/sendgrid` as the webhook URL for bounces and complaints ([instructions](https://github.com/andris9/mailtrain/wiki/Setting-up-Webhooks-for-SendGrid))
  * **Mailgun** – use `http://domain/webhooks/mailgun` as the webhook URL for bounces and complaints ([instructions](https://github.com/andris9/mailtrain/wiki/Setting-up-Webhooks-for-Mailgun))
  * **ZoneMTA** – use `http://domain/webhooks/zone-mta` as the webhook URL for bounces. If you install Mailtrain with the included installation script then this route gets set up automatically during the installation process
  * **Postfix** – This is not a webhook but a TCP server on port 5699 to listen for piped Postfix logs. Enable it with the `[postfixbounce]` config option. To use it, pipe the log to that port using *tail*: `tail -F /var/log/mail.log | nc localhost 5699 -` (if Mailtrain restarts then you need to re-establish the *tail* pipe), alternatively you could send the log with a cron job periodically `tail -n 100 | nc localhost 5699 -`.

Additionally Mailtrain (v1.1+) is able to use VERP-based bounce handling. This would require to have a compatible SMTP relay (the services mentioned above strip out or block VERP addresses in the SMTP envelope) and you also need to set up special MX DNS name that points to your Mailtrain installation server.

If using VERP with iRedMail, see [this post](http://www.iredmail.org/forum/post49325.html#p49325) for correct configuration as iRedMail blocks by default senders that do not match authentication username (VERP address and user account address are different).

## Testing

There is a built in /dev/null server in Mailtrain that you can use to load test your installation. Check the `[testserver]` section in the configuration file for details. By default the test server is disabled. The server uses only cleartext connections, so select "Do not use encryption" in the encryption settings when setting up the server data in Mailtrain.

Additionally you can generate CSV import files with fake subscriber data:

```
node setup/fakedata.js > somefile.csv
```

This command generates a CSV file with 100 000 subscriber accounts

## License

  * Versions 1.19.0 and up: **MIT**
  * Up to versions 1.18.0 **GPL-V3.0**
