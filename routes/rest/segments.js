'use strict';

const passport = require('../../lib/passport');
const segments = require('../../models/segments');

const router = require('../../lib/router-async').create();


router.postAsync('/segments-table/:listId', passport.loggedIn, async (req, res) => {
    return res.json(await segments.listDTAjax(req.context, req.params.listId, req.body));
});

router.getAsync('/segments/:listId', passport.loggedIn, async (req, res) => {
    return res.json(await segments.listIdName(req.context, req.params.listId));
});

router.getAsync('/segments/:listId/:segmentId', passport.loggedIn, async (req, res) => {
    const segment = await segments.getById(req.context, req.params.listId, req.params.segmentId);
    segment.hash = segments.hash(segment);
    return res.json(segment);
});

router.postAsync('/segments/:listId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    await segments.create(req.context, req.params.listId, req.body);
    return res.json();
});

router.putAsync('/segments/:listId/:segmentId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    const entity = req.body;
    entity.id = parseInt(req.params.segmentId);

    await segments.updateWithConsistencyCheck(req.context, req.params.listId, entity);
    return res.json();
});

router.deleteAsync('/segments/:listId/:segmentId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    await segments.remove(req.context, req.params.listId, req.params.segmentId);
    return res.json();
});


module.exports = router;