'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Trans} from 'react-i18next';
import {withTranslation} from '../../lib/i18n';
import {LinkButton, requiresAuthenticatedUser, Title, withPageHelpers} from '../../lib/page'
import {
    ACEEditor,
    Button,
    ButtonRow,
    Dropdown,
    filterData,
    Form,
    FormSendMethod,
    InputField,
    TextArea,
    withForm,
    withFormErrorHandlers
} from '../../lib/form';
import {withErrorHandling} from '../../lib/error-handling';
import {getDefaultNamespace, NamespaceSelect, validateNamespace} from '../../lib/namespace';
import {DeleteModalDialog} from "../../lib/modals";
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-handlebars';
import {withComponentMixins} from "../../lib/decorator-helpers";

@withComponentMixins([
    withTranslation,
    withForm,
    withErrorHandling,
    withPageHelpers,
    requiresAuthenticatedUser
])
export default class CUD extends Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.initForm();
    }

    static propTypes = {
        action: PropTypes.string.isRequired,
        wizard: PropTypes.string,
        entity: PropTypes.object,
        permissions: PropTypes.object
    }

    submitFormValuesMutator(data) {
        return filterData(data, ['name', 'description', 'mime_type', 'user_fields', 'js', 'hbs', 'namespace']);
    }

    componentDidMount() {
        if (this.props.entity) {
            this.getFormValuesFromEntity(this.props.entity);

        } else {
            const wizard = this.props.wizard;

            if (wizard === 'open-counts') {
                this.populateFormValues({
                    name: '',
                    description: 'Generates a campaign report listing all subscribers along with open counts.',
                    namespace: getDefaultNamespace(this.props.permissions),
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
                        'const results = await campaigns.getCampaignOpenStatistics(inputs.campaign, ["*"])\n' +
                        'render({ results })',
                    hbs:
                        '<h2>{{title}}</h2>\n' +
                        '\n' +
                        '<div class="table-responsive">\n' +
                        '  <table class="table table-bordered table-hover" width="100%">\n' +
                        '    <thead>\n' +
                        '    <th>\n' +
                        '      Email\n' +
                        '    </th>\n' +
                        '    <th>\n' +
                        '      Open Count\n' +
                        '    </th>\n' +
                        '    </thead>\n' +
                        '    {{#if results}}\n' +
                        '      <tbody>\n' +
                        '      {{#each results}}\n' +
                        '        <tr>\n' +
                        '          <th scope="row">\n' +
                        '            {{subscription:email}}\n' +
                        '          </th>\n' +
                        '          <td style="width: 20%;">\n' +
                        '            {{tracker:count}}\n' +
                        '          </td>\n' +
                        '        </tr>\n' +
                        '      {{/each}}\n' +
                        '      </tbody>\n' +
                        '    {{/if}}\n' +
                        '  </table>\n' +
                        '</div>'
                });

            } else if (wizard === 'open-counts-csv') {
                this.populateFormValues({
                    name: '',
                    description: 'Generates a campaign report as CSV that lists all subscribers along with open counts.',
                    namespace: getDefaultNamespace(this.props.permissions),
                    mime_type: 'text/csv',
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
                    js: 'const results = await campaigns.getCampaignOpenStatisticsStream(inputs.campaign, [\'subscription:email\', \'tracker:count\'], null, (query, col) => query.where(col(\'subscription:status\'), SubscriptionStatus.SUBSCRIBED));\n' +
                        '\n' +
                        'await renderCsvFromStream(\n' +
                        '  results, \n' +
                        '  {\n' +
                        '    header: true,\n' +
                        '    columns: [ { key: \'subscription:email\', header: \'Email\' }, { key: \'tracker:count\', header: \'Open count\' } ],\n' +
                        '    delimiter: \',\'\n' +
                        '  },\n' +
                        '  async (row, encoding) => row\n' +
                        ');',
                    hbs: ''
                });

            } else if (wizard === 'aggregated-open-counts') {
                this.populateFormValues({
                    name: '',
                    description: 'Generates a campaign report with results are aggregated by "Country" custom field. (Note that this custom field has to be presents in the subscription custom fields.)',
                    namespace: getDefaultNamespace(this.props.permissions),
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
                        'const results = await campaigns.getCampaignOpenStatistics(inputs.campaign, ["field:country", "count_opened", "count_all"], (query, col) =>\n' +
                        '  query.count("* AS count_all")\n' +
                        '    .select(knex.raw("SUM(IF(`" + col("tracker:count") +"` IS NULL, 0, 1)) AS count_opened"))\n' +
                        '    .groupBy(col("field:country"))\n' +
                        ')\n' +
                        '\n' +
                        'for (const row of results) {\n' +
                        '    row.percentage = Math.round((row["tracker:count"] / row.count_all) * 100)\n' +
                        '}\n' +
                        '\n' +
                        'render({ results })',
                    hbs:
                        '<h2>{{title}}</h2>\n' +
                        '\n' +
                        '<div class="table-responsive">\n' +
                        '  <table class="table table-bordered table-hover" width="100%">\n' +
                        '    <thead>\n' +
                        '      <th>\n' +
                        '        Country\n' +
                        '      </th>\n' +
                        '      <th>\n' +
                        '        Opened\n' +
                        '      </th>\n' +
                        '      <th>\n' +
                        '        All\n' +
                        '      </th>\n' +
                        '      <th>\n' +
                        '        Percentage\n' +
                        '      </th>\n' +
                        '    </thead>\n' +
                        '    {{#if results}}\n' +
                        '    <tbody>\n' +
                        '    {{#each results}}\n' +
                        '      <tr>\n' +
                        '        <th scope="row">\n' +
                        '          {{field:merge_country}}\n' +
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

            } else {
                this.populateFormValues({
                    name: '',
                    description: '',
                    namespace: getDefaultNamespace(this.props.permissions),
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
            state.setIn(['name', 'error'], t('nameMustNotBeEmpty'));
        } else {
            state.setIn(['name', 'error'], null);
        }

        if (!state.getIn(['mime_type', 'value'])) {
            state.setIn(['mime_type', 'error'], t('mimeTypeMustBeSelected'));
        } else {
            state.setIn(['mime_type', 'error'], null);
        }

        try {
            const userFields = JSON.parse(state.getIn(['user_fields', 'value']));
            state.setIn(['user_fields', 'error'], null);
        } catch (err) {
            if (err instanceof SyntaxError) {
                state.setIn(['user_fields', 'error'], t('syntaxErrorInTheUserFieldsSpecification'));
            }
        }

        validateNamespace(t, state);
    }

    @withFormErrorHandlers
    async submitHandler(submitAndLeave) {
        const t = this.props.t;

        let sendMethod, url;
        if (this.props.entity) {
            sendMethod = FormSendMethod.PUT;
            url = `rest/report-templates/${this.props.entity.id}`
        } else {
            sendMethod = FormSendMethod.POST;
            url = 'rest/report-templates'
        }

        this.disableForm();
        this.setFormStatusMessage('info', t('saving'));

        const submitResult = await this.validateAndSendFormValuesToURL(sendMethod, url);

        if (submitResult) {
            if (this.props.entity) {
                if (submitAndLeave) {
                    this.navigateToWithFlashMessage('/reports/templates', 'success', t('reportTemplateUpdated'));
                } else {
                    await this.getFormValuesFromURL(`rest/report-templates/${this.props.entity.id}`);
                    this.enableForm();
                    this.setFormStatusMessage('success', t('reportTemplateUpdated'));
                }
            } else {
                if (submitAndLeave) {
                    this.navigateToWithFlashMessage('/reports/templates', 'success', t('reportTemplateCreated'));
                } else {
                    this.navigateToWithFlashMessage(`/reports/templates/${submitResult}/edit`, 'success', t('reportTemplateCreated'));
                }
            }
        } else {
            this.enableForm();
            this.setFormStatusMessage('warning', t('thereAreErrorsInTheFormPleaseFixThemAnd'));
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
                        deleteUrl={`rest/report-templates/${this.props.entity.id}`}
                        backUrl={`/reports/templates/${this.props.entity.id}/edit`}
                        successUrl="/reports/templates"
                        deletingMsg={t('deletingReportTemplate')}
                        deletedMsg={t('reportTemplateDeleted')}/>
                }

                <Title>{isEdit ? t('editReportTemplate') : t('createReportTemplate')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <InputField id="name" label={t('name')}/>
                    <TextArea id="description" label={t('description')}/>
                    <Dropdown id="mime_type" label={t('type')} options={[{key: 'text/html', label: t('html')}, {key: 'text/csv', label: t('csv')}]}/>
                    <NamespaceSelect/>
                    <ACEEditor id="user_fields" height="250px" mode="json" label={t('userSelectableFields')} help={t('jsonSpecificationOfUserSelectableFields')}/>
                    <ACEEditor id="js" height="700px" mode="javascript" label={t('dataProcessingCode')} help={<Trans i18nKey="writeTheBodyOfTheJavaScriptFunctionWith">Write the body of the JavaScript function with signature <code>async function(inputs)</code> that returns an object to be rendered by the Handlebars template below.</Trans>}/>
                    <ACEEditor id="hbs" height="700px" mode="handlebars" label={t('renderingTemplate')} help={<Trans i18nKey="useHtmlWithHandlebarsSyntaxSee">Use HTML with Handlebars syntax. See documentation <a href="http://handlebarsjs.com/">here</a>.</Trans>}/>

                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="check" label={t('save')}/>
                        <Button type="submit" className="btn-primary" icon="check" label={t('saveAndLeave')} onClickAsync={async () => await this.submitHandler(true)}/>
                        {canDelete &&
                            <LinkButton className="btn-danger" icon="trash-alt" label={t('delete')} to={`/reports/templates/${this.props.entity.id}/delete`}/>
                        }
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}
