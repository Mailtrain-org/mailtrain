FROM node:8.1

COPY . /app
WORKDIR /app/
ENV NODE_ENV docker
RUN npm install --no-progress --production && npm install --no-progress passport-ldapjs
EXPOSE 3000
CMD ["node", "index.js"]