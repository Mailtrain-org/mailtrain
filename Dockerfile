FROM node:10.13.0-alpine

WORKDIR /app  

COPY package*.json /app/

RUN apk add --no-cache tzdata
ENV TZ=America/Argentina/Buenos_Aires

# Later, copy the app files. That improves development speed as buiding the Docker image will not have 
# to download and install all the NPM dependencies every time there's a change in the source code
ENV NODE_ENV production
RUN npm install --no-progress --production && npm install --no-progress passport-ldapjs passport-ldapauth

COPY . /app/

EXPOSE 3000

CMD npm run start