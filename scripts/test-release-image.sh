#!/usr/bin/env bash
set -euo pipefail

arch="${1:-}"
image="${2:-}"
if [[ ( "$arch" != amd64 && "$arch" != arm64 ) || -z "$image" ]]; then
    echo "Usage: bash scripts/test-release-image.sh {amd64|arm64} IMAGE" >&2
    exit 1
fi

cd "$(dirname "$0")/.."
platform="linux/$arch"
actual="$(docker image inspect --format '{{.Os}}/{{.Architecture}}' "$image")"
if [[ "$actual" != "$platform" ]]; then
    echo "Expected $image to be $platform, found $actual" >&2
    exit 1
fi

docker run --rm --network none --platform "$platform" --entrypoint npm -w /app/server "$image" test
docker run --rm --network none --platform "$platform" --entrypoint npm -w /app/zone-mta "$image" test
export MAILTRAIN_IMAGE="$image"
export MAILTRAIN_PLATFORM="$platform"
npm test --prefix e2e
if [[ "$arch" = amd64 ]]; then
    npm run test:upgrade --prefix e2e
fi
