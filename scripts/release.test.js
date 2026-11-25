'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const {test} = require('node:test');
const {prepare, packages, assertQualified} = require('./release');

const source = path.resolve(__dirname, '..');

function fixture(t, version = '3.0.0-rc.1') {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mailtrain-release-'));
    t.after(() => fs.rmSync(root, {recursive: true, force: true}));
    for (const directory of packages) {
        fs.mkdirSync(path.join(root, directory));
        for (const name of ['package.json', 'package-lock.json']) {
            const data = JSON.parse(fs.readFileSync(path.join(source, directory, name)));
            data.version = version;
            if (name === 'package-lock.json') data.packages[''].version = version;
            fs.writeFileSync(path.join(root, directory, name), JSON.stringify(data));
        }
    }
    fs.writeFileSync(path.join(root, 'CHANGELOG.md'), '# Changelog\n\n## ' + version + '\n\nExact notes from @contributor.\n\n## 2.0.0\n\nOld notes.\n');
    return root;
}

function publisher(plan) {
    return {
        GITHUB_EVENT_NAME: 'push', GITHUB_REPOSITORY: plan.repository,
        GITHUB_REF: 'refs/tags/' + plan.tag,
        GITHUB_WORKFLOW_REF: plan.repository + '/' + plan.workflow + '@refs/tags/' + plan.tag,
        RELEASE_ENVIRONMENT: plan.environment, RELEASE_APPROVED_TAG: plan.tag,
        DOCKERHUB_OIDC_CONNECTIONID: 'fixture-connection', DOCKERHUB_OIDC_SUBJECT: plan.oidcSubject
    };
}

test('checkout manifests, lock roots and release notes agree', () => {
    const version = require('../server/package.json').version;
    const plan = prepare(source, 'v' + version);
    assert.ok(plan.release.body.length > 0);
    assert.deepEqual(plan.imageTags, ['mailtrain/mailtrain:' + version]);
});

test('RC produces exact notes without a latest tag', t => {
    const plan = prepare(fixture(t), 'v3.0.0-rc.1');
    assert.deepEqual(plan.imageTags, ['mailtrain/mailtrain:3.0.0-rc.1']);
    assert.equal(plan.release.prerelease, true);
    assert.equal(plan.release.make_latest, 'false');
    assert.equal(plan.release.body, 'Exact notes from @contributor.');
});

test('stable release defaults to a versioned image and extracts only that release entry', t => {
    const plan = prepare(fixture(t, '3.0.0'), 'v3.0.0');
    assert.deepEqual(plan.imageTags, ['mailtrain/mailtrain:3.0.0']);
    assert.equal(plan.release.prerelease, false);
    assert.equal(plan.release.make_latest, 'true');
    assert.equal(plan.release.body, 'Exact notes from @contributor.');
    assert.deepEqual(prepare(fixture(t, '3.0.0'), plan.tag, publisher(plan), true), plan);
});

test('Docker latest requires explicit approval on a stable release', t => {
    const env = {RELEASE_PROMOTE_LATEST: 'true'};
    const plan = prepare(fixture(t, '3.0.0'), 'v3.0.0', env);
    assert.deepEqual(plan.imageTags, ['mailtrain/mailtrain:3.0.0', 'mailtrain/mailtrain:latest']);
    assert.equal(plan.promoteLatest, true);
    assert.throws(() => prepare(fixture(t), 'v3.0.0-rc.1', env), /Only a stable release/);
    assert.throws(() => prepare(fixture(t), 'v3.0.0-rc.1', {RELEASE_PROMOTE_LATEST: 'yes'}), /must be true or false/);
});

test('tag and every manifest/lock version must agree', t => {
    assert.throws(() => prepare(fixture(t), 'v3.0.0'), /does not match tag/);
    for (const directory of packages) {
        for (const location of ['manifest', 'lock', 'lock-root']) {
            const root = fixture(t);
            const file = path.join(root, directory, location === 'manifest' ? 'package.json' : 'package-lock.json');
            const data = JSON.parse(fs.readFileSync(file));
            if (location === 'lock-root') data.packages[''].version = '2.0.0';
            else data.version = '2.0.0';
            fs.writeFileSync(file, JSON.stringify(data));
            assert.throws(() => prepare(root, 'v3.0.0-rc.1'), /does not match tag/, directory + ' ' + location);
        }
    }
});

test('invalid release identities and missing/duplicate notes fail closed', t => {
    for (const tag of ['v2.20261112.0', '3.0.0', 'v3.00.0', 'v3.0.0-rc.01', 'v3.0.0+build', 'v3.0.0;echo unsafe']) {
        assert.throws(() => prepare(source, tag), /semver release tag/);
    }
    for (const notes of ['# Changelog\n', '## 3.0.0-rc.1\n', '## 3.0.0-rc.1\nnotes\n## 3.0.0-rc.1\nnotes']) {
        const root = fixture(t);
        fs.writeFileSync(path.join(root, 'CHANGELOG.md'), notes);
        assert.throws(() => prepare(root, 'v3.0.0-rc.1'), /changelog entry|must not be empty/);
    }
});

test('missing publisher configuration blocks all publication; dry run remains available', t => {
    const root = fixture(t);
    const plan = prepare(root, 'v3.0.0-rc.1');
    assert.throws(() => prepare(root, plan.tag, {}, true), /tag push/);
    const env = publisher(plan);
    assert.deepEqual(prepare(root, plan.tag, env, true), plan);
    for (const key of Object.keys(env)) {
        assert.throws(() => prepare(root, plan.tag, {...env, [key]: ''}, true), undefined, key);
        // An opaque connection ID is validated by Docker, not by this dry run.
        if (key !== 'DOCKERHUB_OIDC_CONNECTIONID') {
            assert.throws(() => prepare(root, plan.tag, {...env, [key]: 'wrong'}, true), undefined, key);
        }
    }
});

test('both fallback credentials are required and an invalid OIDC configuration cannot fall back', t => {
    const root = fixture(t);
    const plan = prepare(root, 'v3.0.0-rc.1');
    const env = publisher(plan);
    delete env.DOCKERHUB_OIDC_CONNECTIONID;
    delete env.DOCKERHUB_OIDC_SUBJECT;
    const token = {...env, DOCKERHUB_USERNAME: 'fixture-user', DOCKERHUB_TOKEN: 'fixture-token'};
    assert.deepEqual(prepare(root, plan.tag, token, true), plan);
    assert.throws(() => prepare(root, plan.tag, {...token, DOCKERHUB_TOKEN: ''}, true), /publisher configuration/);
    assert.throws(() => prepare(root, plan.tag, {...token, DOCKERHUB_USERNAME: ''}, true), /publisher configuration/);
    assert.throws(() => prepare(root, plan.tag, {...token, DOCKERHUB_OIDC_CONNECTIONID: 'incomplete'}, true), /OIDC subject/);
});

test('CLI dry run performs no writes and missing configuration leaves no apparent release files', t => {
    const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'mailtrain-release-cli-'));
    t.after(() => fs.rmSync(temporary, {recursive: true, force: true}));
    const tag = 'v' + require('../server/package.json').version;
    const command = [path.join(__dirname, 'release.js'), tag];
    const options = {cwd: temporary, encoding: 'utf8', env: {GITHUB_OUTPUT: path.join(temporary, 'outputs')}};
    const dry = spawnSync(process.execPath, command, options);
    assert.equal(dry.status, 0, dry.stderr);
    assert.equal(JSON.parse(dry.stdout).release.tag_name, tag);
    assert.deepEqual(fs.readdirSync(temporary), []);
    const blocked = spawnSync(process.execPath, [...command, '--require-publisher', '--output', path.join(temporary, 'release')], options);
    assert.equal(blocked.status, 1);
    assert.match(blocked.stderr, /tag push/);
    assert.equal(blocked.stdout, '');
    assert.deepEqual(fs.readdirSync(temporary), []);
    const saved = spawnSync(process.execPath, [...command, '--output', path.join(temporary, 'release')], options);
    assert.equal(saved.status, 0, saved.stderr);
    assert.match(fs.readFileSync(path.join(temporary, 'outputs'), 'utf8'), /^promote_latest=false$/m);
    const payload = JSON.parse(fs.readFileSync(path.join(temporary, 'release/github-release.json')));
    assert.deepEqual(payload, JSON.parse(dry.stdout).release);
    assert.equal(fs.readFileSync(path.join(temporary, 'release/release-notes.md'), 'utf8'), payload.body + '\n');
});

test('tagging requires a green qualification at the exact v3 commit on both architectures', () => {
    const commit = 'a'.repeat(40);
    const run = {head_sha: commit, head_branch: 'v3', event: 'push', conclusion: 'success'};
    const jobs = ['amd64', 'arm64'].map(arch => ({
        name: 'build (' + arch + ')',
        conclusion: 'success',
        steps: [{name: 'Qualify image before tagging', conclusion: 'success'}]
    }));

    assert.doesNotThrow(() => assertQualified(run, jobs, commit));
    assert.throws(() => assertQualified(run, jobs, 'b'.repeat(40)), /tagged commit/);
    assert.throws(() => assertQualified({...run, head_branch: 'v2'}, jobs, commit), /v3 branch/);
    assert.throws(() => assertQualified({...run, event: 'pull_request'}, jobs, commit), /after the merge/);
    assert.throws(() => assertQualified({...run, conclusion: 'failure'}, jobs, commit), /must pass/);
    assert.throws(() => assertQualified(run, jobs.slice(0, 1), commit), /arm64 build/);
    const oldJobs = jobs.map(job => ({...job, steps: [{name: 'Build image', conclusion: 'success'}]}));
    assert.throws(() => assertQualified(run, oldJobs, commit), /release qualification/);
});
