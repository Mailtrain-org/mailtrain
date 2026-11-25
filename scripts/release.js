'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const packages = ['server', 'client', 'shared', 'locales', 'zone-mta'];
const repository = 'Mailtrain-org/mailtrain';
const workflow = '.github/workflows/release.yml';
const environment = 'mailtrain-release';
const image = 'mailtrain/mailtrain';

// This is also the local dry run: no network, Docker, credentials or writes.
function prepare(root, tag, env = {}, requirePublisher = false) {
    assert.match(tag || '', /^v3\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-(alpha|beta|rc)\.(0|[1-9]\d*))?$/, 'Expected a v3 semver release tag');
    const version = tag.slice(1);
    for (const directory of packages) {
        const manifest = JSON.parse(fs.readFileSync(path.join(root, directory, 'package.json')));
        const lock = JSON.parse(fs.readFileSync(path.join(root, directory, 'package-lock.json')));
        assert.equal(manifest.version, version, directory + ' version does not match tag');
        assert.equal(lock.version, version, directory + ' lock version does not match tag');
        assert.equal(lock.packages[''].version, version, directory + ' lock root does not match tag');
        assert.equal(lock.name, manifest.name, directory + ' lock name does not match manifest');
        assert.equal(lock.packages[''].name, manifest.name, directory + ' lock root name does not match manifest');
    }
    const changelog = fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8');
    const headings = [...changelog.matchAll(/^## (\S+).*$/gm)];
    const matches = headings.filter(heading => heading[1] === version);
    assert.equal(matches.length, 1, 'Expected exactly one changelog entry for ' + version);
    const heading = matches[0];
    const next = headings.find(entry => entry.index > heading.index);
    const body = changelog.slice(heading.index + heading[0].length, next ? next.index : undefined).trim();
    assert.ok(body.length > 0, 'Release notes must not be empty');
    const prerelease = version.includes('-');
    const latestSetting = env.RELEASE_PROMOTE_LATEST || 'false';
    assert.match(latestSetting, /^(true|false)$/, 'RELEASE_PROMOTE_LATEST must be true or false');
    const promoteLatest = latestSetting === 'true';
    assert.ok(!promoteLatest || !prerelease, 'Only a stable release can promote Docker latest');
    const ref = 'refs/tags/' + tag;
    const workflowRef = repository + '/' + workflow + '@' + ref;
    // Requires the repository custom subject template documented in RELEASING.md.
    const subject = 'repo:' + repository + ':environment:' + environment + ':workflow_ref:' + workflowRef + ':ref:' + ref;
    if (requirePublisher) {
        assert.equal(env.GITHUB_EVENT_NAME, 'push', 'Publishing requires a tag push');
        assert.equal(env.GITHUB_REPOSITORY, repository, 'Publishing repository mismatch');
        assert.equal(env.GITHUB_REF, ref, 'Publishing tag mismatch');
        assert.equal(env.GITHUB_WORKFLOW_REF, workflowRef, 'Publishing workflow mismatch');
        assert.equal(env.RELEASE_ENVIRONMENT, environment, 'Publishing environment mismatch');
        assert.equal(env.RELEASE_APPROVED_TAG, tag, 'Publishing approval required for this exact tag');
        if (env.DOCKERHUB_OIDC_CONNECTIONID || env.DOCKERHUB_OIDC_SUBJECT) {
            assert.ok((env.DOCKERHUB_OIDC_CONNECTIONID || '').trim(), 'Missing Docker Hub OIDC connection');
            assert.equal(env.DOCKERHUB_OIDC_SUBJECT, subject, 'Missing or mismatched Docker Hub OIDC subject');
        } else {
            assert.ok((env.DOCKERHUB_USERNAME || '').trim() && (env.DOCKERHUB_TOKEN || '').trim(),
                'Missing Docker Hub publisher configuration');
        }
    }
    return {
        version, tag, repository, workflow, environment, image,
        platforms: ['linux/amd64', 'linux/arm64'],
        promoteLatest,
        imageTags: [image + ':' + version, ...(promoteLatest ? [image + ':latest'] : [])],
        oidcSubject: subject,
        release: {tag_name: tag, name: 'Mailtrain ' + version, body, draft: false, prerelease, make_latest: prerelease ? 'false' : 'true'}
    };
}

function assertQualified(run, jobs, commit) {
    assert.equal(run.head_sha, commit, 'Qualification must use the tagged commit');
    assert.equal(run.head_branch, 'v3', 'Qualification must use the v3 branch');
    assert.equal(run.event, 'push', 'Qualification must run after the merge to v3');
    assert.equal(run.conclusion, 'success', 'The v3 qualification workflow must pass before tagging');
    for (const arch of ['amd64', 'arm64']) {
        const job = jobs.find(candidate => candidate.name === 'build (' + arch + ')');
        assert.equal(job?.conclusion, 'success', 'Missing successful ' + arch + ' build');
        const qualification = job.steps?.find(step => step.name === 'Qualify image before tagging');
        assert.equal(qualification?.conclusion, 'success', 'Missing successful ' + arch + ' release qualification');
    }
}

if (require.main === module) {
    try {
        const args = process.argv.slice(2);
        const tag = args.shift();
        const requirePublisher = args.includes('--require-publisher');
        const outputIndex = args.indexOf('--output');
        const output = outputIndex === -1 ? undefined : args[outputIndex + 1];
        assert.ok(outputIndex === -1 || (output && !output.startsWith('--')), '--output requires a directory');
        const allowed = args.filter((arg, index) => outputIndex === -1 || (index !== outputIndex && index !== outputIndex + 1));
        assert.ok(allowed.every(arg => arg === '--require-publisher'), 'Unknown release option');
        const plan = prepare(path.resolve(__dirname, '..'), tag, process.env, requirePublisher);
        if (output) {
            fs.mkdirSync(output, {recursive: true});
            fs.writeFileSync(path.join(output, 'plan.json'), JSON.stringify(plan, null, 2) + '\n');
            fs.writeFileSync(path.join(output, 'release-notes.md'), plan.release.body + '\n');
            fs.writeFileSync(path.join(output, 'github-release.json'), JSON.stringify(plan.release, null, 2) + '\n');
            if (process.env.GITHUB_OUTPUT) {
                fs.appendFileSync(process.env.GITHUB_OUTPUT, 'version=' + plan.version + '\npromote_latest=' + plan.promoteLatest + '\n');
            }
        }
        process.stdout.write(JSON.stringify(plan, null, 2) + '\n');
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}

module.exports = {prepare, packages, assertQualified};
