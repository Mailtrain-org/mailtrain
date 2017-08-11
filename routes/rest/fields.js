'use strict';

const passport = require('../../lib/passport');
const fields = require('../../models/fields');

const router = require('../../lib/router-async').create();


router.postAsync('/fields-table/:listId', passport.loggedIn, async (req, res) => {
    return res.json(await fields.listDTAjax(req.context, req.params.listId, req.body));
});

router.getAsync('/fields/:listId/:fieldId', passport.loggedIn, async (req, res) => {
    const entity = await fields.getById(req.context, req.params.listId, req.params.fieldId);
    entity.hash = fields.hash(entity);
    return res.json(entity);
});

router.getAsync('/fields/:listId', passport.loggedIn, async (req, res) => {
    const rows = await fields.list(req.context, req.params.listId);
    return res.json(rows);
});

router.postAsync('/fields/:listId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    await fields.create(req.context, req.params.listId, req.body);
    return res.json();
});

router.putAsync('/fields/:listId/:fieldId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    const entity = req.body;
    entity.id = parseInt(req.params.fieldId);

    await fields.updateWithConsistencyCheck(req.context, req.params.listId, entity);
    return res.json();
});

router.deleteAsync('/fields/:listId/:fieldId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    await fields.remove(req.context, req.params.listId, req.params.fieldId);
    return res.json();
});

router.postAsync('/fields-validate/:listId', passport.loggedIn, async (req, res) => {
    return res.json(await fields.serverValidate(req.context, req.params.listId, req.body));
});


module.exports = router;