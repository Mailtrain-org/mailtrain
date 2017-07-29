'use strict';

const passport = require('../../lib/passport');
const forms = require('../../models/forms');

const router = require('../../lib/router-async').create();


router.postAsync('/forms-table', passport.loggedIn, async (req, res) => {
    return res.json(await forms.listDTAjax(req.context, req.body));
});

router.getAsync('/forms/:formId', passport.loggedIn, async (req, res) => {
    const entity = await forms.getById(req.context, req.params.formId);
    entity.hash = forms.hash(entity);
    return res.json(entity);
});

router.postAsync('/forms', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    await forms.create(req.context, req.body);
    return res.json();
});

router.putAsync('/forms/:formId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    const entity = req.body;
    entity.id = parseInt(req.params.formId);

    await forms.updateWithConsistencyCheck(req.context, entity);
    return res.json();
});

router.deleteAsync('/forms/:formId', passport.loggedIn, passport.csrfProtection, async (req, res) => {
    await forms.remove(req.context, req.params.formId);
    return res.json();
});

router.postAsync('/forms-validate', passport.loggedIn, async (req, res) => {
    return res.json(await forms.serverValidate(req.context, req.body));
});


module.exports = router;