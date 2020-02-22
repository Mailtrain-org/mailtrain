FROM node:13.8.0-alpine

WORKDIR /app  

COPY package*.json /app/

RUN apk add update || : && apk add install python -y

RUN apk add --no-cache tzdata
RUN apk add git
ENV TZ=America/Argentina/Buenos_Aires

RUN npm install --prod -f

COPY . /app/

EXPOSE 3001

CMD npm run prod