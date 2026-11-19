'use strict';

const {test} = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const session = require('express-session');

// Keep account lookup outside this test; Passport and session persistence are real.
const usersId = require.resolve('../models/users');
require.cache[usersId] = {id: usersId, filename: usersId, loaded: true, exports: {
    getById: async (context, id) => ({id, username: 'logout-test'})
}};
const auth = require('../lib/passport');

async function fixture(failDestroy) {
    const store = new session.MemoryStore();
    const destroy = store.destroy.bind(store);
    let delayDestroy = false;
    let destroyFinished = false;
    let finish;
    const completion = new Promise(resolve => { finish = resolve; });
    store.destroy = (id, callback) => {
        if (!delayDestroy) return destroy(id, callback);
        setTimeout(() => {
            const done = err => {
                destroyFinished = true;
                finish();
                callback(err);
            };
            if (failDestroy) done(new Error('session store unavailable'));
            else destroy(id, done);
        }, 100);
    };

    const app = express();
    app.use(session({store, secret: 'logout-test-secret', resave: false, saveUninitialized: false}));
    auth.setupRegularAuth(app);
    app.post('/login', (req, res, next) => req.logIn({id: 42}, err => err ? next(err) : res.json({ok: true})));
    app.post('/logout', auth.restLogout);
    app.get('/account', (req, res) => res.status(req.user ? 200 : 401).json({authenticated: !!req.user}));
    app.use((err, req, res, next) => res.status(500).json({error: err.message}));
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.on('listening', resolve));
    const base = 'http://127.0.0.1:' + server.address().port;
    const login = await fetch(base + '/login', {method: 'POST'});
    assert.equal(login.status, 200);
    await login.text();
    const cookie = login.headers.getSetCookie()[0].split(';')[0];
    assert.equal((await fetch(base + '/account', {headers: {Cookie: cookie}})).status, 200);
    delayDestroy = true;
    return {
        logout: () => fetch(base + '/logout', {method: 'POST', headers: {Cookie: cookie}}),
        account: () => fetch(base + '/account', {headers: {Cookie: cookie}}),
        finished: () => destroyFinished,
        close: async () => {
            await completion;
            await new Promise(resolve => server.close(resolve));
        }
    };
}

test('logout responds only after Passport finishes invalidating its session', async () => {
    const app = await fixture(false);
    try {
        const response = await app.logout();
        await response.text();
        assert.equal(response.status, 200);
        assert.equal(app.finished(), true, 'Logout responded before the session store completed');
        assert.equal((await app.account()).status, 401, 'The old session must no longer authenticate');
    } finally {
        await app.close();
    }
});

test('logout reports a session-store failure instead of success', async () => {
    const app = await fixture(true);
    try {
        const response = await app.logout();
        const body = await response.text();
        assert.equal(response.status, 500);
        assert.match(body, /session store unavailable/);
    } finally {
        await app.close();
    }
});
