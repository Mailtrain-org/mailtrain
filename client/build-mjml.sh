#!/bin/sh
set -eu
cd "$(dirname "$0")"
# The pinned MJML submodule only ships a Yarn lock. Keep its npm workspace
# lock here so anonymous npm builds do not modify the upstream submodule.
cp mjml-package-lock.json mjml/package-lock.json
cd mjml
# Its legacy lint peers conflict; lifecycle bootstrap expects Yarn. npm ci
# already links the workspaces, and all compilation is explicit below.
npm ci --ignore-scripts --legacy-peer-deps --no-audit --no-fund
./node_modules/.bin/lerna run build --parallel --ignore mjml-browser --npm-client npm
# MJML's pinned browser bundler is webpack 4 and uses OpenSSL's legacy MD4.
NODE_OPTIONS=--openssl-legacy-provider npm run build --workspace=mjml-browser
