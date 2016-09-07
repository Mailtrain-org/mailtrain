FROM node:5-slim

ENV MAILTRAIN_HOME /opt/mailtrain

ARG user=mailtrain
ARG group=mailtrain
ARG uid=2000
ARG gid=2000

# mailtrain is run with user `mailtrain`, uid = 2000
# If you bind mount a volume from the host or a data container, 
# ensure you use the same uid
RUN groupadd -g ${gid} ${group} \
    && useradd -d "$MAILTRAIN_HOME" -u ${uid} -g ${gid} -m -s /bin/bash ${user}

WORKDIR $MAILTRAIN_HOME

ADD . .

# FIXES : https://github.com/npm/npm/issues/13306#issuecomment-236876133
RUN cd $(npm root -g)/npm \
&& npm install fs-extra \
&& sed -i -e s/graceful-fs/fs-extra/ -e s/fs.rename/fs.move/ ./lib/utils/rename.js

# Install required node packages
RUN npm install --no-progress --production

RUN chown -R ${user} "$MAILTRAIN_HOME"

USER $user

EXPOSE 3000

ENTRYPOINT ["node", "/opt/mailtrain/index.js"]