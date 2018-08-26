const { CampaignSource, CampaignType} = require('../../../shared/campaigns');
const files = require('../../../models/files');
const contextHelpers = require('../../../lib/context-helpers');
const mosaicoTemplates = require('../../../shared/mosaico-templates');
const {getGlobalNamespaceId} = require('../../../shared/namespaces');
const entityTypesAddNamespace = ['list', 'custom_form', 'template', 'campaign', 'report', 'report_template', 'user'];
const shareableEntityTypes = ['list', 'custom_form', 'template', 'campaign', 'report', 'report_template', 'namespace', 'send_configuration', 'mosaico_template'];
const { MailerType, getSystemSendConfigurationId } = require('../../../shared/send-configurations');
const { enforce } = require('../../../lib/helpers');
const { EntityVals: TriggerEntityVals, EventVals: TriggerEventVals } = require('../../../shared/triggers');
const { SubscriptionSource } = require('../../../shared/lists');

const entityTypesWithFiles = {
    campaign: {
        file: 'files_campaign_file',
        attachment: 'files_campaign_attachment',
    },
    template: {
        file: 'files_template_file'
    },
    mosaico_template: {
        file: 'files_mosaico_template_file',
        block: 'files_mosaico_template_block'
    }
};

function fromDbKey(key) {
    let prefix = '';
    if (key.startsWith('_')) {
        key = key.substring(1);
        prefix = '_';

    }
    return prefix + key.replace(/[_-]([a-z])/g, (m, c) => c.toUpperCase());
}

async function migrateBase(knex) {
    /* This is shows what it would look like when we specify the "users" table with Knex.
       In some sense, this is probably the most complicated table we have in Mailtrain.

        return knex.schema.hasTable('users'))
            .then(exists => {
                if (!exists) {
                    return knex.schema.createTable('users', table => {
                        table.increments('id').primary();
                        table.string('username').notNullable();
                        table.string('password').notNullable();
                        table.string('email').notNullable();
                        table.string('access_token', 40).index();
                        table.string('reset_token').index();
                        table.dateTime('reset_expire');
                        table.timestamp('created').defaultTo(knex.fn.now());
                    })

                    // INNODB tables have the limit of 767 bytes for an index.
                    // Combined with the charset used, this poses limits on the size of keys. Knex does not offer API
                    // for such settings, thus we resort to raw queries.
                    .raw('ALTER TABLE `users` MODIFY `email` VARCHAR(255) CHARACTER SET utf8 NOT NULL')
                    .raw('ALTER TABLE `users` ADD UNIQUE KEY `email` (`email`)')
                    .raw('ALTER TABLE `users` ADD KEY `username` (`username`(191))')
                    .raw('ALTER TABLE `users` ADD KEY `check_reset` (`username`(191),`reset_token`,`reset_expire`)')

                    .then(() => knex('users').insert({
                        id: 1,
                        username: 'admin',
                        password: '$2a$10$FZV.tFT252o4iiHoZ9b2sOZOc.EBDOcY2.9HNCtNwshtSLf21mB1i',
                        email: 'hostmaster@sathyasai.org'
                    }));
                }
            });
    */

    // Original Mailtrain migration is executed before this one. So here we check that the original migration
    // ended where it should have and we take it from here.
    const row = await knex('settings').where({key: 'db_schema_version'}).first('value');
    if (!row || Number(row.value) !== 33) {
        throw new Error('Unsupported DB schema version: ' + row.value);
    }

    // We have to update data types of primary keys and related foreign keys. Mailtrain uses unsigned int(11), while
    // Knex uses unsigned int (which is unsigned int(10) ).
    await knex.schema
        .raw('ALTER TABLE `attachments` MODIFY `id` int unsigned not null auto_increment')
        .raw('ALTER TABLE `attachments` MODIFY `campaign` int unsigned not null')

        .raw('ALTER TABLE `campaign` MODIFY `id` int unsigned not null auto_increment')
        .raw('ALTER TABLE `campaign` MODIFY `list` int unsigned not null')
        .raw('ALTER TABLE `campaign` MODIFY `segment` int unsigned not null')
        .raw('ALTER TABLE `campaign` MODIFY `subscription` int unsigned not null')

        .raw('ALTER TABLE `campaign_tracker` MODIFY `list` int unsigned not null')
        .raw('ALTER TABLE `campaign_tracker` MODIFY `subscriber` int unsigned not null')

        .raw('ALTER TABLE `campaigns` MODIFY `id` int unsigned not null auto_increment')
        .raw('ALTER TABLE `campaigns` MODIFY `parent` int unsigned default null')
        .raw('ALTER TABLE `campaigns` MODIFY `list` int unsigned not null')
        .raw('ALTER TABLE `campaigns` MODIFY `segment` int unsigned default null')
        .raw('ALTER TABLE `campaigns` MODIFY `template` int unsigned not null')

        .raw('ALTER TABLE `confirmations` MODIFY `id` int unsigned not null auto_increment')
        .raw('ALTER TABLE `confirmations` MODIFY `list` int unsigned not null')

        .raw('ALTER TABLE `custom_fields` MODIFY `id` int unsigned not null auto_increment')
        .raw('ALTER TABLE `custom_fields` MODIFY `list` int unsigned not null')
        .raw('ALTER TABLE `custom_fields` MODIFY `group` int unsigned default null')

        .raw('ALTER TABLE `custom_forms` MODIFY `id` int unsigned not null auto_increment')
        .raw('ALTER TABLE `custom_forms` MODIFY `list` int unsigned not null')

        .raw('ALTER TABLE `custom_forms_data` MODIFY `id` int unsigned not null auto_increment')
        .raw('ALTER TABLE `custom_forms_data` MODIFY `form` int unsigned not null')

        .raw('ALTER TABLE `import_failed` MODIFY `id` int unsigned not null auto_increment')
        .raw('ALTER TABLE `import_failed` MODIFY `import` int unsigned not null')

        .raw('ALTER TABLE `importer` MODIFY `id` int unsigned not null auto_increment')
        .raw('ALTER TABLE `importer` MODIFY `list` int unsigned not null')

        .raw('ALTER TABLE `links` MODIFY `id` int unsigned not null auto_increment')
        .raw('ALTER TABLE `links` MODIFY `campaign` int unsigned not null')

        .raw('ALTER TABLE `lists` MODIFY `id` int unsigned not null auto_increment')

        .raw('ALTER TABLE `queued` MODIFY `list` int unsigned not null')
        .raw('ALTER TABLE `queued` MODIFY `campaign` int unsigned not null')
        .raw('ALTER TABLE `queued` MODIFY `subscriber` int unsigned not null')

        .raw('ALTER TABLE `reports` MODIFY `id` int unsigned not null auto_increment')
        .raw('ALTER TABLE `reports` MODIFY `report_template` int unsigned not null')

        .raw('ALTER TABLE `report_templates` MODIFY `id` int unsigned not null auto_increment')

        .raw('ALTER TABLE `rss` MODIFY `id` int unsigned not null auto_increment')
        .raw('ALTER TABLE `rss` MODIFY `parent` int unsigned not null')
        .raw('ALTER TABLE `rss` MODIFY `campaign` int unsigned default null')

        .raw('ALTER TABLE `segment_rules` MODIFY `id` int unsigned not null auto_increment')
        .raw('ALTER TABLE `segment_rules` MODIFY `segment` int unsigned not null')

        .raw('ALTER TABLE `segments` MODIFY `id` int unsigned not null auto_increment')
        .raw('ALTER TABLE `segments` MODIFY `list` int unsigned not null')

        .raw('ALTER TABLE `subscription` MODIFY `id` int unsigned not null auto_increment')

        .raw('ALTER TABLE `templates` MODIFY `id` int unsigned not null auto_increment')

        .raw('ALTER TABLE `trigger` MODIFY `list` int unsigned not null')
        .raw('ALTER TABLE `trigger` MODIFY `subscription` int unsigned not null')

        .raw('ALTER TABLE `triggers` MODIFY `id` int unsigned not null auto_increment')
        .raw('ALTER TABLE `triggers` MODIFY `list` int unsigned not null')
        .raw('ALTER TABLE `triggers` MODIFY `segment` int unsigned not null')
        .raw('ALTER TABLE `triggers` MODIFY `source_campaign` int unsigned default null')
        .raw('ALTER TABLE `triggers` MODIFY `dest_campaign` int unsigned default null')

        .raw('ALTER TABLE `users` MODIFY `id` int unsigned not null auto_increment');


}

async function addNamespaces(knex) {
    await knex.schema.createTable('namespaces', table => {
        table.increments('id').primary();
        table.string('name');
        table.text('description');
        table.integer('namespace').unsigned().references('namespaces.id');
    });

    await knex('namespaces').insert({
        id: getGlobalNamespaceId(),
        name: 'Root',
        description: 'Root namespace'
    });

    for (const entityType of entityTypesAddNamespace) {
        await knex.schema.table(`${entityType}s`, table => {
            table.integer('namespace').unsigned().notNullable();
        });

        await knex(`${entityType}s`).update({
            namespace: getGlobalNamespaceId()
        });

        await knex.schema.table(`${entityType}s`, table => {
            table.foreign('namespace').references('namespaces.id');
        });
    }
}

async function addPermissions(knex) {
    for (const entityType of shareableEntityTypes) {
        await knex.schema
            .createTable(`shares_${entityType}`, table => {
                table.integer('entity').unsigned().notNullable().references(`${entityType}s.id`).onDelete('CASCADE');
                table.integer('user').unsigned().notNullable().references('users.id').onDelete('CASCADE');
                table.string('role', 128).notNullable();
                table.boolean('auto').defaultTo(false);
                table.primary(['entity', 'user']);
            })
            .createTable(`permissions_${entityType}`, table => {
                table.integer('entity').unsigned().notNullable().references(`${entityType}s.id`).onDelete('CASCADE');
                table.integer('user').unsigned().notNullable().references('users.id').onDelete('CASCADE');
                table.string('operation', 128).notNullable();
                table.primary(['entity', 'user', 'operation']);
            });
    }
    /* The global share for admin is set automatically in rebuildPermissions, which is called upon every start */

    await knex.schema
        .createTable('generated_role_names', table => {
            table.string('entity_type', 32).notNullable();
            table.string('role', 128).notNullable();
            table.string('name');
            table.string('description');
            table.primary(['entity_type', 'role']);
        });
    /* The generate_role_names table is repopulated in regenerateRoleNamesTable, which is called upon every start */
}

async function migrateUsers(knex) {
    await knex.schema.table('users', table => {
        // name and password can be null in case of LDAP login
        table.string('name');
        table.string('password').alter();
        table.string('role');
    });
    /* The user role is set automatically in rebuild permissions, which is called upon every start */

    await knex('users').where('id', 1 /* Admin user id */).update({
        name: 'Administrator'
    });
}

async function migrateSubscriptions(knex) {
    await knex.schema.dropTableIfExists('subscription');

    const lists = await knex('lists');
    for (const list of lists) {
        await knex.schema.raw('ALTER TABLE `subscription__' + list.id + '` ADD `source_email` int(10) unsigned DEFAULT NULL');
        await knex.schema.raw('ALTER TABLE `subscription__' + list.id + '` ADD `hash_email` varchar(255) CHARACTER SET ascii');


        const fields = await knex('custom_fields').where('list', list.id);
        for (const field of fields) {
            if (field.column != null) {
                await knex.schema.raw('ALTER TABLE `subscription__' + list.id + '` ADD `source_' + field.column +'` int(11) DEFAULT NULL');
            }
        }

        const subscriptionsStream = knex('subscription__' + list.id).stream();
        let subscription;
        while ((subscription = subscriptionsStream.read()) != null) {
            subscription.hash_email = crypto.createHash('sha512').update(subscription.email).digest("base64");
            subscription.source_email = subscription.imported ? SubscriptionSource.IMPORTED_V1 : SubscriptionSource.NOT_IMPORTED_V1;
            for (const field of fields) {
                if (field.column != null) {
                    subscription['source_' + field.column] = subscription.imported ? SubscriptionSource.IMPORTED_V1 : SubscriptionSource.NOT_IMPORTED_V1;
                }
            }

            await knex('subscription__' + list.id).where('id', subscription.id).update(subscription);
        }

        await knex.schema.raw('ALTER TABLE `subscription__' + list.id + '` MODIFY `hash_email` varchar(255) CHARACTER SET ascii NOT NULL');

        await knex.schema.table('subscription__' + list.id, table => {
            table.dropColumn('imported');
        });
    }
}

async function migrateCustomForms(knex) {
    // -----------------------------------------------------------------------------------------------------
    // Drop id in custom forms data
    // -----------------------------------------------------------------------------------------------------
    await knex.schema.table('custom_forms_data', table => {
        table.dropColumn('id');
        table.string('data_key', 128).alter();
        table.primary(['form', 'data_key']);
    })


    // -----------------------------------------------------------------------------------------------------
    // Make custom forms independent of list
    // -----------------------------------------------------------------------------------------------------
    await knex.schema.table('custom_forms', table => {
        table.dropForeign('list', 'custom_forms_ibfk_1');
        table.dropColumn('list');
    });
}

async function migrateCustomFields(knex) {
    // -----------------------------------------------------------------------------------------------------
    // Move form field order to custom fileds and make all fields configurable
    // -----------------------------------------------------------------------------------------------------
    await knex.schema.table('custom_fields', table => {
        table.integer('order_subscribe');
        table.integer('order_manage');
        table.integer('order_list');
    });

    const lists = await knex('lists')
        .leftJoin('custom_forms', 'lists.default_form', 'custom_forms.id')
        .select(['lists.id', 'lists.default_form', 'custom_forms.fields_shown_on_subscribe', 'custom_forms.fields_shown_on_manage']);

    for (const list of lists) {
        const fields = await knex('custom_fields').where('list', list.id).orderBy('id', 'asc');

        const [firstNameFieldId] = await knex('custom_fields').insert({
            list: list.id,
            name: 'First Name',
            key: 'FIRST_NAME',
            type: 'text',
            column: 'first_name',
            visible: 1
        });

        const [lastNameFieldId] = await knex('custom_fields').insert({
            list: list.id,
            name: 'Last Name',
            key: 'LAST_NAME',
            type: 'text',
            column: 'last_name',
            visible: 1
        });

        let orderSubscribe;
        let orderManage;

        const replaceNames = x => {
            if (x === 'firstname') {
                return firstNameFieldId;
            } else if (x === 'lastname') {
                return lastNameFieldId;
            } else {
                return x;
            }
        };

        if (list.default_form) {
            orderSubscribe = list.fields_shown_on_subscribe.split(',').map(replaceNames);
            orderManage = list.fields_shown_on_subscribe.split(',').map(replaceNames);
        } else {
            orderSubscribe = [firstNameFieldId, lastNameFieldId];
            orderManage = [firstNameFieldId, lastNameFieldId];

            for (const fld of fields) {
                if (fld.visible && fld.type !== 'option') {
                    orderSubscribe.push(fld.id);
                    orderManage.push(fld.id);
                }
            }
        }

        const orderList = [firstNameFieldId, lastNameFieldId];
        for (const fld of fields) {
            if (fld.visible && fld.type === 'text') {
                orderList.push(fld.id);
            }
        }

        let idx = 0;
        for (const fldId of orderSubscribe) {
            await knex('custom_fields').where('id', fldId).update({order_subscribe: idx});
            idx += 1;
        }

        idx = 0;
        for (const fldId of orderManage) {
            await knex('custom_fields').where('id', fldId).update({order_manage: idx});
            idx += 1;
        }

        idx = 0;
        for (const fldId of orderList) {
            await knex('custom_fields').where('id', fldId).update({order_list: idx});
            idx += 1;
        }
    }

    await knex.schema.table('custom_forms', table => {
        table.dropColumn('fields_shown_on_subscribe');
        table.dropColumn('fields_shown_on_manage');
    });

    await knex.schema.table('custom_fields', table => {
        table.dropColumn('visible');
    });


    // -----------------------------------------------------------------------------------------------------
    // Upgrade custom fields
    // -----------------------------------------------------------------------------------------------------
    await knex.schema.table('custom_fields', table => {
        table.text('settings', 'longtext');
    });

    await knex.schema.table('custom_fields', table => {
        table.dropForeign('list', 'custom_fields_ibfk_1');
        table.foreign('list').references('lists.id');
    });

    const fields = await knex('custom_fields');

    for (const field of fields) {
        const settings = {};
        let type = field.type;

        if (type === 'json') {
            settings.groupTemplate = field.group_template;
        }

        if (['checkbox', 'dropdown', 'radio'].includes(type)) {
            settings.groupTemplate = field.group_template;
            type = type + '-grouped';
        }

        if (type === 'date-eur') {
            type = 'date';
            settings.dateFormat = 'eur';
        }

        if (type === 'date-us') {
            type = 'date';
            settings.dateFormat = 'us';
        }

        if (type === 'birthday-eur') {
            type = 'birthday';
            settings.dateFormat = 'eur';
        }

        if (type === 'birthday-us') {
            type = 'birthday';
            settings.dateFormat = 'us';
        }

        await knex('custom_fields').where('id', field.id).update({type, settings: JSON.stringify(settings)});
    }

    await knex.schema.table('custom_fields', table => {
        table.dropColumn('group_template');
    });
}

async function migrateSegments(knex) {
    // -----------------------------------------------------------------------------------------------------
    // Upgrade segments
    // -----------------------------------------------------------------------------------------------------
    await knex.schema.table('segments', table => {
        table.text('settings', 'longtext');
    });

    await knex.schema.table('segments', table => {
        table.dropForeign('list', 'segments_ibfk_1');
        table.foreign('list').references('lists.id');
    });


    const segments = await knex('segments');

    for (const segment of segments) {
        const oldRules = await knex('segment_rules').where('segment', segment.id);

        let type;
        if (segment.type === 1) {
            type = 'all';
        } else {
            type = 'some';
        }

        const rules = [];
        for (const oldRule of oldRules) {
            const oldSettings = JSON.parse(oldRule.value);

            const predefColumns = {
                email: 'string',
                opt_in_country: 'string',
                created: 'date',
                latest_open: 'date',
                latest_click: 'date'
            };
            // first_name and last_name are not here because they have been already converted to custom fields by 20170731072050_upgrade_custom_fields.js

            let fieldType;
            if (oldRule.column in predefColumns) {
                fieldType = predefColumns[oldRule.column];
            } else {
                const field = await knex('custom_fields').where({list: segment.list, column: oldRule.column}).select(['type']).first();
                if (field) {
                    fieldType = field.type;
                }
            }

            switch (fieldType) {
                case 'text':
                case 'website':
                    rules.push({ column: oldRule.column, value: oldSettings.value });
                    break;
                case 'number':
                    if (oldSettings.range) {
                        if (oldSettings.start && oldSettings.end) {
                            if (type === 'all') {
                                rules.push({ type: 'ge', column: oldRule.column, value: oldSettings.start});
                                rules.push({ type: 'lt', column: oldRule.column, value: oldSettings.end});
                            } else {
                                rules.push({
                                    type: 'all',
                                    rules: [
                                        {type: 'ge', value: oldSettings.start},
                                        {type: 'lt', value: oldSettings.end}
                                    ]
                                });
                            }
                        } else if (oldSettings.start) {
                            rules.push({ type: 'ge', column: oldRule.column, value: oldSettings.start  });
                        }
                        if (oldSettings.end) {
                            rules.push({ type: 'lt', column: oldRule.column, value: oldSettings.end  });
                        }
                    } else {
                        rules.push({ type: 'eq', column: oldRule.column, value: oldSettings.value  });
                    }
                    break;
                case 'birthday':
                    if (oldSettings.range) {
                        if (oldSettings.start && oldSettings.end) {
                            if (type === 'all') {
                                rules.push({ type: 'ge', column: oldRule.column, value: oldSettings.start});
                                rules.push({ type: 'le', column: oldRule.column, value: oldSettings.end});
                            } else {
                                rules.push({
                                    type: 'all',
                                    rules: [
                                        { type: 'ge', column: oldRule.column, value: oldSettings.start},
                                        { type: 'le', column: oldRule.column, value: oldSettings.end}
                                    ]
                                });
                            }
                        } else if (oldSettings.start) {
                            rules.push({ type: 'ge', column: oldRule.column, value: oldSettings.start  });
                        }
                        if (oldSettings.end) {
                            rules.push({ type: 'le', column: oldRule.column, value: oldSettings.end  });
                        }
                    } else {
                        rules.push({ type: 'eq', column: oldRule.column, value: oldSettings.value  });
                    }
                    break;
                case 'date':
                    if (oldSettings.relativeRange) {
                        if (oldSettings.start && oldSettings.end) {
                            if (type === 'all') {
                                rules.push({ type: 'geTodayPlusDays', column: oldRule.column, value: oldSettings.start});
                                rules.push({ type: 'leTodayPlusDays', column: oldRule.column, value: oldSettings.end});
                            } else {
                                rules.push({
                                    type: 'all',
                                    rules: [
                                        { type: 'geTodayPlusDays', column: oldRule.column, value: oldSettings.start},
                                        { type: 'leTodayPlusDays', column: oldRule.column, value: oldSettings.end}
                                    ]
                                });
                            }
                        } else if (oldSettings.start) {
                            rules.push({ type: 'geTodayPlusDays', column: oldRule.column, value: oldSettings.startDirection ? oldSettings.start : -oldSettings.start  });
                        }
                        if (oldSettings.end) {
                            rules.push({ type: 'leTodayPlusDays', column: oldRule.column, value: oldSettings.endDirection ? oldSettings.end : -oldSettings.end  });
                        }
                    } else if (oldSettings.range) {
                        if (oldSettings.start && oldSettings.end) {
                            if (type === 'all') {
                                rules.push({ type: 'ge', column: oldRule.column, value: oldSettings.start});
                                rules.push({ type: 'le', column: oldRule.column, value: oldSettings.end});
                            } else {
                                rules.push({
                                    type: 'all',
                                    rules: [
                                        { type: 'ge', column: oldRule.column, value: oldSettings.start},
                                        { type: 'le', column: oldRule.column, value: oldSettings.end}
                                    ]
                                });
                            }
                        } else if (oldSettings.start) {
                            rules.push({ type: 'ge', column: oldRule.column, value: oldSettings.start  });
                        }
                        if (oldSettings.end) {
                            rules.push({ type: 'le', column: oldRule.column, value: oldSettings.end  });
                        }
                    } else {
                        rules.push({ type: 'eq', column: oldRule.column, value: oldSettings.value  });
                    }
                    break;
                case 'option':
                    rules.push({ type: 'eq', column: oldRule.column, value: oldSettings.value  });
                    break;
                default:
                    throw new Error(`Unknown rule for column ${oldRule.column} with field type ${fieldType}`);
            }
        }

        const settings = {
            rootRule: {
                type,
                rules
            }
        };

        await knex('segments').where('id', segment.id).update({settings: JSON.stringify(settings)});
    }

    await knex.schema.table('segments', table => {
        table.dropColumn('type');
    });

    await knex.schema.dropTable('segment_rules');
}

async function migrateReports(knex) {
    // -----------------------------------------------------------------------------------------------------
    // Remove cascading delete in reports
    // -----------------------------------------------------------------------------------------------------
    await knex.schema.table('reports', table => {
        table.dropForeign('report_template', 'report_template_ibfk_1');
        table.foreign('report_template').references('report_templates.id');
    });
}

async function migrateSettings(knex) {
    // -----------------------------------------------------------------------------------------------------
    // Convert settings to camel case
    // -----------------------------------------------------------------------------------------------------
    const rows = await knex('settings');

    for (const row of rows) {
        await knex('settings').where('id', row.id).update('key', fromDbKey(row.key))
    }

    // -----------------------------------------------------------------------------------------------------
    // Delete schema version
    // -----------------------------------------------------------------------------------------------------
    await knex('settings').where('key', 'dbSchemaVersion').del();

    // -----------------------------------------------------------------------------------------------------
    // Transforms settings and add send configurations
    // -----------------------------------------------------------------------------------------------------
    await knex.schema.createTable('send_configurations', table => {
        table.increments('id').primary();
        table.string('name');
        table.text('description');
        table.string('from_email');
        table.boolean('from_email_overridable').defaultTo(false);
        table.string('from_name');
        table.boolean('from_name_overridable').defaultTo(false);
        table.string('reply_to');
        table.boolean('reply_to_overridable').defaultTo(false);
        table.string('subject');
        table.boolean('subject_overridable').defaultTo(false);
        table.string('verp_hostname'); // VERP is not used if verp_hostname is null
        table.string('mailer_type');
        table.text('mailer_settings', 'longtext');
        table.timestamp('created').defaultTo(knex.fn.now());
        table.integer('namespace').unsigned().references('namespaces.id');
        table.string('x_mailer');
    });

    await knex.schema.table('lists', table => {
        table.string('contact_email');
        table.string('homepage');
        table.integer('send_configuration').unsigned().references(`send_configurations.id`);
    });

    const settingsRows = await knex('settings').select(['key', 'value']);
    const settings = {};
    for (const row of settingsRows) {
        settings[row.key] = row.value;
    }

    await knex('lists').update({contact_email: settings.defaultAddress});
    await knex('lists').update({homepage: settings.defaultHomepage});

    let mailer_settings;
    let mailer_type;
    if (settings.mailTransport === 'ses') {
        mailer_type = MailerType.AWS_SES;
        mailer_settings = {
            key: settings.sesKey,
            secret: settings.sesSecret,
            region: settings.sesSecret,
            maxConnections: Number(settings.smtpMaxConnections),
            throttling: Number(settings.smtpThrottling),
            logTransactions: !!settings.smtpLog
        };
    } else {
        mailer_type = MailerType.GENERIC_SMTP;
        mailer_settings = {
            hostname: settings.smtpHostname,
            port: Number(settings.smtpPort),
            encryption: settings.smtpEncryption,
            useAuth: !settings.smtpDisableAuth,
            user: settings.smtpUser,
            password: settings.smtpPass,
            allowSelfSigned: settings.smtpSelfSigned,
            maxConnections: Number(settings.smtpMaxConnections),
            maxMessages: Number(settings.smtpMaxMessages),
            throttling: Number(settings.smtpThrottling),
            logTransactions: !!settings.smtpLog
        };

        if (settings.dkimApiKey) {
            mailer_type = MailerType.ZONE_MTA;
            mailer_settings.dkimApiKey = settings.dkimApiKey;
            mailer_settings.dkimDomain = settings.dkimDomain;
            mailer_settings.dkimSelector = settings.dkimSelector;
            mailer_settings.dkimPrivateKey = settings.dkimPrivateKey;
        }
    }

    await knex('send_configurations').insert({
        id: getSystemSendConfigurationId(),
        name: 'System',
        description: 'Send configuration used to deliver system emails',
        from_email: settings.defaultAddress,
        from_email_overridable: true,
        from_name: settings.defaultFrom,
        from_name_overridable: true,
        reply_to: settings.defaultAddress,
        reply_to_overridable: true,
        subject: settings.defaultSubject,
        subject_overridable: true,
        verp_hostname: settings.verpUse ? settings.verpHostname : null,
        mailer_type,
        mailer_settings: JSON.stringify(mailer_settings),
        x_mailer: settings.x_mailer,
        namespace: getGlobalNamespaceId()
    });

    await knex('lists').update({send_configuration: getSystemSendConfigurationId()});

    await knex('settings').del();
    await knex('settings').insert([
        { key: 'uaCode', value: settings.uaCode },
        { key: 'shoutout', value: settings.shoutout },
        { key: 'adminEmail', value: settings.adminEmail },
        { key: 'defaultHomepage', value: settings.defaultHomepage },
        { key: 'pgpPassphrase', value: settings.pgpPassphrase },
        { key: 'pgpPrivateKey', value: settings.pgpPrivateKey }
    ]);

}

async function addFiles(knex) {
    for (const type in entityTypesWithFiles) {
        const typeEntry = entityTypesWithFiles[type];

        for (const subType in typeEntry) {
            const subTypeEntry = typeEntry[subType];

            await knex.schema.createTable(subTypeEntry, table => {
                table.increments('id').primary();
                table.integer('entity').unsigned().notNullable().references(`${type}s.id`);
                table.string('filename');
                table.string('originalname');
                table.string('mimetype');
                table.integer('size');
                table.timestamp('created').defaultTo(knex.fn.now());
                table.index(['entity', 'originalname'])
            });
        }
    }
}

async function migrateTemplates(knex) {
    await knex.schema.table('templates', table => {
        table.text('data', 'longtext');
        table.string('type');
    });

    const templates = await knex('templates');

    for (const template of templates) {
        let type = template.editor_name;
        const data = JSON.parse(template.editor_data || '{}');

        if (type == 'summernote') {
            type = 'ckeditor';
        }

        if (type == 'mosaico') {
            type = 'mosaicoWithFsTemplate';
            data.mosaicoFsTemplate = data.template;
            delete data.template;
        }

        await knex('templates').where('id', template.id).update({type, data: JSON.stringify(data)});
    }

    await knex.schema.table('templates', table => {
        table.dropColumn('editor_name');
        table.dropColumn('editor_data');
    });
}

async function addMosaicoTemplates(knex) {
    await knex.schema.createTable('mosaico_templates', table => {
        table.increments('id').primary();
        table.string('name');
        table.text('description');
        table.string('type');
        table.text('data', 'longtext');
        table.timestamp('created').defaultTo(knex.fn.now());
        table.integer('namespace').unsigned().references('namespaces.id');
    });

    const versafix = {
        name: 'Versafix One',
        description: 'Default Mosaico Template',
        type: 'html',
        namespace: 1,
        data: JSON.stringify({
            html: mosaicoTemplates.getVersafix()
        })
    };

    await knex('mosaico_templates').insert(versafix);
}

async function migrateCampaigns(knex) {
    /*
    This is how we refactor the original campaigns table.

        +-------------------------+---------------------+------+-----+-------------------+----------------+
        | Field                   | Type                | Null | Key | Default           | Extra          |
        +-------------------------+---------------------+------+-----+-------------------+----------------+
    OK  | id                      | int(10) unsigned    | NO   | PRI | NULL              | auto_increment |
    OK  | cid                     | varchar(255)        | NO   | UNI | NULL              |                |
    OK  | type                    | tinyint(4) unsigned | NO   | MUL | 1                 |                |
    OK  | parent                  | int(10) unsigned    | YES  | MUL | NULL              |                |
    OK  | name                    | varchar(255)        | NO   | MUL |                   |                |
    OK  | description             | text                | YES  |     | NULL              |                |
    OK  | list                    | int(10) unsigned    | NO   |     | NULL              |                |
    OK  | segment                 | int(10) unsigned    | YES  |     | NULL              |                |
    X   | template                | int(10) unsigned    | NO   |     | NULL              |                |
    X   | source_url              | varchar(255)        | YES  |     | NULL              |                |
    X   | editor_name             | varchar(50)         | YES  |     |                   |                |
    X   | editor_data             | longtext            | YES  |     | NULL              |                |
    OK  | last_check              | timestamp           | YES  | MUL | NULL              |                |
    X   | check_status            | varchar(255)        | YES  |     | NULL              |                |
    OK  | from -> from_name_override     | varchar(255) | YES  |     |                   |                |
    OK  | address -> from_email_override | varchar(255) | YES  |     |                   |                |
    OK  | reply_to -> reply_to_override  | varchar(255) | YES  |     |                   |                |
    OK  | subject -> subject_override    | varchar(255) | YES  |     |                   |                |
    X   | html                    | longtext            | YES  |     | NULL              |                |
    X   | html_prepared           | longtext            | YES  |     | NULL              |                |
    X   | text                    | longtext            | YES  |     | NULL              |                |
    OK  | status                  | tinyint(4) unsigned | NO   | MUL | 1                 |                |
    OK  | scheduled               | timestamp           | YES  | MUL | NULL              |                |
    X   | status_change           | timestamp           | YES  |     | NULL              |                |
    OK  | delivered               | int(11) unsigned    | NO   |     | 0                 |                |
    OK  | blacklisted             | int(11) unsigned    | NO   |     | 0                 |                |
    OK  | opened                  | int(11) unsigned    | NO   |     | 0                 |                |
    OK  | clicks                  | int(11) unsigned    | NO   |     | 0                 |                |
    OK  | unsubscribed            | int(11) unsigned    | NO   |     | 0                 |                |
    OK  | bounced                 | int(1) unsigned     | NO   |     | 0                 |                |
    OK  | complained              | int(1) unsigned     | NO   |     | 0                 |                |
    OK  | created                 | timestamp           | NO   |     | CURRENT_TIMESTAMP |                |
    OK  | open_tracking_disabled  | tinyint(4) unsigned | NO   |     | 0                 |                |
    OK  | click_tracking_disabled | tinyint(4) unsigned | NO   |     | 0                 |                |
    OK  | namespace               | int(10) unsigned    | NO   | MUL | NULL              |                |
        +-------------------------+---------------------+------+-----+-------------------+----------------+

    New columns:
        +-------------------------+---------------------+------+-----+-------------------+----------------+
        | data                    | longtext            | NO   |     | NULL              |                |
        | source                  | int(10) unsigned    | NO   |     |                   |                |
        | send_configuration      | int(10) unsigned    | NO   |     |                   |                |
        +-------------------------+---------------------+------+-----+-------------------+----------------+

    list - we will probably need some strategy how to consistently treat stats when list/segment changes
    parent - used only for campaign type RSS
    last_check - used only for campaign type RSS
    scheduled - used only for campaign type NORMAL
     */

    await knex.schema.table('campaigns', table => {
        table.text('data', 'longtext');
        table.integer('source').unsigned().notNullable();

        // Add a default values, such that the new column has some valid non-null value
        table.integer('send_configuration').unsigned().notNullable().references(`send_configurations.id`).defaultTo(getSystemSendConfigurationId());
    });

    const campaigns = await knex('campaigns');

    for (const campaign of campaigns) {
        const data = {};

        if (campaign.type === CampaignType.REGULAR || campaign.type === CampaignType.RSS_ENTRY || campaign.type === CampaignType.REGULAR || campaign.type === CampaignType.TRIGGERED) {
            if (campaign.template) {
                let editorType = campaign.editor_name;
                const editorData = JSON.parse(campaign.editor_data || '{}');

                if (editorType === 'summernote') {
                    editorType = 'ckeditor';
                }

                if (editorType === 'mosaico') {
                    editorType = 'mosaicoWithFsTemplate';
                    editorData.mosaicoFsTemplate = editorData.template;
                    delete editorData.template;
                }

                campaign.source = CampaignSource.CUSTOM_FROM_TEMPLATE;
                data.sourceCustom = {
                    type: editorType,
                    data: editorData,
                    html: campaign.html,
                    text: campaign.text,
                    htmlPrepared: campaign.html_prepared
                };

                data.sourceTemplate = campaign.template;

                // For source === CampaignSource.TEMPLATE, the data is as follows:
                // data.sourceTemplate = <template id>
            } else {
                campaign.source = CampaignSource.URL;
                data.sourceUrl = campaign.source_url;
            }

        } else if (campaign.type === CampaignType.RSS) {
            campaign.source = CampaignSource.RSS;
            data.feedUrl = campaign.source_url;

            data.checkStatus = campaign.checkStatus;
        }

        campaign.data = JSON.stringify(data);

        await knex('campaigns').where('id', campaign.id).update(campaign);
    }

    await knex.schema.table('campaigns', table => {
        table.dropColumn('template');
        table.dropColumn('source_url');
        table.dropColumn('editor_name');
        table.dropColumn('editor_data');
        table.dropColumn('check_status');
        table.dropColumn('status_change');
        table.dropColumn('html');
        table.dropColumn('html_prepared');
        table.dropColumn('text');
        table.renameColumn('from', 'from_name_override');
        table.renameColumn('address', 'from_email_override');
        table.renameColumn('reply_to', 'reply_to_override');
        table.renameColumn('subject', 'subject_override');
        table.renameColumn('unsubscribe', 'unsubscribe_url');


        // Remove the default value
        table.integer('send_configuration').unsigned().notNullable().alter();
    });

    await knex.schema.dropTableIfExists('campaign');
    await knex.schema.dropTableIfExists('campaign_tracker');
}

async function migrateAttachments(knex) {
    const campaigns = await knex('campaigns');

    for (const campaign of campaigns) {
        const attachments = await knex('attachments').where('campaign', campaign.id);
        const attachmentFiles = [];
        for (const attachment of attachments) {
            attachmentFiles.push({
                originalname: attachment.filename,
                mimetype: attachment.content_type,
                // encoding: file.encoding,
                size: attachment.size,
                created: attachment.created,
                data: attachment.content
            });
        }
        await files.createFiles(contextHelpers.getAdminContext(), 'campaign', 'attachment', campaign.id, attachmentFiles);
    }

    await knex.schema.dropTableIfExists('attachments');
}

async function migrateTriggers(knex) {
    await knex.schema.table('triggers', table => {
        table.renameColumn('rule', 'entity');
        table.renameColumn('column', 'event');
        table.renameColumn('dest_campaign', 'campaign');
        table.renameColumn('seconds', 'seconds_after');
    });

    const triggers = await knex('triggers');

    for (const trigger of triggers) {
        const campaign = await knex('campaigns').where('id', trigger.campaign).first();

        enforce(campaign.list === trigger.list, 'The list of trigger and campaign have to be the same.');

        enforce(trigger.entity in TriggerEntityVals);
        enforce(trigger.event in TriggerEventVals[trigger.entity]);
    }

    await knex.schema.table('triggers', table => {
        table.dropForeign('list', 'triggers_ibfk_1');
        table.dropColumn('list');
        table.dropColumn('segment');
    });

    await knex.schema.dropTableIfExists('trigger');
}

async function migrateImporter(knex) {
    await knex.schema.dropTableIfExists('import_failed');
    await knex.schema.dropTableIfExists('importer');

    await knex.schema.createTable('imports', table => {
        table.increments('id').primary();
        table.string('name');
        table.text('description');
        table.integer('list').unsigned().references('lists.id');
        table.integer('type').unsigned().notNullable();
        table.integer('status').unsigned().notNullable();
        table.text('settings', 'longtext');
        table.text('mapping', 'longtext');
        table.timestamp('last_run');
        table.text('error');
        table.timestamp('created').defaultTo(knex.fn.now());
    });

    await knex.schema.createTable('import_runs', table => {
        table.increments('id').primary();
        table.integer('import').unsigned().references('imports.id');
        table.integer('status').unsigned().notNullable();
        table.text('mapping', 'longtext');
        table.integer('new').defaultTo(0);
        table.integer('failed').defaultTo(0);
        table.integer('processed').defaultTo(0);
        table.text('error');
        table.timestamp('created').defaultTo(knex.fn.now());
        table.timestamp('finished');
    });

    await knex.schema.createTable('import_failed', table => {
        table.increments('id').primary();
        table.integer('run').unsigned().references('import_runs.id');
        table.string('email').notNullable();
        table.text('reason');
        table.timestamp('created').defaultTo(knex.fn.now());
    });
}


exports.up = (knex, Promise) => (async() => {
    await migrateBase(knex);
    await addNamespaces(knex);

    await migrateUsers(knex);
    await migrateSubscriptions(knex);
    await migrateCustomForms(knex);
    await migrateCustomFields(knex);
    await migrateSegments(knex);
    await migrateReports(knex);
    await migrateSettings(knex);
    await migrateTemplates(knex);

    await addMosaicoTemplates(knex);
    await migrateCampaigns(knex);

    await addPermissions(knex);
    await addFiles(knex);

    await migrateAttachments(knex);

    await migrateTriggers(knex);

    await migrateImporter(knex);
})();

exports.down = (knex, Promise) => (async() => {
})();