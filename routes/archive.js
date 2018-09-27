'use strict';

const router = require('../lib/router-async').create();
const CampaignSender = require('../lib/campaign-sender');


router.get('/:campaign/:list/:subscription', (req, res, next) => {
    const cs = new CampaignSender();
    cs.init({campaignCid: req.params.campaign})
        .then(() => cs.getMessage(req.params.list, req.params.subscription))
        .then(result => {
            const {html} = result;

            if (html.match(/<\/body\b/i)) {
                res.render('partials/tracking-scripts', {
                    layout: 'archive/layout-raw'
                }, (err, scripts) => {
                    console.log(scripts);
                    console.log(err);
                    if (err) {
                        return next(err);
                    }
                    html = scripts ? html.replace(/<\/body\b/i, match => scripts + match) : html;

                    res.render('archive/view', {
                        layout: 'archive/layout-raw',
                        message: html
                    });
                });

            } else {
                res.render('archive/view', {
                    layout: 'archive/layout-wrapped',
                    message: html
                });
            }

        })
        .catch(err => next(err));
});

module.exports = router;
