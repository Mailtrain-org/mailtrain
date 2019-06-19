'use strict';

const passport = require('../../lib/passport');
const fields = require('../../models/fields');

const router = require('../../lib/router-async').create();
const {castToInteger} = require('../../lib/helpers');


router.postAsync('/fields-table/:listId', passport.loggedIn, async (req, res) => {
    return res.json(await fields.listDTAjax(req.context, castToInteger(req.params.listId), req.body));
});

router.postAsync('/fields-grouped-table/:listId', passport.loggedIn, async (req, res) => {
    return res.json(await fields.listGroupedDTAjax(req.context, castToInteger(req.params.listId), req.body));
});

router.getAsync('/fields/:listId/:fieldId', passport.loggedIn, async (req, res) => {
    const entity = await fields.getById(req.context, castToInteger(req.params.listId), castToInteger(req.params.fieldId));
    entity.hash = fields.hash(entity);
    return res.json(entity);
});

router.getAsync('/fields/:listId', passport.loggedIn, async (req, res) => {
    const rows = await fields.list(req.context, castToInteger(req.params.listId));
    return res.json(rows);
});

router.getAsync('/fields-grouped/:listId', passport.loggedIn, async (req, res) => {
    const rows = await fields.listGrouped(req.context, castToInteger(req.params.listId));
    return res.json(rows);
});

router.postAsync('/fields/:listId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    return res.json(await fields.create(req.context, castToInteger(req.params.listId), req.body));
});

router.putAsync('/fields/:listId/:fieldId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    const entity = req.body;
    entity.id = castToInteger(req.params.fieldId);

    await fields.updateWithConsistencyCheck(req.context, castToInteger(req.params.listId), entity);
    return res.json();
});

router.deleteAsync('/fields/:listId/:fieldId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    await fields.remove(req.context, castToInteger(req.params.listId), castToInteger(req.params.fieldId));
    return res.json();
});

router.postAsync('/fields-validate/:listId', passport.loggedIn, async (req, res) => {
    return res.json(await fields.serverValidate(req.context, castToInteger(req.params.listId), req.body));
});


module.exports = router;