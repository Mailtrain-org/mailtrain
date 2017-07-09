'use strict';

const _ = require('../lib/translate')._;
const clientHelpers = require('../lib/client-helpers');

const router = require('../lib/router-async').create();

clientHelpers.registerRootRoute(router, _('Report Templates'), 'reportTemplates');

module.exports = router;