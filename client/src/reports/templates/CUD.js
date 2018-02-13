'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate, Trans } from 'react-i18next';
import {requiresAuthenticatedUser, withPageHelpers, Title, NavButton} from '../../lib/page'
import { withForm, Form, FormSendMethod, InputField, TextArea, Dropdown, ACEEditor, ButtonRow, Button } from '../../lib/form';
import { withErrorHandling, withAsyncErrorHandler } from '../../lib/error-handling';
import { validateNamespace, NamespaceSelect } from '../../lib/namespace';
import {DeleteModalDialog} from "../../lib/modals";
import mailtrainConfig from 'mailtrainConfig';
import 'brace/mode/javascript';
import 'brace/mode/json';
import 'brace/mode/handlebars';

@translate()
@withForm
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class CUD extends Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.initForm();
    }

    static propTypes = {
        action: PropTypes.string.isRequired,
        wizard: PropTypes.string,
        entity: PropTypes.object
    }

    @withAsyncErrorHandler
    async loadFormValues() {
        await this.getFormValuesFromURL(`/rest/report-templates/${this.props.entity.id}`);
    }

    componentDidMount() {
        if (this.props.entity) {
            this.getFormValuesFromEntity(this.props.entity);

        } else {
            const wizard = this.props.wizard;

            if (wizard === 'subscribers-all') {
                this.populateFormValues({
                    name: '',
                    description: 'Generates a campaign report listing all subscribers along with their statistics.',
                    namespace: mailtrainConfig.user.namespace,
                    mime_type: 'text/html',
                    user_fields:
                        '[\n' +
                        '  {\n' +
                        '    "id": "campaign",\n' +
                        '    "name": "Campaign",\n' +
                        '    "type": "campaign",\n' +
                        '    "minOccurences": 1,\n' +
                        '    "maxOccurences": 1\n' +
                        '  }\n' +
                        ']',
                    js:
                        'const results = await campaigns.getResults(inputs.campaign, ["*"]);\n' +
                        'render({ results });',
                    hbs:
                        '<h2>{{title}}</h2>\n' +
                        '\n' +
                        '<div class="table-responsive">\n' +
                        '  <table class="table table-bordered table-hover data-table display nowrap" width="100%" data-row-sort="1,1" data-paging="false">\n' +
                        '    <thead>\n' +
                        '    <th>\n' +
                        '      {{#translate}}Email{{/translate}}\n' +
                        '    </th>\n' +
                        '    <th>\n' +
                        '      {{#translate}}Tracker Count{{/translate}}\n' +
                        '    </th>\n' +
                        '    </thead>\n' +
                        '    {{#if results}}\n' +
                        '      <tbody>\n' +
                        '      {{#each results}}\n' +
                        '        <tr>\n' +
                        '          <th scope="row">\n' +
                        '            {{email}}\n' +
                        '          </th>\n' +
                        '          <td style="width: 20%;">\n' +
                        '            {{tracker_count}}\n' +
                        '          </td>\n' +
                        '        </tr>\n' +
                        '      {{/each}}\n' +
                        '      </tbody>\n' +
                        '    {{/if}}\n' +
                        '  </table>\n' +
                        '</div>'
                });

            } else if (wizard === 'subscribers-grouped') {
                this.populateFormValues({
                    name: '',
                    description: 'Generates a campaign report with results are aggregated by some "Country" custom field.',
                    namespace: mailtrainConfig.user.namespace,
                    mime_type: 'text/html',
                    user_fields:
                        '[\n' +
                        '  {\n' +
                        '    "id": "campaign",\n' +
                        '    "name": "Campaign",\n' +
                        '    "type": "campaign",\n' +
                        '    "minOccurences": 1,\n' +
                        '    "maxOccurences": 1\n' +
                        '  }\n' +
                        ']',
                    js:
                        'const results = await campaigns.getResults(inputs.campaign, ["merge_country"], query =>\n' +
                        '  query.count("* AS count_all")\n' +
                        '    .select(knex.raw("SUM(IF(tracker.count IS NULL, 0, 1)) AS count_opened"))\n' +
                        '    .groupBy("merge_country")\n' +
                        ');\n' +
                        '\n' +
                        'for (const row of results) {\n' +
                        '    row.percentage = Math.round((row.count_opened / row.count_all) * 100);\n' +
                        '}\n' +
                        '\n' +
                        'render({ results });',
                    hbs:
                        '<h2>{{title}}</h2>\n' +
                        '\n' +
                        '<div class="table-responsive">\n' +
                        '  <table class="table table-bordered table-hover data-table display nowrap" width="100%" data-row-sort="1,1,1,1" data-paging="false">\n' +
                        '    <thead>\n' +
                        '      <th>\n' +
                        '        {{#translate}}Country{{/translate}}\n' +
                        '      </th>\n' +
                        '      <th>\n' +
                        '        {{#translate}}Opened{{/translate}}\n' +
                        '      </th>\n' +
                        '      <th>\n' +
                        '        {{#translate}}All{{/translate}}\n' +
                        '      </th>\n' +
                        '      <th>\n' +
                        '        {{#translate}}Percentage{{/translate}}\n' +
                        '      </th>\n' +
                        '    </thead>\n' +
                        '    {{#if results}}\n' +
                        '    <tbody>\n' +
                        '    {{#each results}}\n' +
                        '      <tr>\n' +
                        '        <th scope="row">\n' +
                        '          {{merge_country}}\n' +
                        '        </th>\n' +
                        '        <td style="width: 20%;">\n' +
                        '          {{count_opened}}\n' +
                        '        </td>\n' +
                        '        <td style="width: 20%;">\n' +
                        '          {{count_all}}\n' +
                        '        </td>\n' +
                        '        <td style="width: 20%;">\n' +
                        '          {{percentage}}%\n' +
                        '        </td>\n' +
                        '      </tr>\n' +
                        '    {{/each}}\n' +
                        '    </tbody>\n' +
                        '    {{/if}}\n' +
                        '  </table>\n' +
                        '</div>'
                });

            } else if (wizard === 'export-list-csv') {
                this.populateFormValues({
                    name: '',
                    description: 'Exports a list as a CSV file.',
                    namespace: mailtrainConfig.user.namespace,
                    mime_type: 'text/csv',
                    user_fields:
                        '[\n' +
                        '  {\n' +
                        '    "id": "list",\n' +
                        '    "name": "List",\n' +
                        '    "type": "list",\n' +
                        '    "minOccurences": 1,\n' +
                        '    "maxOccurences": 1\n' +
                        '  }\n' +
                        ']',
                    js:
                        'const results = await subscriptions.list(inputs.list.id);\n' +
                        'render({ results });',
                    hbs:
                        '{{#each results}}\n' +
                        '{{firstName}},{{lastName}},{{email}}\n' +
                        '{{/each}}'
                });

            } else {
                this.populateFormValues({
                    name: '',
                    description: '',
                    namespace: mailtrainConfig.user.namespace,
                    mime_type: 'text/html',
                    user_fields: '',
                    js: '',
                    hbs: ''
                });
            }
        }
    }

    localValidateFormValues(state) {
        const t = this.props.t;

        if (!state.getIn(['name', 'value'])) {
            state.setIn(['name', 'error'], t('Name must not be empty'));
        } else {
            state.setIn(['name', 'error'], null);
        }

        if (!state.getIn(['mime_type', 'value'])) {
            state.setIn(['mime_type', 'error'], t('MIME Type must be selected'));
        } else {
            state.setIn(['mime_type', 'error'], null);
        }

        try {
            const userFields = JSON.parse(state.getIn(['user_fields', 'value']));
            state.setIn(['user_fields', 'error'], null);
        } catch (err) {
            if (err instanceof SyntaxError) {
                state.setIn(['user_fields', 'error'], t('Syntax error in the user fields specification'));
            }
        }

        validateNamespace(t, state);
    }

    async submitAndStay() {
        await this.formHandleChangedError(async () => await this.doSubmit(true));
    }

    async submitAndLeave() {
        await this.formHandleChangedError(async () => await this.doSubmit(false));
    }

    async doSubmit(stay) {
        const t = this.props.t;

        let sendMethod, url;
        if (this.props.entity) {
            sendMethod = FormSendMethod.PUT;
            url = `/rest/report-templates/${this.props.entity.id}`
        } else {
            sendMethod = FormSendMethod.POST;
            url = '/rest/report-templates'
        }

        this.disableForm();
        this.setFormStatusMessage('info', t('Saving ...'));

        const submitSuccessful = await this.validateAndSendFormValuesToURL(sendMethod, url);

        if (submitSuccessful) {
            if (stay) {
                await this.loadFormValues();
                this.enableForm();
                this.setFormStatusMessage('success', t('Report template saved'));
            } else {
                this.navigateToWithFlashMessage('/reports/templates', 'success', t('Report template saved'));
            }
        } else {
            this.enableForm();
            this.setFormStatusMessage('warning', t('There are errors in the form. Please fix them and submit again.'));
        }
    }

    render() {
        const t = this.props.t;
        const isEdit = !!this.props.entity;
        const canDelete = isEdit && this.props.entity.permissions.includes('delete');

        return (
            <div>
                {canDelete &&
                    <DeleteModalDialog
                        stateOwner={this}
                        visible={this.props.action === 'delete'}
                        deleteUrl={`/rest/reports/templates/${this.props.entity.id}`}
                        cudUrl={`/reports/templates/${this.props.entity.id}/edit`}
                        listUrl="/reports/templates"
                        deletingMsg={t('Deleting report template ...')}
                        deletedMsg={t('Report template deleted')}/>
                }

                <Title>{isEdit ? t('Edit Report Template') : t('Create Report Template')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitAndLeave}>
                    <InputField id="name" label={t('Name')}/>
                    <TextArea id="description" label={t('Description')} help={t('HTML is allowed')}/>
                    <Dropdown id="mime_type" label={t('Type')} options={[{key: 'text/html', label: t('HTML')}, {key: 'text/csv', label: t('CSV')}]}/>
                    <NamespaceSelect/>
                    <ACEEditor id="user_fields" height="250px" mode="json" label={t('User selectable fields')} help={t('JSON specification of user selectable fields.')}/>
                    <ACEEditor id="js" height="700px" mode="javascript" label={t('Data processing code')} help={<Trans>Write the body of the JavaScript function with signature <code>function(inputs, callback)</code> that returns an object to be rendered by the Handlebars template below.</Trans>}/>
                    <ACEEditor id="hbs" height="700px" mode="handlebars" label={t('Rendering template')} help={<Trans>Use HTML with Handlebars syntax. See documentation <a href="http://handlebarsjs.com/">here</a>.</Trans>}/>

                    {isEdit ?
                        <ButtonRow>
                            <Button type="submit" className="btn-primary" icon="ok" label={t('Save and Stay')} onClickAsync={::this.submitAndStay}/>
                            <Button type="submit" className="btn-primary" icon="ok" label={t('Save and Leave')}/>
                            {canDelete &&
                                <NavButton className="btn-danger" icon="remove" label={t('Delete')} linkTo={`/reports/templates/${this.props.entity.id}/delete`}/>
                            }
                        </ButtonRow>
                    :
                        <ButtonRow>
                            <Button type="submit" className="btn-primary" icon="ok" label={t('Save')}/>
                        </ButtonRow>
                    }
                </Form>
            </div>
        );
    }
}
