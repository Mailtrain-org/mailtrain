FROM node:10.14-jessie

# First install dependencies
COPY ../server/package.json ./app/server
COPY ../client/package.json ./app/client
COPY ../shared/package.json ./app/shared
COPY ../zone-mta/package.json ./app/zone-mta

WORKDIR /app/

ENV NODE_ENV production

RUN for idx in client shared server zone-mta; do (cd $idx && npm install); done

# Later, copy the app files. That improves development speed as buiding the Docker image will not have
# to download and install all the NPM dependencies every time there's a change in the source code
COPY .. /app

RUN cd client && npm run build

EXPOSE 3000
ENTRYPOINT ["bash", "/app/docker/docker-entrypoint.sh"]
