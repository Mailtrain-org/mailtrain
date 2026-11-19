'use strict';

const config = require('./config');
const {CampaignSource, CampaignStatus} = require('../../shared/campaigns');

const editors = ['codeeditor', 'mosaico', 'mosaicoWithFsTemplate'];
const retiredTables = {
    rss: ['id'],
    triggers: ['id'],
    trigger_messages: ['trigger', 'list', 'subscription'],
    reports: ['id'],
    report_templates: ['id'],
    shares_report: ['entity', 'user'],
    shares_report_template: ['entity', 'user'],
    permissions_report: ['entity', 'user', 'operation'],
    permissions_report_template: ['entity', 'user', 'operation']
};
const archiveTable = 'legacy_v2_records';

function htmlEditor(source) {
    return {type: 'codeeditor', data: {sourceType: 'html', source: source.html || ''},
        html: source.html || '', text: source.text || '', tag_language: source.tag_language || 'simple'};
}

async function archiveV2(knex) {
    if (!await knex.schema.hasTable(archiveTable)) {
        await knex.schema.createTable(archiveTable, table => {
            table.increments('id');
            table.string('kind', 40).notNullable();
            table.string('source_key', 191).notNullable();
            table.string('name').notNullable();
            table.text('record', 'longtext').notNullable();
            table.unique(['kind', 'source_key']);
        });
    }

    await knex.transaction(async tx => {
        // MariaDB commits DDL independently. Preserve the original once even if
        // the migration is retried after a later schema operation fails.
        if (await tx(archiveTable).where({kind: '_migration', source_key: 'v2'}).first()) {
            return;
        }

        async function archive(kind, key, row) {
            await tx(archiveTable).insert({
                kind, source_key: key, name: row.name || row.subject || key, record: JSON.stringify(row)
            });
        }

        for (const [table, keys] of Object.entries(retiredTables)) {
            if (!await tx.schema.hasTable(table)) {
                continue;
            }
            let offset = 0;
            while (true) {
                const rows = await tx(table).select('*').orderBy(keys).limit(250).offset(offset);
                for (const row of rows) {
                    await archive(table, keys.map(key => row[key]).join(':'), row);
                }
                if (rows.length < 250) {
                    break;
                }
                offset += rows.length;
            }
        }

        const templates = await tx('templates').whereNotIn('type', editors);
        for (const template of templates) {
            await archive('templates', String(template.id), template);
            const {type, data} = htmlEditor(template);
            await tx('templates').where('id', template.id).update({type, data: JSON.stringify(data)});
        }

        // Scan by primary key to bound memory and keep the scan stable while
        // updating rows. Existing regular campaigns keep their schedule.
        for (const table of ['campaigns', 'channels']) {
            let lastId = 0;
            while (true) {
                const rows = await tx(table).where('id', '>', lastId).orderBy('id').limit(250);
                if (!rows.length) {
                    break;
                }
                for (const row of rows) {
                    lastId = row.id;
                    const data = JSON.parse(row.data || '{}');
                    const freeze = table === 'campaigns' && (row.type !== 1 || row.status === 5 || row.status === 6 ||
                        row.parent !== null || row.last_check !== null || row.source === 5);
                    const legacyEditor = data.sourceCustom && data.sourceCustom.type && !editors.includes(data.sourceCustom.type);
                    if (!freeze && !legacyEditor && row.source !== 5) {
                        continue;
                    }

                    await archive(table, String(row.id), row);
                    const update = {};
                    if (legacyEditor) {
                        data.sourceCustom = htmlEditor(data.sourceCustom);
                    }
                    if (row.source === 5) {
                        update.source = CampaignSource.CUSTOM;
                        data.sourceCustom = htmlEditor({});
                    }
                    if (freeze) {
                        data.archivedFromV2 = true;
                        update.status = CampaignStatus.FINISHED;
                        update.scheduled = null;
                        update.start_at = null;
                    }
                    update.data = JSON.stringify(data);
                    await tx(table).where('id', row.id).update(update);
                }
            }
        }

        const triggered = await tx('queued').where('type', 1);
        for (const message of triggered) {
            await archive('queued', String(message.id), message);
        }
        await tx('queued').where('type', 1).del();

        const shares = require('../models/shares');
        const roleUpdates = shares.getV2RoleUpdates(await tx('users').select('id', 'username', 'role'));
        for (const update of roleUpdates) {
            await tx('users').where('id', update.id).update({role: update.role});
        }

        await tx('campaigns').where('status', 7).update({status: CampaignStatus.SENDING});
        await tx('campaigns').where('status', 8).update({status: CampaignStatus.PAUSING});
        await tx('queued').where('type', 2).update({type: 1}); // TEST
        await tx('queued').where('type', 3).update({type: 2}); // SUBSCRIPTION
        await tx('queued').where('type', 4).update({type: 3}); // API_TRANSACTIONAL
        await archive('_migration', 'v2', {});
    });
}

function canViewArchive(context) {
    if (!context.user || context.user.restrictedAccessHandler) {
        return false;
    }
    const role = config.roles.global[context.user.role];
    return !!role && role.admin === true;
}

module.exports = {archiveV2, archiveTable, canViewArchive};
