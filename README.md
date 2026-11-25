# Mailtrain v3

Test Mailtrain **3.0.0-rc.2** upgrades on a copy. Read [UPGRADE.md](UPGRADE.md)
for the procedure and the legacy records available in the archive.
[RELEASING.md](RELEASING.md) covers release preparation.

## Install with Docker

Docker Engine/Desktop with Compose v2 supports both `linux/amd64` and
`linux/arm64`. Once the release is published, use its pinned version:

```sh
git clone --branch v3.0.0-rc.2 --recurse-submodules https://github.com/Mailtrain-org/mailtrain.git
cd mailtrain
export MAILTRAIN_IMAGE=mailtrain/mailtrain:3.0.0-rc.2
docker compose pull mysql redis mailtrain
docker compose up -d --no-build --wait
```

The RC never updates `latest`. Keep the explicit version in deployment
configuration. The Compose file includes a source build, so `--no-build` selects
the pulled release artifact. For a local build of a reviewed checkout, follow
"Run the source with Docker" below. Existing v2 installations must follow the
upgrade procedure before attaching their data.

## Run the source with Docker

The container uses Node 24 LTS. The native `posix` dependency does not compile on Node 26.

Install Docker with Compose v2, then clone v3 including its public submodule:

```sh
git clone --branch v3 --recurse-submodules https://github.com/Mailtrain-org/mailtrain.git
cd mailtrain
unset MAILTRAIN_IMAGE
docker compose up --build
```

Open <http://localhost:3000> and sign in as **admin**, password **test**.
Change the password in your account before using real subscriber data. Set
`ADMIN_PASSWORD` before the first startup to choose another initial password;
restarts preserve account changes. Initialization and the first build can take
several minutes. `docker compose ps` shows when Mailtrain is healthy.

This builds the checkout on Node 24 and starts MariaDB and Redis. Data and uploaded
files persist in Compose volumes. Stop with `docker compose down`; add `--volumes`
only to discard this installation's data. After pulling source changes, run
`git submodule update --init --recursive` and `docker compose up --build` again.

The trusted UI, editor sandbox and public subscription pages use separate ports
3000, 3003 and 3004, bound to localhost. For another hostname or a reverse proxy,
set `URL_BASE_TRUSTED`, `URL_BASE_SANDBOX` and `URL_BASE_PUBLIC` to their externally
reachable URLs. To change published ports, set `PORT_TRUSTED`, `PORT_SANDBOX` and
`PORT_PUBLIC` and update the corresponding URL bases too. The sandbox must have a
separate origin. For custom server configuration, mount a readable
`/app/server/config/production.yaml`; the entrypoint preserves an existing file.

Sending requires an SMTP provider: create a send configuration in Administration,
then select it for your list and campaign. MongoDB is only needed for builtin
ZoneMTA. To enable it, use
`WITH_ZONE_MTA=true docker compose --profile builtin-mta up --build`, then select
the builtin ZoneMTA transport in a send configuration. LDAP and CAS adapters are
locked optional production dependencies installed at image build time; startup
never downloads packages. Their existing `WITH_LDAP` / `WITH_CAS` environment
settings remain available when running the image or using a Compose override.

To run the isolated browser and upgrade tests (Docker and Node 24 required):

```sh
docker compose build
npm ci --prefix e2e
export PLAYWRIGHT_BROWSERS_PATH=/tmp/mailtrain-e2e-browsers
node e2e/node_modules/playwright/cli.js install chromium
npm test --prefix e2e
npm run test:upgrade --prefix e2e
```

The tests use the built `mailtrain-local:v3` image (or `MAILTRAIN_IMAGE`) and choose
free local ports. Set `MAILTRAIN_PLATFORM=linux/arm64` for a locally built arm64
image; the upgrade test always starts the pinned 2021 v2 image as amd64.
On Linux, Playwright's `install --with-deps chromium` also installs browser system
libraries.

The fresh-install test first checks exactly one smoke campaign message in a local
Mailpit catcher, including its recipient, subject and public unsubscribe link.
It then exercises the v3 browser areas, both editors, real segment drags, imports,
exports, public subscriptions and dirty navigation, and checks restart persistence.
The upgrade test creates supported data through the pinned v2 image's REST and
browser interfaces, upgrades the same database/file volumes, and checks independent
legacy archive, incomplete-history and role fixtures against MariaDB. See [UPGRADE.md](UPGRADE.md)
before upgrading an existing deployment.

Each test removes its own Compose project and volumes on exit. No external SMTP
provider or secrets are needed. v3 CI runs both suites on amd64 for pull requests
and pushes. Pushes to v3 also build arm64. v2 uses a separate Node 10 compatibility
check. Set `E2E_EVIDENCE_DIR` to retain
upgrade SQL snapshots and results locally; these contain disposable fixture data
and should not be published as production backups.

## Install and run from source

Use Node.js **24** and its npm on Linux, Git, Python 3, make and a C++ compiler
for native dependencies. Install ImageMagick and the DejaVu-Sans font (Debian:
`imagemagick fonts-dejavu-core`). Provision MariaDB 11.4 and Redis 7, reachable
from the host. The Compose database defaults are private to its Docker network;
source processes need host-reachable services. MongoDB is unnecessary when
`builtinZoneMTA.enabled` is false; select an external SMTP provider instead.

After publication, clone the release with its pinned submodule, then build:

```sh
git clone --branch v3.0.0-rc.2 --recurse-submodules https://github.com/Mailtrain-org/mailtrain.git
cd mailtrain
sh client/build-mjml.sh
for dir in shared client server zone-mta; do (cd "$dir" && npm ci); done
(cd client && npm run build)
```

Create an empty `mailtrain` SQL database and a dedicated user with privileges
on that database, including schema migrations. Do not use the root database
account. Write `server/config/production.json` with your database credentials,
Redis address, URL bases and a random session secret. For a local installation
with services on the default localhost ports, this creates the file once:

```sh
node <<'NODE'
const fs = require('node:fs');
const crypto = require('node:crypto');
fs.writeFileSync('server/config/production.json', JSON.stringify({
    mysql: {host: '127.0.0.1', port: 3306, database: 'mailtrain', user: 'mailtrain', password: 'replace-with-database-password'},
    redis: {enabled: true, host: '127.0.0.1', port: 6379},
    builtinZoneMTA: {enabled: false},
    www: {
        host: '127.0.0.1', secret: crypto.randomBytes(32).toString('hex'),
        trustedUrlBase: 'http://localhost:3000',
        sandboxUrlBase: 'http://localhost:3003',
        publicUrlBase: 'http://localhost:3004'
    }
}, null, 2), {flag: 'wx', mode: 0o600});
NODE
```

Replace the sample SQL password before starting. Keep the configuration and
`server/files` writable by the service user and retain both with database backups.
Use one production configuration file; adapt other settings against
`server/config/default.yaml`. For a new installation only, initialize an admin
password, then start the server:

```sh
cd server
NODE_ENV=production node setup/docker-entrypoint-db-setup.js 'replace-with-initial-password' ''
NODE_ENV=production node index.js
```

Open <http://localhost:3000> and sign in as `admin` with that password. The server
runs in the foreground; stop with Ctrl-C. A service manager must use the same
`server` working directory, production environment, configuration and file paths.
Initialization is automatic on startup too; without the explicit bootstrap the
fresh-database login is `admin` / `test`. Existing account credentials survive
startup. Run `npm test --prefix server` and `npm test --prefix zone-mta` from the
repository root for regression checks.

For development, run `npm run watch --prefix client` in a second terminal. The
Docker entrypoint accepts `ENABLED_LANGUAGES` as a comma-separated list of registered
codes, for example `en-US, de-DE, eu`; source installs use `enabledLanguages` in
their production configuration.

## Webhook verification

Configure the callbacks used by your sending providers under `webhooks` in
`server/config/production.yaml` (`/app/server/config/production.yaml` in Docker).
Keep shared secrets in that deployment's configuration and use HTTPS on all
public callback URLs. Restart Mailtrain after changing the settings.

| Provider | Mailtrain setting | Provider configuration |
| --- | --- | --- |
| Amazon SES via SNS | `awsTopicArns` | List the exact SNS topic ARNs for this installation. Mailtrain always verifies the SNS signature. An empty list accepts any correctly signed SNS topic. |
| SparkPost | `sparkpostToken` | Send the matching secret in the `X-Mailtrain-Webhook-Token` custom header. |
| SendGrid | `sendgridPublicKey` | Enable Signed Event Webhook and paste the base64 verification key without PEM headers. |
| Mailgun | `mailgunSigningKey` | Use the HTTP webhook signing key for legacy events. |
| ZoneMTA | `zoneMtaToken` | For an external ZoneMTA configure HTTP Basic credentials with username `mailtrain` and the matching secret as password. The builtin ZoneMTA uses this setting automatically for bounce callbacks. |
| Postal | `postalPublicKey` | Paste the signing public key as a PEM block. |

For providers other than SNS, leaving the listed key or token empty leaves
verification disabled for that provider. Set the key or token on both sides
before exposing a callback. Verify delivery and bounce handling using a test list
before switching a production integration.

## GeoLite2
```
cd server/node_modules/geoip-lite && npm run-script updatedb license_key=YOUR_LICENSE_KEY
```

## License

  **GPL-V3.0**
