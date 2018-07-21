const { MailerType, getSystemSendConfigurationId } = require('../../../shared/send-configurations');
const {getGlobalNamespaceId} = require('../../../shared/namespaces');

exports.up = (knex, Promise) => (async() =>  {
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
    });

    await knex.schema.createTable(`shares_send_configuration`, table => {
        table.integer('entity').unsigned().notNullable().references(`send_configurations.id`).onDelete('CASCADE');
        table.integer('user').unsigned().notNullable().references('users.id').onDelete('CASCADE');
        table.string('role', 128).notNullable();
        table.boolean('auto').defaultTo(false);
        table.primary(['entity', 'user']);
    });

    await knex.schema.createTable(`permissions_send_configuration`, table => {
        table.integer('entity').unsigned().notNullable().references(`send_configurations.id`).onDelete('CASCADE');
        table.integer('user').unsigned().notNullable().references('users.id').onDelete('CASCADE');
        table.string('operation', 128).notNullable();
        table.primary(['entity', 'user', 'operation']);
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
})();


exports.down = (knex, Promise) => (async() =>  {
    await knex.schema
        .dropTable('shares_send_configuration')
        .dropTable('permissions_send_configuration')
        .dropTable('send_configurations')
    ;
})();
