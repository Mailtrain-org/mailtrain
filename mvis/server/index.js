'use strict';

require('./extensions-common');
const em = require('../ivis-core/server/lib/extension-manager');

const path = require('path');

em.set('app.clientDist', path.join(__dirname, '..', 'client', 'dist'));

em.on('knex.migrate', async () => {
    const knex = require('../ivis-core/server/lib/knex');
    await knex.migrateExtension('mvis', './knex/migrations').latest();
});

em.on('app.installAPIRoutes', app => {
    const embedApi = require('./routes/api/embed');
    app.use('/api', embedApi);

    const eventsApi = require('./routes/api/events');
    app.use('/api', eventsApi);
});

require('../ivis-core/server/index');

