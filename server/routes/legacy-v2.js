'use strict';

const {archiveTable, canViewArchive} = require('../lib/legacy-v2');
const knex = require('../lib/knex');
const passport = require('../lib/passport');
const {getTrustedUrl} = require('../lib/urls');
const {NotFoundError, PermissionDeniedError} = require('../../shared/interoperable-errors');

const router = require('../lib/router-async').create();

router.use(passport.loggedIn, (req, res, next) => {
    if (!canViewArchive(req.context)) {
        return next(new PermissionDeniedError());
    }
    res.set('Cache-Control', 'no-store');
    res.locals.settingsUrl = getTrustedUrl('settings');
    res.locals.archiveUrl = getTrustedUrl('legacy-v2');
    next();
});

router.getAsync('/', async (req, res) => {
    const after = Number(req.query.after || 0);
    if (!Number.isSafeInteger(after) || after < 0) {
        throw new NotFoundError();
    }
    const rows = await knex.schema.hasTable(archiveTable)
        ? await knex(archiveTable).select('id', 'kind', 'name', 'source_key')
            .whereNot('kind', '_migration').where('id', '>', after).orderBy('id').limit(51)
        : [];
    const records = rows.slice(0, 50).map(row => ({...row, url: getTrustedUrl('legacy-v2/' + row.id)}));
    const nextUrl = rows.length > 50 ? getTrustedUrl('legacy-v2?after=' + records[49].id) : null;
    res.render('legacy-v2', {title: 'Archived v2 records', records, nextUrl});
});

router.getAsync('/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1 || !await knex.schema.hasTable(archiveTable)) {
        throw new NotFoundError();
    }
    const archived = await knex(archiveTable).where('id', id).whereNot('kind', '_migration').first();
    if (!archived) {
        throw new NotFoundError();
    }
    res.render('legacy-v2', {title: 'Archived v2 records',
        record: {...archived, record: JSON.stringify(JSON.parse(archived.record), null, 2)}});
});

module.exports = router;
