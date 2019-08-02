'use strict';

const log = require('../lib/log');
const config = require('../lib/config');
const router = require('../lib/router-async').create();
const links = require('../models/links');
const interoperableErrors = require('../../shared/interoperable-errors');

const trackImg = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

router.getAsync('/:campaign/:list/:subscription/:link', async (req, res) => {
    const link = await links.resolve(req.params.link);

    if (link) {
        // In Mailtrain v1 we would do the URL expansion here based on merge tags. We don't do it here anymore. Instead, the URLs are expanded when message is sent out (in links.updateLinks)
        res.redirect(302, link.url);

        await links.countLink(req.ip, req.headers['user-agent'], req.params.campaign, req.params.list, req.params.subscription, link.id);

    } else {
        log.error('Redirect', 'Unresolved URL: <%s>', req.url);
        throw new interoperableErrors.NotFoundError('Oops, we couldn\'t find a link for the URL you clicked');
    }
});

router.getAsync('/:campaign/:list/:subscription', async (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'image/gif',
        'Content-Length': trackImg.length
    });

    res.end(trackImg);

    await links.countLink(req.ip, req.headers['user-agent'], req.params.campaign, req.params.list, req.params.subscription, links.LinkId.OPEN);
});


module.exports = router;
