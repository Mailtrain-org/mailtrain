'use strict';

const _ = require('../lib/translate')._;
const clientHelpers = require('../lib/client-helpers');

const router = require('../lib/router-async').create();

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

clientHelpers.registerRootRoute(router, 'account', _('Account'));

module.exports = router;