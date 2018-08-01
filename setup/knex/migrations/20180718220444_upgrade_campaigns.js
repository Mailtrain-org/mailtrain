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

const { getSystemSendConfigurationId } = require('../../../shared/send-configurations');
const { CampaignSource, CampaignType} = require('../../../shared/campaigns');

exports.up = (knex, Promise) => (async() =>  {

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

                if (editorType == 'summernote') {
                    editorType = 'ckeditor';
                }

                if (editorType == 'mosaico') {
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

        // Remove the default value
        table.integer('send_configuration').unsigned().notNullable().alter();
    });

    await knex.schema.dropTableIfExists('campaign');
    await knex.schema.dropTableIfExists('campaign_tracker');
})();

exports.down = (knex, Promise) => (async() =>  {
})();
