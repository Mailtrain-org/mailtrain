# Changelog

## 1.23.2 2017-04-04

  * Allow skipping DNS check for imports
  * Added option to use subscription widgets

## 1.23.0 2017-03-19

  * Fixed security issue where description tags were able to include script tags. Reported by Andreas Lindh. Fixed with [ae6affda](https://github.com/Mailtrain-org/mailtrain/commit/ae6affda8193f034e06f7e095ee23821a83d5190)
  * Fixed security issue where templates that looked like file paths loaded content from arbitrary files. Reported by Andreas Lindh. Fixed with [0879fa41](https://github.com/Mailtrain-org/mailtrain/commit/0879fa412a2d4a417aeca5cd5092a8f86531e7ef)
  * Fixed security issue where users were able to use html tags in subscription values. Reported by Andreas Lindh. Fixed with [9d5fb816](https://github.com/Mailtrain-org/mailtrain/commit/9d5fb816c937114966d4f589e1ad4e164ff3a187)
  * Support for multiple HTML editors (Mosaico, GrapeJS, Summernote, HTML code)

## 1.22.0 2017-03-02

  * Reverted license back to GPL-v3 to support Mosaico

## 1.21.0 2017-02-17

  * Changed license from MIT to EUPL-1.1
  * Added support for sending mail using AWS SES

## 1.20.0 2016-12-11

  * Added option to distribute sending queue between multiple processes to speed up delivery

## 1.19.0 2016-09-15

  * Changed license from GPL-V3 to MIT

## 1.18.0 2016-09-08

  * Updated installation script to bundle ZoneMTA as the default sending engine
  * Added new option to disable clicked and opened tracking
  * Store remote IP for subscription confirmations

## 1.17.0 2016-08-29

  * Added new custom field for JSON data that is rendered using Handlebars when included in an email

## 1.16.0 2016-08-29

  * Render list values using Handlebars templates
  * Added new API method to create custom fields
  * Added LDAP authentication support

## 1.15.0 2016-07-28

  * Check SMTP settings using AJAX instead of posting entire form

## 1.14.0 2016-07-09

  * Fixed ANY match segments with range queries
  * Added an option to disable un/subscribe confirmation messages
  * Added support for throttling when sending messages
  * Added preview links in message lists

## 1.13.0 2016-06-23

  * Added API method to delete subscribers
  * Added a counter to triggers with a view to list all subscribers that caused this trigger to fire

## 1.12.1 2016-06-23

  * Fixed invalid base SQL dump

## 1.12.0 2016-06-22

  * Automation support. Create triggers that send a campaign once fired
  * Fixed an issue with unresolved URL redirects
  * Added support for relative date ranges in segments

## 1.11.0 2016-05-31

  * Retry transactional mail if failed with soft error (4xx)
  * New feature to preview campaigns using selected test users

## 1.10.1 2016-05-26

  * Fix a bug with SMTP transport instance where campaign sending stalled until server was restarted

## 1.10.0 2016-05-25

  * Fetch multiple unsent messages at once to speed up delivery
  * Fixed a bug of counting unsubscribers correctly
  * Use LONGTEXT for template text fields (messages might include inlined images which are larger than 64kB)

## 1.9.0 2016-05-16

  * New look
  * Added views for bounced/unsubscribed/complained etc.

## 1.8.2 2016-05-13

  * Added missing views for subscribers who clicked on any link and subscribers who opened the message

## 1.8.1 2016-05-13

  * Fixed an issue in API

## 1.8.0 2016-05-13

  * Show details about subscribers who clicked on a specific link

## 1.7.0 2016-05-11

  * Updated API, added new option **REQUIRE_CONFIRMATION** for subscriptions to send confirmation email before subscribing

## 1.6.0 2016-05-07

  * Added simple API support for adding and removing list subscriptions

## 1.5.0 2016-05-05

  * Fixed a bug in unsubscribing through the admin interface
  * Added individual link click stats

## 1.4.1 2016-05-04

  * Added support for RSS templates

## 1.4.0 2016-05-04

  * Added support for RSS campaigns
  * Subscribers get timezone attached to their profile
  * Outgoing messages are preprocessed using juice
  * Added installation script for easier setup

## 1.3.0 2016-04-29

  * Added option to use an URL as message source (when message needs to be rendered a POST request with Merge Tags as the POST body is made against that URL)
  * Added option to schedule sending. You can set optional delay time when starting campaign sending. Once this time is reached sending starts automatically
  * Show meaningful MySQL error when connection fails

## 1.2.0 2016-04-25

  * Rewrite merge tags in links (allows using links like `http://example.com/?u=[FIRST_NAME]` in messages)
  * Added view for Imports to list failed addresses
  * Automatic SQL table creation on initial run (no need for the `mysql` command anymore)
  * Automatic SQL table updates on startup
  * Send welcome and unsubscribe confirmation emails for subscribers
  * Added support for GPG encryption for outgoing messages (requires custom field "GPG Key" set up for the list)
  * Added new SMTP option: allow self-signed certs
  * Added new setting: Disable WYSIWG editor (allows better handling of complex HTML templates)
  * Allow downgrading user when server started as root (user is downgraded once all ports are bound)
  * Added Nitrous.io one-click install button for easy try-out
  * Added Max Post Size option to allow larger payloads from bounce webhooks
  * Added VERP support to catch bounces using built in VERP smtp-server (disabled by default)
