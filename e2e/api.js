'use strict';

const assert = require('node:assert/strict');

async function login(trusted, password = 'smoke-test-password', username = 'admin') {
    const cookies = new Map();
    let csrf;
    async function request(route, body, method, multipart = false, expectedStatus = 200) {
        const requestMethod = method || (body === undefined ? 'GET' : 'POST');
        const response = await fetch(trusted + route, {
            method: requestMethod,
            headers: {
                Cookie: [...cookies].map(([key, value]) => key + '=' + value).join('; '),
                ...(requestMethod === 'GET' ? {} : {'X-CSRF-Token': csrf}),
                ...(body === undefined || multipart ? {} : {'Content-Type': 'application/json'})
            },
            ...(body === undefined ? {} : {body: multipart ? body : JSON.stringify(body)}),
            signal: AbortSignal.timeout(30000)
        }).catch(error => { throw new Error(requestMethod + ' ' + route + ': ' + error.message, {cause: error}); });
        for (const cookie of response.headers.getSetCookie()) {
            const pair = cookie.split(';')[0];
            const index = pair.indexOf('=');
            cookies.set(pair.slice(0, index), pair.slice(index + 1));
        }
        const text = await response.text();
        assert.equal(response.status, expectedStatus, `${route}: ${response.status} ${text.slice(0, 2000)}`);
        return text;
    }
    async function rest(route, body, method, expectedStatus = 200) {
        const text = await request('/rest/' + route, body, method, false, expectedStatus);
        return text ? JSON.parse(text) : null;
    }
    csrf = (await request('/login')).match(/window\.csrfToken = '([^']+)'/)[1];
    await rest('login', {username, password});
    csrf = (await request('/')).match(/window\.csrfToken = '([^']+)'/)[1];
    return {request, rest};
}

module.exports = {login};
