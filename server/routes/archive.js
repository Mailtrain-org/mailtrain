'use strict';

const crypto = require('crypto');
const router = require('../lib/router-async').create();
const messageSender = require('../lib/message-sender');


router.get('/:campaign/:list/:subscription', (req, res, next) => {
    messageSender.getMessage(req.params.campaign, req.params.list, req.params.subscription)
        .then(result => {
            const {html} = result;
            const scriptNonce = crypto.randomBytes(16).toString('hex');

            // Only the tracking script added by Mailtrain may run in the archive.
            res.set('Content-Security-Policy', `script-src 'nonce-${scriptNonce}' 'strict-dynamic'; object-src 'none'; base-uri 'none'`);

            if (html.match(/<\/body\b/i)) {
                res.render('partials/tracking-scripts', {
                    layout: 'archive/layout-raw',
                    scriptNonce
                }, (err, scripts) => {
                    if (err) {
                        return next(err);
                    }
                    const htmlWithScripts = scripts ? html.replace(/<\/body\b/i, match => scripts + match) : html;

                    res.render('archive/view', {
                        layout: 'archive/layout-raw',
                        message: htmlWithScripts
                    });
                });

            } else {
                res.render('archive/view', {
                    layout: 'archive/layout-wrapped',
                    message: html,
                    scriptNonce
                });
            }

        })
        .catch(err => next(err));
});

module.exports = router;
