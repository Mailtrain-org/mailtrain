# Mailtrain v3

## Run it

The container uses Node 24 LTS. The native `posix` dependency does not compile on Node 26.

Install Docker with Compose v2, then clone v3 including its public submodule:

```sh
git clone --branch v3 --recurse-submodules https://github.com/Mailtrain-org/mailtrain.git
cd mailtrain
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
provider or secrets are needed. CI runs both suites on amd64 on pull requests and
v2/v3 pushes, and also builds arm64 on pushes to v3. Set `E2E_EVIDENCE_DIR` to retain
upgrade SQL snapshots and results locally; these contain disposable fixture data
and should not be published as production backups.

## Building it

1. Install Node.js 24 and npm, plus Python 3, make and a C++ compiler for native dependencies. Mosaico placeholder rendering also needs ImageMagick with the DejaVu-Sans font; the Docker image includes both.

2. Get Mailtrain from git
    ```
    git clone --branch v3 --recurse-submodules https://github.com/Mailtrain-org/mailtrain.git
    cd mailtrain
    git checkout v3
    ```

3. Build the pinned MJML browser dependency and install packages from their lockfiles.
   ```
   sh client/build-mjml.sh
   for dir in client shared server zone-mta; do (cd "$dir" && npm ci); done
   ```

4. Build the client.
   ```
   (cd client && npm run build)
   ```

Alternatively, when doing the development, run `npm run watch` in client. This builds the client, but keeps
watching for changes in client source files. It recompiles the client upon any changes in the sources.

The Docker entrypoint accepts `ENABLED_LANGUAGES` as a comma-separated list of registered language codes,
for example `en-US, de-DE, eu`. If unset, the default enabled languages are used.

## GeoLite2
```
cd server/node_modules/geoip-lite && npm run-script updatedb license_key=YOUR_LICENSE_KEY
```

## License

  **GPL-V3.0**
