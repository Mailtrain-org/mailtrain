Note that some of these may be already obsolete...


### Fix deprecations
- npm WARN deprecated crypto@1.0.1: This package is no longer supported. It's now a built-in Node module. If you've depended on crypto, you should switch to the one that's built-in.
- npm WARN deprecated @types/form-data@2.5.0: This is a stub types definition. form-data provides its own type definitions, so you do not need this installed.
- npm WARN deprecated natives@1.1.6: This module relies on Node.js's internals and will break at some point. Do not use it, and update to graceful-fs@4.x.
- npm WARN deprecated har-validator@5.1.5: this library is no longer supported
- npm WARN deprecated feedparser-promised@2.0.1: This library is now deprecated. Please use node-parser instead.
- npm WARN deprecated graceful-fs@1.1.14: please upgrade to graceful-fs 4 for compatibility with current and future versions of Node.js
- npm WARN deprecated bcrypt-nodejs@0.0.3: bcrypt-nodejs is no longer actively maintained. Please use bcrypt or bcryptjs. See https://github.com/kelektiv/node.bcrypt.js/wiki/bcrypt-vs-brypt.js to learn more about these two options
- npm WARN deprecated uuid@3.4.0: Please upgrade  to version 7 or higher.  Older versions may use Math.random() in certain circumstances, which is known to be problematic.  See https://v8.dev/blog/math-random for details.
- npm WARN deprecated uuid@3.4.0: Please upgrade  to version 7 or higher.  Older versions may use Math.random() in certain circumstances, which is known to be problematic.  See https://v8.dev/blog/math-random for details.
- npm WARN deprecated request@2.88.0: request has been deprecated, see https://github.com/request/request/issues/3142
- npm WARN deprecated request@2.88.2: request has been deprecated, see https://github.com/request/request/issues/3142


### Front page
- Some dashboard

### Campaigns
- List of sent RSS campaigns (?)

### Pull requests
- Support ldaps://  - 5325f2ea7864ce5f42a9a6df3408af7ffbd32591
- Support https - abd788d8f4d18b5a977226ba1224cba7f2b7fa9b
- Support warn of failed login - 4bd1e994b27420ba366d9b0429e9014e5bf01f13
- Add X-Mailer header option in settings to override or disable it - 44fe8882b876bdfd9990110496d16f819dc64ac3
- Add custom unsubscribe option in a campaign - 68cb8384f7dfdbcaf2932293ec5a2f1ec0a1554e

### API
- Add API extensions

### GDPR
- Refuse editing subscriptions which have been anonymized
- Add field to subscriptions which says till when the consent has been given
- Provide a link (and merge tag) that will update the consent date to now
- Add campaign trigger that triggers if the consent for specific subscription field is about to expire (i.e. it is greater than now - seconds)

### RSS Campaigns
- Aggregated RSS campaigns