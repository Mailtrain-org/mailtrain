## Migration from Mailtrain v1 to Mailtrain v2

The migration should almost happen automatically. There are however the following caveats:

1. Structure of config files (under `config`) has changed at many places. Revisit the default config (`config/default.toml`)
   and update your configs accordingly.

2. Images uploaded in a template editor (Mosaico, GrapeJS, etc.) need to be manually moved to a new destination (under `client`).
   For Mosaico, this means to move folders named by a number from `public/mosaico` to `client/static/mosaico`.

3. Directory for custom Mosaico templates has changed from `public/mosaico/templates` to `client/static/mosaico/templates`.

4. Imports are not migrated. If you have any pending imports, complete them before migration to v2.