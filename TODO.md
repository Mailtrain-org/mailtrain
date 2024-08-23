Note that some of these may be already obsolete...

## Current - blockers
- Attached images should not show up in the attachments - implemented, needs to be tested
- create a namespace master that can create users and edit send configurations
  - make sure that the users cannot be given global master roles
- refresh localization

## Current - low-priority
- Add API
- Some dashboard
- Simplify import


## Possibly obsolete

### Pull requests
- Support ldaps://  - 5325f2ea7864ce5f42a9a6df3408af7ffbd32591
- Support https - abd788d8f4d18b5a977226ba1224cba7f2b7fa9b
- Support warn of failed login - 4bd1e994b27420ba366d9b0429e9014e5bf01f13
- Add X-Mailer header option in settings to override or disable it - 44fe8882b876bdfd9990110496d16f819dc64ac3
- Add custom unsubscribe option in a campaign - 68cb8384f7dfdbcaf2932293ec5a2f1ec0a1554e

### GDPR
- Refuse editing subscriptions which have been anonymized
- Add field to subscriptions which says till when the consent has been given
- Provide a link (and merge tag) that will update the consent date to now
