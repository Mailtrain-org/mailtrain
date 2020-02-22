FROM node:13.8.0-alpine

WORKDIR /app  

COPY package*.json /app/

# --no-cache: download package index on-the-fly, no need to cleanup afterwards
# --virtual: bundle packages, remove whole bundle at once, when done
RUN apk --no-cache --virtual build-dependencies add \
    python \
    make \
    g++ \
    git \
    tzdata \
    && npm install \
    && apk del build-dependencies

ENV TZ=America/Argentina/Buenos_Aires

COPY . /app/

EXPOSE 3001

CMD npm run prod