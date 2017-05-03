'use strict';

let _ = require('../lib/translate')._;
let helpers = require('../lib/helpers');
let templates = require('../lib/models/templates');
let campaigns = require('../lib/models/campaigns');

module.exports = {
    getResource,
    getMergeTagsForResource
};

function getResource(type, id, callback) {
    if (type === 'template') {
        templates.get(id, (err, template) => {
            if (err || !template) {
                return callback(err && err.message || err || _('Could not find template with specified ID'));
            }

            getMergeTagsForResource(template, (err, mergeTags) => {
                if (err) {
                    return callback(err.message || err);
                }

                template.mergeTags = mergeTags;
                return callback(null, template);
            });
        });

    } else if (type === 'campaign') {
        campaigns.get(id, false, (err, campaign) => {
            if (err || !campaign) {
                return callback(err && err.message || err || _('Could not find campaign with specified ID'));
            }

            getMergeTagsForResource(campaign, (err, mergeTags) => {
                if (err) {
                    return callback(err.message || err);
                }

                campaign.mergeTags = mergeTags;
                return callback(null, campaign);
            });
        });

    } else {
        return callback(_('Invalid resource type'));
    }
}

function getMergeTagsForResource(resource, callback) {
    helpers.getDefaultMergeTags((err, defaultMergeTags) => {
        if (err) {
            return callback(err.message || err);
        }

        if (!Number(resource.list)) {
            return callback(null, defaultMergeTags);
        }

        helpers.getListMergeTags(resource.list, (err, listMergeTags) => {
            if (err) {
                return callback(err.message || err);
            }

            if (resource.type !== 2) {
                return callback(null, defaultMergeTags.concat(listMergeTags));
            }

            helpers.getRSSMergeTags((err, rssMergeTags) => {
                if (err) {
                    return callback(err.message || err);
                }

                callback(null, defaultMergeTags.concat(listMergeTags, rssMergeTags));
            });
        });
    });
}
