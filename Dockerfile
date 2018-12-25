FROM node:10.14-jessie

RUN apt-get update && apt-get install -y pwgen netcat

# First install dependencies
COPY server/package.json /app/server/package.json
COPY client/package.json /app/client/package.json
COPY shared/package.json /app/shared/package.json
COPY zone-mta/package.json /app/zone-mta/package.json

WORKDIR /app/

RUN for idx in client shared server zone-mta; do (cd $idx && npm install); done

# Later, copy the app files. That improves development speed as buiding the Docker image will not have
# to download and install all the NPM dependencies every time there's a change in the source code
COPY . /app

RUN cd client && npm run build

EXPOSE 3000 3003 3004
ENTRYPOINT ["bash", "/app/docker-entrypoint.sh"]
