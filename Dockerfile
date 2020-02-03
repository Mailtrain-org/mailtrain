FROM node:10.13.0-alpine

WORKDIR /app  

COPY package*.json /app/

RUN apk add --no-cache tzdata
RUN apk add git
ENV TZ=America/Argentina/Buenos_Aires

RUN npm install -f
RUN npm install posix --save

COPY . /app/

EXPOSE 3000  

CMD npm run start