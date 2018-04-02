'use strict';

const passport = require('../../lib/passport');
const mosaicoTemplates = require('../../models/mosaico-templates');

const router = require('../../lib/router-async').create();


router.getAsync('/mosaico-templates/:mosaicoTemplateId', passport.loggedIn, async (req, res) => {
    const mosaicoTemplate = await mosaicoTemplates.getById(req.context, req.params.mosaicoTemplateId);
    mosaicoTemplate.hash = mosaicoTemplates.hash(mosaicoTemplate);
    return res.json(mosaicoTemplate);
});

router.postAsync('/mosaico-templates', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    return res.json(await mosaicoTemplates.create(req.context, req.body));
});

router.putAsync('/mosaico-templates/:mosaicoTemplateId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    const mosaicoTemplate = req.body;
    mosaicoTemplate.id = parseInt(req.params.mosaicoTemplateId);

    await mosaicoTemplates.updateWithConsistencyCheck(req.context, mosaicoTemplate);
    return res.json();
});

router.deleteAsync('/mosaico-templates/:mosaicoTemplateId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    await mosaicoTemplates.remove(req.context, req.params.mosaicoTemplateId);
    return res.json();
});

router.postAsync('/mosaico-templates-table', passport.loggedIn, async (req, res) => {
    return res.json(await mosaicoTemplates.listDTAjax(req.context, req.body));
});

module.exports = router;