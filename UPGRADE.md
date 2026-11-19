# Upgrade to Mailtrain v3

Test the upgrade on an offline copy first. Keep the database, uploaded files,
configuration and the v2 application/image together as a restorable backup.
MySQL/MariaDB schema changes are not transactional. Restoring that backup is the
recovery path; Knex rollback does not restore v2.

## Supported data

v3 keeps lists, subscribers, custom fields, nested segments, imports, namespaces,
users, send configurations, personal API tokens, channels, regular campaigns
(including sent and scheduled campaigns), and templates using `codeeditor`,
`mosaico` or `mosaicoWithFsTemplate`. Retain the corresponding files in
`server/files`, custom filesystem Mosaico templates, and any deployment-specific
static assets. The external v2 token API is disabled in v3: preserving its tokens
does not make old API integrations work. Installations needing that API should
stay on v2 until their integrations have a supported replacement.

## Records from retired features

Open **Archived v2 records** from **Global settings** as an administrator.
The archive preserves the original fields, IDs and relationships for GrapesJS
and CKEditor templates, RSS and triggered campaigns, report templates and
reports, and trigger and queue records. Archived reports show their saved
definition and parameters. A legacy template's rendered HTML also opens in the
code editor, with its original editor data available in the archive.

Retired campaign types and remote-source campaigns remain inactive. Their
original schedules are preserved in the archive. Pending triggered sends are
archived and removed from the active queue. Sent history for those campaigns
stays attached to the original campaign ID. Regular campaign schedules and
delivery history carry forward. Keep the v2 backup if you need the old editors,
automations or report execution.

## Roles and permissions

Existing role identities defined by the active v3 configuration are preserved,
including custom roles named `master`, `nobody` or `campaignsAdmin`. As in v2,
user id 1 is assigned the configured administrator role during permission
rebuilds; non-id-1 custom users retain their defined role identities. v3's existing
`campaignsAdmin` role remains `campaignsAdmin`; namespace shares are not rewritten
to `campaignsAdminWithReshare`. Tomas's v3 policy removes some legacy resharing
rights. Granting the new reshare role is a separate administrator decision, not
an upgrade side effect. In particular, the upgrade does not grant campaign
administrators permission to share send configurations.

With the default role set, undefined v2 `master` maps to the administrator role
`globalMaster`; undefined `nobody` and `campaignsAdminWithoutNamespace` map to
`none`. These conversions require present, safe targets: an administrator for
`globalMaster`, and no automatic namespace or global authority for `none`.
Explicit shares remain in place. A complete `roles` override disables these
implicit conversions. Define any missing global and entity-share roles in the
v3 configuration before upgrading; admission reports the affected users/shares.
Review extensions under `defaultRoles` as well. A custom target is not permission
to elevate a previously unprivileged account.

## Procedure

1. Finish all v2 migrations using v2. Stop every v2 application and worker that
   writes to this database, including schedulers and importers. Keep SMTP delivery
   disabled while testing a copy so scheduled campaigns cannot reach recipients.
2. Back up the whole database (including `knex_migrations` and its lock table)
   using the database server's supported dump/snapshot procedure. Back up the
   uploaded-file volume, custom templates/static assets and configuration at the
   same stopped point. Verify that the backups can be restored into a disposable
   installation. Do not combine a database-engine major upgrade with this change.
3. Build the v3 checkout with its pinned submodule (`git submodule update --init
   --recursive`). Follow README for Node/Docker prerequisites. Adapt the v2
   configuration against `server/config/default.yaml`, especially roles, URL bases,
   authentication and sending. Preserve secrets in the deployment's configuration.
4. Point the new deployment at the existing SQL database and file volume. Compose
   project names determine default volume names; explicitly bind the old volumes
   rather than accidentally creating empty ones. The trusted, sandbox and public
   URL bases must match their exposed ports and external URLs.
5. The v3 container runs as UID/GID **1000:1000**. v2's image may have created
   root-owned uploads/import directories. With the application stopped, change
   ownership of the copied `server/files` volume to `1000:1000` using a one-off
   root container or the host's normal volume administration. Preserve all file
   bytes and paths, and verify hashes against the backup. Do not run the v3
   application as root to bypass this step.
6. Start v3. It performs read-only admission, keeps completed v2 migration rows
   with their original ids/batches/timestamps, and then lets Knex lock and run the
   pending v3 migrations. Fresh empty databases are initialized automatically.
   Existing account passwords and tokens are preserved; `ADMIN_PASSWORD` and
   `ADMIN_ACCESS_TOKEN` only bootstrap an empty installation.
7. Log in as the administrator and representative non-administrator users. Check
   lists/fields/segments, both editors, sent statistics, future schedules,
   permissions, imports/exports and uploaded files. Exercise public subscription
   and unsubscribe links through the public URL. Test delivery through an isolated
   SMTP catcher before enabling production sending.
8. Retain the stopped v2 deployment and full backup until validation is complete.
   To recover after a successful or partly failed migration, stop v3 and restore
   both SQL and files/configuration from the matching backup before starting v2.
   Never run v2 against a database that v3 has already changed.

The migration CLI (`cd server && node node_modules/knex/bin/cli.js --knexfile
setup/knex/knexfile.js migrate:latest`) uses the same admission and history source
as startup. It expects the existing database and the same production configuration.
Direct execution of the v2-to-v3 migration also checks compatibility before its
first write. Do not use rollback as an upgrade recovery procedure.

## Verification

`npm test --prefix e2e` tests a fresh install, real SMTP delivery, browser behavior
and restart persistence. `npm run test:upgrade --prefix e2e` creates the supported
fixture using the July 2021 amd64 v2 image pinned at
`mailtrain/mailtrain@sha256:6a956970c81a20274198cb31237260382f33fe503ec3981e9cac5ae581bcaab1`,
then upgrades its database and file volumes. Upgrade fixtures verify archival access and confirm that retired campaign and
queue records remain inactive. An incomplete v2 fixture must be rejected without
changing schema, rows or history. Role checks include real logins and denials. These disposable fixtures are regression
coverage, not a substitute for testing a copy of a production deployment.

---

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

6. If there are lists that contain birthday or date fields that were created before
   commit `bc73a0df0cab9943d726bd12fc1c6f2ff1279aa7` (on Jan 3, 2018), they still have TIMESTAMP data type in DB instead
   of DATETIME. The problem was that that commit did not introduce migration from TIMESTAMP to DATETIME.
   Mailtrain v2 does this migration, however in some corner cases, this may shift the date by a day back or forth.
