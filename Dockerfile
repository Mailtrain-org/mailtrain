# Mutistaged Node.js Build
FROM mhart/alpine-node as builder

# Install system dependencies
RUN set -ex; \
   apk add --update --no-cache make gcc g++ git

# Copy package.json dependencies
COPY server/package.json /app/server/package.json
COPY server/package-lock.json /app/server/package-lock.json
COPY client/package.json /app/client/package.json
COPY client/package-lock.json /app/client/package-lock.json
COPY shared/package.json /app/shared/package.json
COPY shared/package-lock.json /app/shared/package-lock.json
COPY zone-mta/package.json /app/zone-mta/package.json
COPY zone-mta/package-lock.json /app/zone-mta/package-lock.json

WORKDIR /app/

# Install dependencies in each directory
RUN set -ex; \
   npm install -g modclean \
   && for idx in shared server zone-mta; do (cd $idx && npm install --production); done

# Later, copy the app files. That improves development speed as buiding the Docker image will not have
# to download and install all the NPM dependencies every time there's a change in the source code
COPY . /app

RUN set -ex; \
   cd client \
   && npm install \
   && npm run build

# Final Image
FROM alpine:latest

WORKDIR /app/

EXPOSE 3000 3003 3004
ENTRYPOINT ["bash", "/app/docker-entrypoint.sh"]

# Install system dependencies
RUN set -ex; \
   apk add --update --no-cache pwgen netcat-openbsd bash imagemagick

COPY --from=builder /usr/bin/node /usr/bin/
COPY --from=builder /usr/lib/libgcc* /usr/lib/libstdc* /usr/lib/
COPY --from=builder /app/ /app/
