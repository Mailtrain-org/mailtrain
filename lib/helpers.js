'use strict';

let config = require('config');
let path = require('path');
let fs = require('fs');
let tools = require('./tools');
let settings = require('./models/settings');
let lists = require('./models/lists');
let fields = require('./models/fields');
let forms = require('./models/forms');
let _ = require('./translate')._;
let objectHash = require('object-hash');
let mjml = require('mjml');
let mjmlTemplates = new Map();
let hbs = require('hbs');

module.exports = {
    getDefaultMergeTags,
    getRSSMergeTags,
    getListMergeTags,
    captureFlashMessages,
    injectCustomFormData,
    injectCustomFormTemplates,
    filterCustomFields,
    getMjmlTemplate
};

function getDefaultMergeTags(callback) {
    // Using a callback for the sake of future-proofness
    callback(null, [{
        key: 'LINK_UNSUBSCRIBE',
        value: _('URL that points to the unsubscribe page')
    }, {
        key: 'LINK_PREFERENCES',
        value: _('URL that points to the preferences page of the subscriber')
    }, {
        key: 'LINK_BROWSER',
        value: _('URL to preview the message in a browser')
    }, {
        key: 'EMAIL',
        value: _('Email address')
    }, {
        key: 'FIRST_NAME',
        value: _('First name')
    }, {
        key: 'LAST_NAME',
        value: _('Last name')
    }, {
        key: 'FULL_NAME',
        value: _('Full name (first and last name combined)')
    }, {
        key: 'SUBSCRIPTION_ID',
        value: _('Unique ID that identifies the recipient')
    }, {
        key: 'LIST_ID',
        value: _('Unique ID that identifies the list used for this campaign')
    }, {
        key: 'CAMPAIGN_ID',
        value: _('Unique ID that identifies current campaign')
    }]);
}

function getRSSMergeTags(callback) {
    // Using a callback for the sake of future-proofness
    callback(null, [{
        key: 'RSS_ENTRY',
        value: _('content from an RSS entry')
    }, {
        key: 'RSS_ENTRY_TITLE',
        value: _('RSS entry title')
    }, {
        key: 'RSS_ENTRY_DATE',
        value: _('RSS entry date')
    }, {
        key: 'RSS_ENTRY_LINK',
        value: _('RSS entry link')
    }, {
        key: 'RSS_ENTRY_CONTENT',
        value: _('content from an RSS entry')
    }, {
        key: 'RSS_ENTRY_SUMMARY',
        value: _('RSS entry summary')
    }, {
        key: 'RSS_ENTRY_IMAGE_URL',
        value: _('RSS entry image URL')
    }]);
}

function getListMergeTags(listId, callback) {
    lists.get(listId, (err, list) => {
        if (err) {
            return callback(err);
        }
        if (!list) {
            list = {
                id: listId
            };
        }

        fields.list(list.id, (err, fieldList) => {
            if (err && !fieldList) {
                fieldList = [];
            }

            let mergeTags = [];

            fieldList.forEach(field => {
                mergeTags.push({
                    key: field.key,
                    value: field.name
                });
            });

            return callback(null, mergeTags);
        });
    });
}

function filterCustomFields(customFieldsIn = [], fieldIds = [], method = 'include') {
    let customFields = customFieldsIn.slice();
    fieldIds = typeof fieldIds === 'string' ? fieldIds.split(',') : fieldIds;

    customFields.unshift({
        id: 'email',
        name: 'Email Address',
        type: 'Email',
        typeSubsciptionEmail: true
    }, {
        id: 'firstname',
        name: 'First Name',
        type: 'Text',
        typeFirstName: true
    }, {
        id: 'lastname',
        name: 'Last Name',
        type: 'Text',
        typeLastName: true
    });

    let filtered = [];

    if (method === 'include') {
        fieldIds.forEach(id => {
            let field = customFields.find(f => f.id.toString() === id);
            field && filtered.push(field);
        });
    } else {
        customFields.forEach(field => {
            !fieldIds.includes(field.id.toString()) && filtered.push(field);
        });
    }

    return filtered;
}

function injectCustomFormData(customFormId, viewPath, data, callback) {

    let injectDefaultData = data => {
        data.customFields = filterCustomFields(data.customFields, [], 'exclude');
        data.formInputStyle = '@import url(/subscription/form-input-style.css);';
        return data;
    };

    if (Number(customFormId) < 1) {
        return callback(null, injectDefaultData(data));
    }

    forms.get(customFormId, (err, form) => {
        if (err) {
            return callback(null, injectDefaultData(data));
        }

        let view = viewPath.split('/')[1];

        if (view === 'web-subscribe') {
            data.customFields = form.fieldsShownOnSubscribe
                ? filterCustomFields(data.customFields, form.fieldsShownOnSubscribe)
                : filterCustomFields(data.customFields, [], 'exclude');
        } else if (view === 'web-manage') {
            data.customFields = form.fieldsShownOnManage
                ? filterCustomFields(data.customFields, form.fieldsShownOnManage)
                : filterCustomFields(data.customFields, [], 'exclude');
        }

        let key = tools.fromDbKey(view);
        data.template.template = form[key] || data.template.template;
        data.template.layout = form.layout || data.template.layout;
        data.formInputStyle = form.formInputStyle || '@import url(/subscription/form-input-style.css);';

        settings.list(['ua_code'], (err, configItems) => {
            if (err) {
                return callback(err);
            }

            data.uaCode = configItems.uaCode;
            data.customSubscriptionScripts = config.customsubscriptionscripts || [];
            callback(null, data);
        });
    });
}

function injectCustomFormTemplates(customFormId, templates, callback) {
    if (Number(customFormId) < 1) {
        return callback(null, templates);
    }

    forms.get(customFormId, (err, form) => {
        if (err) {
            return callback(null, templates);
        }

        let lookUp = name => {
            let key = tools.fromDbKey(
                /subscription\/([^.]*)/.exec(name)[1]
            );
            return form[key] || name;
        };

        Object.keys(templates).forEach(key => {
            let value = templates[key];

            if (typeof value === 'string') {
                templates[key] = lookUp(value);
            }
            if (typeof value === 'object' && value.template) {
                templates[key].template = lookUp(value.template);
            }
            if (typeof value === 'object' && value.layout) {
                templates[key].layout = lookUp(value.layout);
            }
        });

        callback(null, templates);
    });
}

function getMjmlTemplate(template, callback) {
    if (!template) {
        return callback(null, false);
    }

    let key = (typeof template === 'object') ? objectHash(template) : template;

    if (mjmlTemplates.has(key)) {
        return callback(null, mjmlTemplates.get(key));
    }

    let done = source => {
        let compiled;
        try {
            compiled = mjml.mjml2html(source);
        } catch (err) {
            return callback(err);
        }
        if (compiled.errors.length) {
            return callback(compiled.errors[0].message || compiled.errors[0]);
        }
        let renderer = hbs.handlebars.compile(compiled.html);
        mjmlTemplates.set(key, renderer);
        callback(null, renderer);
    };

    if (typeof template === 'object') {
        tools.mergeTemplateIntoLayout(template.template, template.layout, (err, source) => {
            if (err) {
                return callback(err);
            }
            done(source);
        });
    } else {
        fs.readFile(path.join(__dirname, '..', 'views', template), 'utf-8', (err, source) => {
            if (err) {
                return callback(err);
            }
            done(source);
        });
    }
}

function captureFlashMessages(req, res, callback) {
    res.render('subscription/capture-flash-messages', { layout: null }, (err, flash) => {
        if (err) {
            return callback(err);
        }
        callback(null, flash);
    });
}
