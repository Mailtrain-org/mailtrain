'use strict';

const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
const {createHash} = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {setTimeout: delay} = require('node:timers/promises');
const {login} = require('./api');
const {supportedFixture} = require('./fixtures');
const {browserWalk, seedEditors} = require('./browser');

const v2Image = 'mailtrain/mailtrain@sha256:6a956970c81a20274198cb31237260382f33fe503ec3981e9cac5ae581bcaab1';

function docker(args, input, allowFailure = false) {
    const result = spawnSync('docker', args, {input, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024});
    if (result.error) throw result.error;
    if (!allowFailure) assert.equal(result.status, 0, `${args.join(' ')}: ${result.stdout}\n${result.stderr}`);
    return result;
}

async function ready(base) {
    for (let i = 0; i < 120; i++) {
        try { if ((await fetch(base + '/login')).ok) return; } catch (error) {}
        await delay(500);
    }
    throw new Error('Mailtrain did not start at ' + base);
}

async function createLegacyFixture(trusted, ids) {
    const {rest} = await login(trusted);
    const legacy = {};
    for (const [name, type] of [['GrapesJS template', 'grapesjs'], ['CKEditor template', 'ckeditor4']]) {
        legacy[type] = await rest('templates', {
            name, namespace: ids.namespace, description: '', type, tag_language: 'simple',
            data: {source: '<p>Original ' + name + '</p>'},
            html: '<p>Rendered ' + name + '</p>', text: 'Rendered ' + name
        });
    }
    for (const [name, type] of [['Archived RSS campaign', 2], ['Archived triggered campaign', 4]]) {
        legacy[type] = await rest('campaigns', {
            name, namespace: ids.namespace, description: '', type, source: 3,
            data: {sourceTemplate: ids.code, feedUrl: 'https://example.test/feed.xml'},
            lists: [{list: ids.list}], subject: name, send_configuration: ids.sendConfiguration,
            from_name_override: null, from_email_override: null, reply_to_override: null,
            click_tracking_disabled: true, open_tracking_disabled: true
        });
    }
    return legacy;
}

function seedLegacyState(db, ids, legacy) {
    db.sql('mailtrain', `
        UPDATE campaigns SET status=6, last_check='2021-07-26 01:02:03' WHERE id=${legacy[2]};
        UPDATE campaigns SET status=2, scheduled='2030-01-01 08:00:00', start_at='2030-01-01 08:00:00' WHERE id=${legacy[4]};
        INSERT INTO rss(parent,guid,campaign) VALUES(${legacy[2]},'archived-feed-entry',${ids.sent});
        INSERT INTO triggers(id,name,campaign,entity,event,enabled)
            VALUES(999,'Archived subscription trigger',${legacy[4]},'subscription','created',1);
        INSERT INTO trigger_messages(\`trigger\`,list,subscription) VALUES(999,${ids.list},${ids.subscriber});
        INSERT INTO queued(send_configuration,type,data)
            VALUES(${ids.sendConfiguration},1,'{"legacy":"archived triggered delivery"}');
        INSERT INTO report_templates(id,name,namespace,user_fields,js,hbs)
            VALUES(999,'Archived report template',${ids.namespace},'[]','','Report summary');
        INSERT INTO reports(id,name,report_template,namespace,params)
            VALUES(999,'Archived report',999,${ids.namespace},'{}');
        INSERT INTO shares_report(entity,user,role) VALUES(999,${ids.user},'master');
        INSERT INTO permissions_report(entity,user,operation) VALUES(999,${ids.user},'view');
    `);
}

async function checkLegacy(trusted, db, legacy, ids) {
    const {rest} = await login(trusted);
    const outsider = await login(trusted, 'Upgrade-user-password-79!', 'upgrade-nobody');
    await assert.rejects(outsider.request('/legacy-v2'), /\/legacy-v2: (403|404)/);
    const archived = (kind, key) => JSON.parse(db.sql('mailtrain',
        `SELECT record FROM legacy_v2_records WHERE kind='${kind}' AND source_key='${key}'`));
    assert.equal(archived('templates', legacy.grapesjs).type, 'grapesjs');
    assert.equal(archived('templates', legacy.ckeditor4).type, 'ckeditor4');
    for (const id of [legacy.grapesjs, legacy.ckeditor4]) {
        const template = await rest('templates/' + id);
        assert.equal(template.type, 'codeeditor');
        assert.match(template.data.source, /Rendered/);
    }
    assert.equal(archived('campaigns', legacy[2]).status, 6);
    assert.equal(archived('campaigns', legacy[4]).status, 2);
    assert.equal(archived('rss', db.sql('mailtrain', "SELECT source_key FROM legacy_v2_records WHERE kind='rss'").trim()).campaign, ids.sent);
    assert.equal(archived('triggers', 999).campaign, legacy[4]);
    assert.equal(archived('trigger_messages', `999:${ids.list}:${ids.subscriber}`).subscription, ids.subscriber);
    assert.equal(archived('reports', 999).report_template, 999);
    assert.equal(archived('report_templates', 999).hbs, 'Report summary');
    assert.equal(archived('shares_report', `999:${ids.user}`).role, 'master');
    assert.equal(archived('permissions_report', `999:${ids.user}:view`).operation, 'view');
    assert.equal(Number(db.sql('mailtrain', "SELECT COUNT(*) FROM legacy_v2_records WHERE kind='queued'")), 1);
    assert.equal(Number(db.sql('mailtrain', "SELECT COUNT(*) FROM queued WHERE data LIKE '%archived triggered delivery%'")), 0);
    for (const id of [legacy[2], legacy[4]]) {
        assert.equal((await rest('campaigns-stats/' + id)).status, 3);
        await assert.rejects(rest('campaign-start/' + id, {}), /archived from Mailtrain v2/i);
    }
    console.log('Retired templates, campaigns, report data and triggers survived without restarting legacy jobs');
}

function databaseTools(mysql, network, image, mounts = []) {
    const sql = (db, statement) => docker(['exec', '-i', mysql, 'mariadb', '-uroot', '-pmailtrain', '--batch', '--raw', '--skip-column-names', db], statement).stdout;
    const dump = db => docker(['exec', mysql, 'mariadb-dump', '-uroot', '-pmailtrain', '--skip-comments', '--skip-dump-date', '--skip-extended-insert', '--order-by-primary', '--hex-blob', db]).stdout;
    function clone(db, snapshot) {
        assert.match(db, /^fixture_[a-z0-9_]+$/);
        sql('mysql', `DROP DATABASE IF EXISTS \`${db}\`; CREATE DATABASE \`${db}\`;`);
        sql(db, snapshot);
    }
    function execute(db, command, config = {}) {
        return docker(['run', '--rm', '--network', network, ...mounts,
            '-e', 'NODE_CONFIG=' + JSON.stringify({mysql: {host: 'mysql', database: db, user: 'root', password: 'mailtrain'}, ...config}),
            '-w', '/app/server', '--entrypoint', 'node', image, ...command], undefined, true);
    }
    return {sql, dump, clone, execute};
}

function rejectionChecks(db, snapshot, record, evidence) {
    const lanes = {
        startup: ['-e', "require('./lib/dbupdate').initDb().then(()=>process.exit(0)).catch(e=>{console.error(e.message);process.exit(1)})"],
        bootstrap: ['setup/docker-entrypoint-db-setup.js', 'fixture-password', ''],
        direct: ['-e', "require('./setup/knex/migrations/20240421161200_v2_to_v3').up(require('./lib/knex')).then(()=>process.exit(0)).catch(e=>{console.error(e.message);process.exit(1)})"],
        cli: ['node_modules/knex/bin/cli.js', '--knexfile', 'setup/knex/knexfile.js', 'migrate:latest']
    };
    for (const [name, [statement, messages]] of Object.entries({incomplete_v2: ["DELETE FROM knex_migrations WHERE name='20200830140000_required_custom_fields.js'", 'Finish all Mailtrain v2 migrations']})) {
        const fixture = 'fixture_' + name;
        db.clone(fixture, snapshot);
        db.sql(fixture, statement);
        const before = db.dump(fixture);
        if (evidence) fs.writeFileSync(path.join(evidence, name + '.before.sql'), before);
        for (const [lane, command] of Object.entries(lanes)) {
            const result = db.execute(fixture, command);
            assert.notEqual(result.status, 0, name + ' must reject via ' + lane);
            for (const message of [].concat(messages)) assert.ok((result.stdout + result.stderr).includes(message), result.stdout + result.stderr);
            const after = db.dump(fixture);
            if (evidence) fs.writeFileSync(path.join(evidence, name + '.' + lane + '.after.sql'), after);
            assert.equal(after, before, name + '/' + lane + ' changed schema, rows or history');
            record.push({fixture: name, lane, unchanged: true, sha256: createHash('sha256').update(before).digest('hex')});
        }
        console.log('Read-only rejection: ' + name + ' (startup/bootstrap/direct/CLI)');
    }
}

async function capture(trusted, ids) {
    const {rest} = await login(trusted);
    const result = {};
    const routes = {
        channel: `channels/${ids.channel}`, list: `lists/${ids.list}`, fields: `fields/${ids.list}`, segment: `segments/${ids.list}/${ids.segment}`,
        code: `templates/${ids.code}`, mosaico: `templates/${ids.mosaico}`, mosaicoCustom: `templates/${ids.mosaicoCustom}`,
        mosaicoBase: `mosaico-templates/${ids.mosaicoBase}`, namespace: `namespaces/${ids.namespace}`,
        user: `users/${ids.user}`, sendConfiguration: `send-configurations-private/${ids.sendConfiguration}`, token: 'access-token',
        sent: `campaigns-stats/${ids.sent}`, scheduled: `campaigns-stats/${ids.scheduled}`,
        codeFiles: `files-list/template/file/${ids.code}`, mosaicoFiles: `files-list/template/file/${ids.mosaico}`,
        baseFiles: `files-list/mosaicoTemplate/file/${ids.mosaicoBase}`, baseBlocks: `files-list/mosaicoTemplate/block/${ids.mosaicoBase}`,
        sentFiles: `files-list/campaign/file/${ids.sent}`, scheduledFiles: `files-list/campaign/file/${ids.scheduled}`,
        draftFiles: `files-list/campaign/file/${ids.draft}`, attachments: `files-list/campaign/attachment/${ids.draft}`,
        content: `campaigns-content/${ids.draft}`, subscriber: `subscriptions/${ids.list}/${ids.subscriber}`
    };
    if (ids.mjml) routes.mjml = `templates/${ids.mjml}`;
    const ignored = new Set(['hash', 'permissions', 'role', 'type', 'parent', 'last_check', 'cc', 'bcc']);
    // Only top-level removed campaign fields/role identities differ. Template
    // editor types, nested rules, custom data and source content remain exact.
    for (const [key, route] of Object.entries(routes)) {
        const value = await rest(route);
        if (Array.isArray(value) && (key.endsWith('Files') || key === 'baseBlocks' || key === 'attachments')) {
            result[key] = value.map(file => {
                if (file.gc_allowed !== undefined) assert.equal(Boolean(file.gc_allowed), false, 'Upgraded files must not be garbage collected');
                const {gc_allowed, ...metadata} = file;
                return metadata;
            });
            continue;
        }
        result[key] = value && typeof value === 'object' && !Array.isArray(value)
            ? Object.fromEntries(Object.entries(value).filter(([name]) => !ignored.has(name))) : value;
        if (['code', 'mjml', 'mosaico', 'mosaicoCustom', 'mosaicoBase'].includes(key)) result[key].type = value.type;
    }
    return result;
}

async function roleChecks({db, snapshot, ids, image, network, freePort, filesVolume, temporary, record}) {
    const defaults = JSON.parse(db.execute('mailtrain', ['-e', "console.log(JSON.stringify(require('./lib/config').defaultRoles));process.exit(0)"]).stdout);
    const custom = JSON.parse(JSON.stringify(defaults));
    delete custom.global.globalMaster;
    custom.global.master = {name: 'Custom master', admin: true, permissions: [], rootNamespaceRole: 'master'};
    custom.global.nobody = {name: 'Custom nobody', permissions: []};
    custom.global.campaignsAdminWithoutNamespace = {name: 'Custom multi', permissions: []};
    custom.global.campaignsAdmin = {name: 'Custom campaign admin', permissions: [], ownNamespaceRole: 'campaignsViewer'};
    custom.namespace.campaignsAdmin = {name: 'Custom namespace', permissions: ['view'], children: {sendConfiguration: ['viewPublic']}};
    const missing = JSON.parse(JSON.stringify(custom));
    delete missing.global.master;
    const cases = [
        ['default', {}, ['globalMaster', 'campaignsAdmin', 'none', 'none']],
        ['extended', {defaultRoles: {global: {master: {name: 'Custom master', permissions: [], ownNamespaceRole: 'campaignsViewer'}, nobody: {name: 'Custom nobody', permissions: []}}, namespace: {campaignsAdmin: {permissions: ['view'], children: {sendConfiguration: ['viewPublic']}}}}}, ['master', 'campaignsAdmin', 'none', 'nobody']],
        ['custom', {roles: custom}, ['master', 'campaignsAdmin', 'campaignsAdminWithoutNamespace', 'nobody']],
        ['missing_custom', {roles: missing}, null],
        ['unsafe_target', {defaultRoles: {global: {none: {permissions: ['assignRole']}}}}, null]
    ];
    for (const [name, roles, expected] of cases) {
        const fixture = 'fixture_roles_' + name;
        db.clone(fixture, snapshot);
        for (const [index, role] of ['master', 'campaignsAdmin', 'campaignsAdminWithoutNamespace', 'nobody'].entries()) {
            const id = 100 + index;
            db.sql(fixture, `INSERT INTO users(id,username,name,email,password,namespace,role) SELECT ${id},'role-${id}','Role fixture','role-${id}@example.test',password,${ids.namespace},'${role}' FROM users WHERE id=${ids.user};`);
            if (index === 1 || index === 2) db.sql(fixture, `INSERT INTO shares_namespace(entity,user,role,auto) VALUES(${ids.namespace},${id},'campaignsAdmin',0);`);
        }
        const before = db.dump(fixture);
        if (!expected) {
            const rejected = db.execute(fixture, ['-e', "require('./lib/dbupdate').initDb().then(()=>process.exit(0)).catch(e=>{console.error(e.message);process.exit(1)})"], roles);
            assert.notEqual(rejected.status, 0);
            assert.match(rejected.stdout + rejected.stderr, /Define these user roles/);
            assert.equal(db.dump(fixture), before);
            record.push({roles: name, rejected: true, unchanged: true});
            continue;
        }
        const ports = [await freePort(), await freePort(), await freePort()];
        const base = 'http://localhost:' + ports[0];
        const config = {
            mysql: {host: 'mysql', database: fixture, user: 'root', password: 'mailtrain'},
            redis: {host: 'redis'}, builtinZoneMTA: {enabled: false},
            www: {host: '0.0.0.0', trustedUrlBase: base, sandboxUrlBase: 'http://localhost:' + ports[1], publicUrlBase: 'http://localhost:' + ports[2]}, ...roles
        };
        const configPath = path.join(temporary, name + '.json');
        fs.writeFileSync(configPath, JSON.stringify(config));
        const container = docker(['create', '--network', network, '-v', configPath + ':/app/server/config/production.yaml:ro',
            '-v', filesVolume + ':/app/server/files', '-e', 'NODE_ENV=production', '-w', '/app/server', '--entrypoint', 'node',
            ...ports.flatMap((port, index) => ['-p', `127.0.0.1:${port}:${[3000, 3003, 3004][index]}`]), image, 'index.js']).stdout.trim();
        try {
            docker(['start', container]);
            await ready(base);
            for (let id = 100; id < 104; id++) {
                const {rest} = await login(base, 'Upgrade-user-password-79!', 'role-' + id);
                assert.equal((await rest('account')).role, expected[id - 100]);
                const flags = await rest('permissions-check', {
                    share: {entityTypeId: 'sendConfiguration', entityId: ids.sendConfiguration, requiredOperations: ['share', 'share:campaignsCreator']},
                    send: {entityTypeId: 'sendConfiguration', entityId: ids.sendConfiguration, requiredOperations: ['sendWithoutOverrides']}
                });
                assert.equal(flags.share, id === 100 && name !== 'extended');
                if (id === 101 || id === 102) await rest('shares', {entityTypeId: 'sendConfiguration', entityId: ids.sendConfiguration, userId: 103, role: 'campaignsCreator'}, 'PUT', 403);
                record.push({roles: name, user: id, role: expected[id - 100], ...flags});
            }
            console.log('Authenticated role boundary: ' + name);
        } catch (error) {
            console.error(docker(['logs', container]).stdout);
            throw error;
        } finally {
            docker(['rm', '-f', container]);
        }
    }
}

async function upgrade({compose, env, project, freePort}) {
    const image = env.MAILTRAIN_IMAGE || 'mailtrain-local:v3';
    const architecture = docker(['image', 'inspect', '-f', '{{.Architecture}}', image]).stdout.trim();
    const records = [];
    const temporary = fs.mkdtempSync(path.join(process.env.E2E_EVIDENCE_DIR || os.tmpdir(), 'mailtrain-upgrade-'));
    try {
        env.MAILTRAIN_IMAGE = v2Image;
        env.MAILTRAIN_PLATFORM = 'linux/amd64';
        compose(['up', '-d', '--no-build', '--wait', '--wait-timeout', '240']);
        await ready(env.URL_BASE_TRUSTED);
        const ids = await supportedFixture(env.URL_BASE_TRUSTED, true);
        await seedEditors(env.URL_BASE_TRUSTED, ids);
        const legacy = await createLegacyFixture(env.URL_BASE_TRUSTED, ids);
        const before = await capture(env.URL_BASE_TRUSTED, ids);
        compose(['stop', 'mailtrain']);
        const mysql = compose(['ps', '-q', 'mysql'], true);
        const db = databaseTools(mysql, project + '_default', image);
        seedLegacyState(db, ids, legacy);
        const snapshot = db.dump('mailtrain');
        fs.writeFileSync(path.join(temporary, 'v2.sql'), snapshot);
        rejectionChecks(db, snapshot, records, process.env.E2E_EVIDENCE_DIR ? temporary : undefined);
        env.MAILTRAIN_IMAGE = image;
        env.MAILTRAIN_PLATFORM = 'linux/' + architecture;
        const filesBefore = compose(['run', '--rm', '--no-deps', '--user', 'root', '--entrypoint', 'sh', 'mailtrain', '-c', 'find /app/server/files -type f -exec sha256sum {} + | sort'], true);
        compose(['run', '--rm', '--no-deps', '--user', 'root', '--entrypoint', 'chown', 'mailtrain', '-R', '1000:1000', '/app/server/files']);
        compose(['up', '-d', '--no-build', '--wait', '--wait-timeout', '240', 'mailtrain']);
        await ready(env.URL_BASE_TRUSTED);
        assert.deepEqual(await capture(env.URL_BASE_TRUSTED, ids), before, 'Supported v2 entities changed');
        await checkLegacy(env.URL_BASE_TRUSTED, db, legacy, ids);
        ids.legacy = legacy;
        const filesAfter = compose(['exec', '-T', 'mailtrain', 'sh', '-c', 'find /app/server/files -type f -exec sha256sum {} + | sort'], true);
        assert.equal(filesAfter, filesBefore, 'Uploaded files changed during upgrade');
        const oldLedger = snapshot.split('\n').filter(line => line.startsWith('INSERT INTO `knex_migrations`'));
        const newLedger = db.dump('mailtrain').split('\n').filter(line => line.startsWith('INSERT INTO `knex_migrations`'));
        for (const row of oldLedger) assert.ok(newLedger.includes(row), 'Historical migration row changed: ' + row);
        for (const lane of [['node_modules/knex/bin/cli.js', '--knexfile', 'setup/knex/knexfile.js', 'migrate:latest'],
            ['-e', "require('./lib/dbupdate').initDb().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)})"],
            ['setup/docker-entrypoint-db-setup.js', 'must-not-reset-existing-password', '']]) {
            const stable = db.dump('mailtrain');
            const result = db.execute('mailtrain', lane);
            assert.equal(result.status, 0, result.stdout + result.stderr);
            assert.equal(db.dump('mailtrain'), stable, 'Already migrated database changed');
        }
        await roleChecks({db, snapshot, ids, image, network: project + '_default', freePort,
            filesVolume: project + '_mailtrain-files', temporary, record: records});
        const catcher = 'http://' + compose(['port', 'smtp', '8025'], true);
        await browserWalk(env.URL_BASE_TRUSTED, env.URL_BASE_PUBLIC, ids, 'smoke-test-password', catcher);
        records.push({supportedEntities: 'preserved', uploadedFiles: 'identical', history: 'preserved', alreadyV3: 'unchanged'});
        fs.writeFileSync(path.join(temporary, 'results.json'), JSON.stringify(records, null, 2));
        console.log('v2 upgrade, retired records and role checks passed; evidence: ' + temporary);
    } finally {
        env.MAILTRAIN_IMAGE = image;
        env.MAILTRAIN_PLATFORM = 'linux/' + architecture;
        if (!process.env.E2E_EVIDENCE_DIR) fs.rmSync(temporary, {recursive: true, force: true});
    }
}

module.exports = {upgrade, databaseTools, rejectionChecks, roleChecks, ready};
