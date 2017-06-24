FROM node:8.1

# First install dependencies
COPY ./package.json ./app/
WORKDIR /app/
ENV NODE_ENV production
RUN npm install --no-progress --production && npm install --no-progress passport-ldapjs
# Later, copy the app files. That improves development speed as buiding the Docker image will not have 
# to download and install all the NPM dependencies every time there's a change in the source code
COPY . /app
EXPOSE 3000
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "index.js"]