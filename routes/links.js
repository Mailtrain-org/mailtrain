'use strict';

const log = require('npmlog');
const config = require('config');
const router = require('../lib/router-async').create();
const links = require('../models/links');
const interoperableErrors = require('../shared/interoperable-errors');

const trackImg = new Buffer('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

router.getAsync('/:campaign/:list/:subscription', async (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'image/gif',
        'Content-Length': trackImg.length
    });

    await links.countLink(req.ip, req.headers['user-agent'], req.params.campaign, req.params.list, req.params.subscription, links.LinkId.OPEN);

    res.end(trackImg);
});


router.getAsync('/:campaign/:list/:subscription/:link', async (req, res) => {
    const link = await links.resolve(req.params.link);

    if (link) {
        await links.countLink(req.ip, req.headers['user-agent'], req.params.campaign, req.params.list, req.params.subscription, link.id);

        // In Mailtrain v1 we would do the URL expansion here based on merge tags. We don't do it here anymore. Instead, the URLs are expanded when message is sent out (in links.updateLinks)
        return res.redirect(url);
    } else {
        log.error('Redirect', 'Unresolved URL: <%s>', req.url);
        throw new interoperableErrors.NotFoundError('Oops, we couldn\'t find a link for the URL you clicked');
    }
});

module.exports = router;
