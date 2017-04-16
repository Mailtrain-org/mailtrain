'use strict';

let tools = require('../tools');
let db = require('../db');
let lists = require('./lists');
let util = require('util');
let _ = require('../translate')._;
let tableHelpers = require('../table-helpers');

module.exports.defaultColumns = [{
    column: 'created',
    name: _('Sign up date'),
    type: 'date'
}, {
    column: 'latest_open',
    name: _('Latest open'),
    type: 'date'
}, {
    column: 'latest_click',
    name: _('Latest click'),
    type: 'date'
}];

module.exports.defaultCampaignEvents = [{
    option: 'delivered',
    name: _('Delivered')
}, {
    option: 'opened',
    name: _('Has Opened')
}, {
    option: 'clicked',
    name: _('Has Clicked')
}, {
    option: 'not_opened',
    name: _('Not Opened')
}, {
    option: 'not_clicked',
    name: _('Not Clicked')
}];

let defaultColumnMap = {};
let defaultEventMap = {};
module.exports.defaultColumns.forEach(col => defaultColumnMap[col.column] = col.name);
module.exports.defaultCampaignEvents.forEach(evt => defaultEventMap[evt.option] = evt.name);

module.exports.list = callback => {
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        let tableFields = [
            '`triggers`.`id` AS `id`',
            '`triggers`.`name` AS `name`',
            '`triggers`.`description` AS `description`',
            '`triggers`.`enabled` AS `enabled`',
            '`triggers`.`list` AS `list`',
            '`lists`.`name` AS `list_name`',
            '`source`.`id` AS `source_campaign`',
            '`source`.`name` AS `source_campaign_name`',
            '`dest`.`id` AS `dest_campaign`',
            '`dest`.`name` AS `dest_campaign_name`',
            '`triggers`.`count` AS `count`',
            '`custom_fields`.`id` AS `column_id`',
            '`triggers`.`column` AS `column`',
            '`custom_fields`.`name` AS `column_name`',
            '`triggers`.`rule` AS `rule`',
            '`triggers`.`seconds` AS `seconds`',
            '`triggers`.`created` AS `created`'
        ];

        let query = 'SELECT ' + tableFields.join(', ') + ' FROM `triggers` LEFT JOIN `campaigns` `source` ON `source`.`id`=`triggers`.`source_campaign` LEFT JOIN `campaigns` `dest` ON `dest`.`id`=`triggers`.`dest_campaign` LEFT JOIN `lists` ON `lists`.`id`=`triggers`.`list` LEFT JOIN `custom_fields` ON `custom_fields`.`list` = `triggers`.`list` AND `custom_fields`.`column`=`triggers`.`column` ORDER BY `triggers`.`name`';
        connection.query(query, (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            let triggers = (rows || []).map(tools.convertKeys).map(row => {
                if (row.rule === 'subscription' && row.column && !row.columnName) {
                    row.columnName = defaultColumnMap[row.column];
                }

                let days = Math.round(row.seconds / (24 * 3600));
                row.formatted = util.format('%s days after %s', days, row.rule === 'subscription' ? row.columnName : (util.format('%s <a href="/campaigns/view/%s">%s</a>', defaultEventMap[row.column], row.sourceCampaign, row.sourceCampaignName)));

                return row;
            });
            return callback(null, triggers);
        });
    });
};

module.exports.getQuery = (id, callback) => {
    module.exports.get(id, (err, trigger) => {
        if (err) {
            return callback(err);
        }

        let limit = 300;
        let treshold = 3600 * 6; // time..NOW..time+6h, 6 hour window after trigger target to detect it

        let intervalQuery = (column, seconds, treshold) => column + ' <= NOW() - INTERVAL ' + seconds + ' SECOND AND ' + column + ' >= NOW() - INTERVAL ' + (treshold + seconds) + ' SECOND';

        let query = false;
        switch (trigger.rule) {
            case 'subscription':
                query = 'SELECT id FROM `subscription__' + trigger.list + '` subscription WHERE ' + intervalQuery('`' + trigger.column + '`', trigger.seconds, treshold) + ' AND id NOT IN (SELECT subscription FROM `trigger__' + id + '` triggertable WHERE triggertable.`list` = ' + trigger.list + ' AND triggertable.`subscription` = subscription.`id`) LIMIT ' + limit;
                break;
            case 'campaign':
                switch (trigger.column) {
                    case 'delivered':
                        query = 'SELECT subscription.id AS id FROM `subscription__' + trigger.list + '` subscription LEFT JOIN `campaign__' + trigger.sourceCampaign + '` campaign ON campaign.list=' + trigger.list + ' AND subscription.id=campaign.subscription WHERE campaign.status=1 AND ' + intervalQuery('`campaign`.`created`', trigger.seconds, treshold) + ' AND subscription.id NOT IN (SELECT subscription FROM `trigger__' + id + '` triggertable WHERE triggertable.`list` = ' + trigger.list + ' AND triggertable.`subscription` = subscription.`id`) LIMIT ' + limit;
                        break;
                    case 'not_clicked':
                        query = 'SELECT subscription.id AS id FROM `subscription__' + trigger.list + '` subscription LEFT JOIN `campaign__' + trigger.sourceCampaign + '` campaign ON campaign.list=' + trigger.list + ' AND subscription.id=campaign.subscription LEFT JOIN `campaign_tracker__' + trigger.sourceCampaign + '` tracker ON tracker.list=campaign.list AND tracker.subscriber=subscription.id AND tracker.link=0 WHERE campaign.status=1 AND ' + intervalQuery('`campaign`.`created`', trigger.seconds, treshold) + ' AND tracker.created IS NULL AND subscription.id NOT IN (SELECT subscription FROM `trigger__' + id + '` triggertable WHERE triggertable.`list` = ' + trigger.list + ' AND triggertable.`subscription` = subscription.`id`) LIMIT ' + limit;
                        break;
                    case 'not_opened':
                        query = 'SELECT subscription.id AS id FROM `subscription__' + trigger.list + '` subscription LEFT JOIN `campaign__' + trigger.sourceCampaign + '` campaign ON campaign.list=' + trigger.list + ' AND subscription.id=campaign.subscription LEFT JOIN `campaign_tracker__' + trigger.sourceCampaign + '` tracker ON tracker.list=campaign.list AND tracker.subscriber=subscription.id AND tracker.link=-1 WHERE campaign.status=1 AND ' + intervalQuery('`campaign`.`created`', trigger.seconds, treshold) + ' AND tracker.created IS NULL AND subscription.id NOT IN (SELECT subscription FROM `trigger__' + id + '` triggertable WHERE triggertable.`list` = ' + trigger.list + ' AND triggertable.`subscription` = subscription.`id`) LIMIT ' + limit;
                        break;
                    case 'clicked':
                        query = 'SELECT subscription.id AS id FROM `subscription__' + trigger.list + '` subscription LEFT JOIN `campaign__' + trigger.sourceCampaign + '` campaign ON campaign.list=' + trigger.list + ' AND subscription.id=campaign.subscription LEFT JOIN `campaign_tracker__' + trigger.sourceCampaign + '` tracker ON tracker.list=campaign.list AND tracker.subscriber=subscription.id AND tracker.link=0 WHERE campaign.status=1 AND ' + intervalQuery('`tracker`.`created`', trigger.seconds, treshold) + ' AND subscription.id NOT IN (SELECT subscription FROM `trigger__' + id + '` triggertable WHERE triggertable.`list` = ' + trigger.list + ' AND triggertable.`subscription` = subscription.`id`) LIMIT ' + limit;
                        break;
                    case 'opened':
                        query = 'SELECT subscription.id AS id FROM `subscription__' + trigger.list + '` subscription LEFT JOIN `campaign__' + trigger.sourceCampaign + '` campaign ON campaign.list=' + trigger.list + ' AND subscription.id=campaign.subscription LEFT JOIN `campaign_tracker__' + trigger.sourceCampaign + '` tracker ON tracker.list=campaign.list AND tracker.subscriber=subscription.id AND tracker.link=-1 WHERE campaign.status=1 AND ' + intervalQuery('`tracker`.`created`', trigger.seconds, treshold) + ' AND subscription.id NOT IN (SELECT subscription FROM `trigger__' + id + '` triggertable WHERE triggertable.`list` = ' + trigger.list + ' AND triggertable.`subscription` = subscription.`id`) LIMIT ' + limit;
                        break;
                }
                break;
        }
        callback(null, query);
    });
};

module.exports.get = (id, callback) => {
    id = Number(id) || 0;

    if (id < 1) {
        return callback(new Error('Missing Trigger ID'));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('SELECT * FROM triggers WHERE id=?', [id], (err, rows) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            if (!rows || !rows.length) {
                return callback(null, false);
            }

            let trigger = tools.convertKeys(rows[0]);
            return callback(null, trigger);
        });
    });
};

module.exports.create = (trigger, callback) => {

    trigger = tools.convertKeys(trigger);
    let name = (trigger.name || '').toString().trim();
    let description = (trigger.description || '').toString().trim();
    let listId = Number(trigger.list) || 0;
    let seconds = (Number(trigger.days) || 0) * 24 * 3600;
    let rule = (trigger.rule || '').toString().toLowerCase().trim();
    let destCampaign = Number(trigger.destCampaign) || 0;
    let sourceCampaign = null;
    let column;

    if (!listId) {
        return callback(new Error(_('Missing or invalid list ID')));
    }

    if (seconds < 0) {
        return callback(new Error(_('Days in the past are not allowed')));
    }

    if (!rule || ['campaign', 'subscription'].indexOf(rule) < 0) {
        return callback(new Error(_('Missing or invalid trigger rule')));
    }

    switch (rule) {
        case 'subscription':
            column = (trigger.column || '').toString().toLowerCase().trim();
            if (!column) {
                return callback(new Error(_('Invalid subscription configuration')));
            }
            break;
        case 'campaign':
            column = (trigger.campaignOption || '').toString().toLowerCase().trim();
            sourceCampaign = Number(trigger.sourceCampaign) || 0;
            if (!column || !sourceCampaign) {
                return callback(new Error(_('Invalid campaign configuration')));
            }
            if (sourceCampaign === destCampaign) {
                return callback(new Error(_('A campaing can not be a target for itself')));
            }
            break;
        default:
            return callback(new Error(_('Missing or invalid trigger rule')));
    }

    lists.get(listId, (err, list) => {
        if (err) {
            return callback(err);
        }
        if (!list) {
            return callback(new Error(_('Missing or invalid list ID')));
        }

        db.getConnection((err, connection) => {
            if (err) {
                return callback(err);
            }

            let keys = ['name', 'description', 'list', 'source_campaign', 'rule', 'column', 'seconds', 'dest_campaign', 'last_check'];
            let values = [name, description, list.id, sourceCampaign, rule, column, seconds, destCampaign];

            let query = 'INSERT INTO `triggers` (`' + keys.join('`, `') + '`) VALUES (' + values.map(() => '?').join(', ') + ', NOW())';

            connection.query(query, values, (err, result) => {
                connection.release();
                if (err) {
                    return callback(err);
                }

                let id = result && result.insertId;
                if (!id) {
                    return callback(new Error(_('Could not store trigger row')));
                }

                createTriggerTable(id, err => {
                    if (err) {
                        return callback(err);
                    }
                    return callback(null, id);
                });
            });
        });
    });
};

module.exports.update = (id, trigger, callback) => {
    id = Number(id) || 0;
    if (id < 1) {
        return callback(new Error(_('Missing or invalid Trigger ID')));
    }

    trigger = tools.convertKeys(trigger);
    let name = (trigger.name || '').toString().trim();
    let description = (trigger.description || '').toString().trim();
    let enabled = trigger.enabled ? 1 : 0;
    let seconds = (Number(trigger.days) || 0) * 24 * 3600;
    let rule = (trigger.rule || '').toString().toLowerCase().trim();
    let destCampaign = Number(trigger.destCampaign) || 0;
    let sourceCampaign = null;
    let column;

    if (seconds < 0) {
        return callback(new Error(_('Days in the past are not allowed')));
    }

    if (!rule || ['campaign', 'subscription'].indexOf(rule) < 0) {
        return callback(new Error(_('Missing or invalid trigger rule')));
    }

    switch (rule) {
        case 'subscription':
            column = (trigger.column || '').toString().toLowerCase().trim();
            if (!column) {
                return callback(new Error(_('Invalid subscription configuration')));
            }
            break;
        case 'campaign':
            column = (trigger.campaignOption || '').toString().toLowerCase().trim();
            sourceCampaign = Number(trigger.sourceCampaign) || 0;
            if (!column || !sourceCampaign) {
                return callback(new Error(_('Invalid campaign configuration')));
            }
            if (sourceCampaign === destCampaign) {
                return callback(new Error(_('A campaing can not be a target for itself')));
            }
            break;
        default:
            return callback(new Error(_('Missing or invalid trigger rule')));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        let keys = ['name', 'description', 'enabled', 'source_campaign', 'rule', 'column', 'seconds', 'dest_campaign'];
        let values = [name, description, enabled, sourceCampaign, rule, column, seconds, destCampaign];

        let query = 'UPDATE `triggers` SET ' + keys.map(key => '`' + key + '`=?').join(', ') + ' WHERE `id`=? LIMIT 1';

        connection.query(query, values.concat(id), (err, result) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            return callback(null, result && result.affectedRows);
        });
    });
};

module.exports.delete = (id, callback) => {
    id = Number(id) || 0;

    if (id < 1) {
        return callback(new Error(_('Missing Trigger ID')));
    }

    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        connection.query('DELETE FROM triggers WHERE id=? LIMIT 1', [id], (err, result) => {
            connection.release();
            if (err) {
                return callback(err);
            }

            let affected = result && result.affectedRows || 0;
            removeTriggerTable(id, err => {
                if (err) {
                    return callback(err);
                }
                return callback(null, affected);
            });
        });
    });
};

module.exports.filterSubscribers = (trigger, request, columns, callback) => {
    let queryData = {
        where: 'trigger__' + trigger.id + '.list=?',
        values: [trigger.list]
    };

    tableHelpers.filter('subscription__' + trigger.list + ' JOIN trigger__' + trigger.id + ' ON trigger__' + trigger.id + '.subscription=subscription__' + trigger.list + '.id', ['*'], request, columns, ['email', 'first_name', 'last_name'], 'email ASC', queryData, callback);
};

function createTriggerTable(id, callback) {
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }
        let query = 'CREATE TABLE `trigger__' + id + '` LIKE `trigger`';
        connection.query(query, err => {
            connection.release();
            if (err) {
                return callback(err);
            }
            return callback(null, true);
        });
    });
}

function removeTriggerTable(id, callback) {
    db.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }
        let query = 'DROP TABLE IF EXISTS `trigger__' + id + '`';
        connection.query(query, err => {
            connection.release();
            if (err) {
                return callback(err);
            }
            return callback(null, true);
        });
    });
}
