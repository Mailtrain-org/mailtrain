FROM centos
RUN curl --silent --location https://rpm.nodesource.com/setup_7.x | bash -
RUN yum install -y git make gcc nodejs ImageMagick && yum clean all
COPY . /app
WORKDIR /app/
ENV NODE_ENV production
RUN npm install --no-progress --production && npm install --no-progress passport-ldapjs
EXPOSE 3000
CMD ["/usr/bin/node", "index.js"]