# Mutistaged Node.js Build
FROM node:10-alpine as builder

# Install system dependencies
RUN set -ex; \
    apk add --update --no-cache \
    make gcc g++ git python

# Copy package.json dependencies
COPY server/package.json /app/server/package.json
COPY server/package-lock.json /app/server/package-lock.json
COPY client/package.json /app/client/package.json
COPY client/package-lock.json /app/client/package-lock.json
COPY shared/package.json /app/shared/package.json
COPY shared/package-lock.json /app/shared/package-lock.json
COPY zone-mta/package.json /app/zone-mta/package.json
COPY zone-mta/package-lock.json /app/zone-mta/package-lock.json

# Install dependencies in each directory
RUN cd /app/client && npm install
RUN cd /app/shared && npm install --production
RUN cd /app/server && npm install --production
RUN cd /app/zone-mta && npm install --production

# Later, copy the app files. That improves development speed as buiding the Docker image will not have
# to download and install all the NPM dependencies every time there's a change in the source code
COPY . /app

RUN set -ex; \
   cd /app/client && \
   npm run build && \
   rm -rf node_modules

# Final Image
FROM node:10-alpine

WORKDIR /app/

# Install system dependencies
RUN set -ex; \
    apk add --update --no-cache \
    pwgen netcat-openbsd bash imagemagick

COPY --from=builder /app/ /app/

EXPOSE 3000 3003 3004
ENTRYPOINT ["bash", "/app/docker-entrypoint.sh"]
