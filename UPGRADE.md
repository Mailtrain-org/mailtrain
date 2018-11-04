## Migration from Mailtrain v1 to Mailtrain v2

The migration should happen almost automatically. There are however the following caveats:

1. Structure of config files (under `config`) has changed at many places. Revisit the default config (`config/default.toml`)
   and update your configs accordingly.

2. Images uploaded in a template editor (Mosaico, Grapesjs, etc.) need to be manually moved to a new destination (under `client`).
   For Mosaico, this means to move folders named by a number from `public/mosaico` to `client/static/mosaico`.

3. Directory for custom Mosaico templates has changed from `public/mosaico/templates` to `client/static/mosaico/templates`.

4. Imports are not migrated. If you have any pending imports, complete them before migration to v2.

5. Zone MTA configuration endpoint (webhooks/zone-mta/sender-config) has changed. The send-configuration CID has to be
   part of the URL - e.g. webhooks/zone-mta/sender-config/system.