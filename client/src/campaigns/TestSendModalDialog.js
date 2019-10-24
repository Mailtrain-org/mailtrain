'use strict';

import React, {Component} from 'react';
import {withTranslation} from '../lib/i18n';
import PropTypes from 'prop-types';
import {ModalDialog} from "../lib/bootstrap-components";
import {requiresAuthenticatedUser, withPageHelpers} from "../lib/page";
import {CheckBox, Dropdown, Form, InputField, TableSelect, withForm} from "../lib/form";
import {withErrorHandling} from "../lib/error-handling";
import {getMailerTypes} from "../send-configurations/helpers";
import axios from '../lib/axios';
import {getUrl} from '../lib/urls';
import {withComponentMixins} from "../lib/decorator-helpers";
import {CampaignType} from "../../../shared/campaigns";
import {NamespaceFilterContext} from '../lib/namespace';

const Target = {
    CAMPAIGN_ONE: 'campaign_one',
    CAMPAIGN_ALL: 'campaign_all',
    LIST_ONE: 'list_one',
    LIST_ALL: 'list_all'
};

export const TestSendModalDialogMode = {
    TEMPLATE: 0,
    CAMPAIGN_CONTENT: 1,
    CAMPAIGN_STATUS: 2
}

@withComponentMixins([
    withTranslation,
    withForm,
    withErrorHandling,
    withPageHelpers,
    requiresAuthenticatedUser
])
export class TestSendModalDialog extends Component {
    constructor(props) {
        super(props);

        this.mailerTypes = getMailerTypes(props.t);

        this.initForm({
            leaveConfirmation: false,
            onChangeBeforeValidation: {
                list: this.onListChanged
            }
        });
    }

    static propTypes = {
        visible: PropTypes.bool.isRequired,
        mode: PropTypes.number.isRequired,
        onHide: PropTypes.func.isRequired,
        getDataAsync: PropTypes.func,
        campaign: PropTypes.object
    }

    onListChanged(mutStateData, key, oldValue, newValue) {
        mutStateData.setIn(['segment', 'value'], null);
    }

    componentDidMount() {
        const t = this.props.t;

        this.populateFormValues({
            target: Target.CAMPAIGN_ONE,
            testUserSubscriptionCid: null,
            testUserListAndSubscriptionCid: null,
            subjectPrepend: '',
            subjectAppend: t(' [Test]'),
            sendConfiguration: null,
            listCid: null,
            list: null,
            segment: null,
            useSegmentation: false
        });
    }

    async hideModal() {
        this.props.onHide();
    }

    async performAction() {
        const props = this.props;
        const t = props.t;
        const mode = this.props.mode;

        if (this.isFormWithoutErrors()) {
            try {
                this.hideFormValidation();
                this.disableForm();
                this.setFormStatusMessage('info', t('sendingTestEmail'));

                const data = {};

                if (mode === TestSendModalDialogMode.CAMPAIGN_CONTENT || mode === TestSendModalDialogMode.TEMPLATE) {
                    const contentData = await this.props.getDataAsync();
                    data.html = contentData.html;
                    data.text = contentData.text;
                    data.tagLanguage = contentData.tagLanguage;
                }

                if (mode === TestSendModalDialogMode.TEMPLATE) {
                    data.listCid = this.getFormValue('listCid');
                    data.subscriptionCid = this.getFormValue('testUserSubscriptionCid');
                    data.sendConfigurationId = this.getFormValue('sendConfiguration');

                } else if (mode === TestSendModalDialogMode.CAMPAIGN_STATUS || mode === TestSendModalDialogMode.CAMPAIGN_CONTENT) {
                    data.campaignId = props.campaign.id;
                    data.subjectPrepend = this.getFormValue('subjectPrepend');
                    data.subjectAppend = this.getFormValue('subjectAppend');

                    const target = this.getFormValue('target');
                    if (target === Target.CAMPAIGN_ONE) {
                        const [listCid, subscriptionCid] = this.getFormValue('testUserListAndSubscriptionCid').split(':');
                        data.listCid = listCid;
                        data.subscriptionCid = subscriptionCid;

                    } else if (target === Target.LIST_ALL) {
                        data.listId = this.getFormValue('list');
                        data.segmentId = this.getFormValue('useSegmentation') ? this.getFormValue('segment') : null;

                    } else if (target === Target.LIST_ONE) {
                        data.listCid = this.getFormValue('listCid');
                        data.subscriptionCid = this.getFormValue('testUserSubscriptionCid');
                    }
                }

                await axios.post(getUrl('rest/campaign-test-send'), data);

                this.clearFormStatusMessage();

                this.enableForm();
                await this.hideModal();

            } catch (err) {
                throw err;
            }
        } else {
            this.showFormValidation();
        }
    }

    localValidateFormValues(state) {
        const t = this.props.t;
        const props = this.props;
        const target = this.getFormValue('target');
        const mode = this.props.mode;

        state.setIn(['listCid', 'error'], null);
        state.setIn(['sendConfiguration', 'error'], null);
        state.setIn(['testUserSubscriptionCid', 'error'], null);
        state.setIn(['testUserListAndSubscriptionCid', 'error'], null);
        state.setIn(['list', 'error'], null);
        state.setIn(['segment', 'error'], null);

        if (mode === TestSendModalDialogMode.TEMPLATE) {
            if (!state.getIn(['listCid', 'value'])) {
                state.setIn(['listCid', 'error'], t('listHasToBeSelected'))
            }

            if (!state.getIn(['sendConfiguration', 'value'])) {
                state.setIn(['sendConfiguration', 'error'], t('sendConfigurationHasToBeSelected'))
            }

            if (!state.getIn(['testUserSubscriptionCid', 'value'])) {
                state.setIn(['testUserSubscriptionCid', 'error'], t('subscriptionHasToBeSelected'))
            }
        }

        if ((mode === TestSendModalDialogMode.CAMPAIGN_CONTENT || mode === TestSendModalDialogMode.CAMPAIGN_STATUS) && target === Target.CAMPAIGN_ONE) {
            if (!state.getIn(['testUserListAndSubscriptionCid', 'value'])) {
                state.setIn(['testUserListAndSubscriptionCid', 'error'], t('subscriptionHasToBeSelected'))
            }
        }

        if ((mode === TestSendModalDialogMode.CAMPAIGN_CONTENT || mode === TestSendModalDialogMode.CAMPAIGN_STATUS) && target === Target.LIST_ONE) {
            if (!state.getIn(['listCid', 'value'])) {
                state.setIn(['listCid', 'error'], t('listHasToBeSelected'))
            }

            if (!state.getIn(['testUserSubscriptionCid', 'value'])) {
                state.setIn(['testUserSubscriptionCid', 'error'], t('subscriptionHasToBeSelected'))
            }
        }

        if ((mode === TestSendModalDialogMode.CAMPAIGN_CONTENT || mode === TestSendModalDialogMode.CAMPAIGN_STATUS) && target === Target.LIST_ALL) {
            if (!state.getIn(['list', 'value'])) {
                state.setIn(['list', 'error'], t('listMustBeSelected'));
            }

            if (state.getIn(['useSegmentation', 'value']) && !state.getIn(['segment', 'value'])) {
                state.setIn(['segment', 'error'], t('segmentMustBeSelected'));
            }
        }
    }

    render() {
        const t = this.props.t;
        const props = this.props;

        const content = [];
        const target = this.getFormValue('target');
        const mode = this.props.mode;

        if (mode === TestSendModalDialogMode.CAMPAIGN_CONTENT || mode === TestSendModalDialogMode.CAMPAIGN_STATUS) {
            const targetOpts = [
                {key: Target.CAMPAIGN_ONE, label: t('Single test user of the campaign')},
                {key: Target.CAMPAIGN_ALL, label: t('All test users of the campaign')},
                {key: Target.LIST_ONE, label: t('Single test user from a list')},
                {key: Target.LIST_ALL, label: t('All test users from a list/segment')}
            ];

            content.push(
                <Dropdown key="target" id="target" format="wide" label={t('Select to where you want to send the test')} options={targetOpts}/>
            );
        }

        if (mode === TestSendModalDialogMode.TEMPLATE) {
            const listCid = this.getFormValue('listCid');

            const testUsersColumns = [
                { data: 1, title: t('subscriptionId'), render: data => <code>{data}</code> },
                { data: 2, title: t('email') }
            ];

            const listsColumns = [
                { data: 1, title: t('name') },
                { data: 2, title: t('id'), render: data => <code>{data}</code> },
                { data: 3, title: t('subscribers') },
                { data: 4, title: t('description') },
                { data: 5, title: t('namespace') }
            ];

            const sendConfigurationsColumns = [
                { data: 1, title: t('name') },
                { data: 2, title: t('id'), render: data => <code>{data}</code> },
                { data: 3, title: t('description') },
                { data: 4, title: t('type'), render: data => this.mailerTypes[data].typeName },
                { data: 6, title: t('namespace') }
            ];

            content.push(
                <NamespaceFilterContext.Consumer>{(context) => <TableSelect key="sendConfiguration" id="sendConfiguration" format="wide" label={t('sendConfiguration')} withHeader dropdown dataUrl='rest/send-configurations-with-send-permission-table' columns={sendConfigurationsColumns} selectionLabelIndex={1} namespaceFilter={context.namespaceId}/>}</NamespaceFilterContext.Consumer>
            );

            content.push(
                <NamespaceFilterContext.Consumer>{(context) => <TableSelect key="listCid" id="listCid" format="wide" label={t('list')} withHeader dropdown dataUrl={`rest/lists-table`} columns={listsColumns} selectionKeyIndex={2} selectionLabelIndex={1} namespaceFilter={context.namespaceId}/>}</NamespaceFilterContext.Consumer>
            );

            if (listCid) {
                content.push(
                    <TableSelect key="testUserSubscriptionCid" id="testUserSubscriptionCid" format="wide" label={t('subscription')} withHeader dropdown dataUrl={`rest/subscriptions-test-user-table/${listCid}`} columns={testUsersColumns} selectionKeyIndex={1} selectionLabelIndex={2}/>
                );
            }
        }

        if ((mode === TestSendModalDialogMode.CAMPAIGN_CONTENT || mode === TestSendModalDialogMode.CAMPAIGN_STATUS) && target === Target.CAMPAIGN_ONE) {
            const testUsersColumns = [
                {data: 1, title: t('email')},
                {data: 2, title: t('subscriptionId'), render: data => <code>{data}</code>},
                {data: 3, title: t('listId'), render: data => <code>{data}</code>},
                {data: 4, title: t('list')},
                {data: 5, title: t('listNamespace')}
            ];

            content.push(
                <TableSelect key="testUserListAndSubscriptionCid" id="testUserListAndSubscriptionCid" format="wide" label={t('subscription')} withHeader dropdown dataUrl={`rest/campaigns-test-users-table/${this.props.campaign.id}`} columns={testUsersColumns} selectionLabelIndex={1} />
            );
        }

        if ((mode === TestSendModalDialogMode.CAMPAIGN_CONTENT || mode === TestSendModalDialogMode.CAMPAIGN_STATUS) && target === Target.LIST_ONE) {
            const listCid = this.getFormValue('listCid');

            const listsColumns = [
                { data: 1, title: t('name') },
                { data: 2, title: t('id'), render: data => <code>{data}</code> },
                { data: 3, title: t('subscribers') },
                { data: 4, title: t('description') },
                { data: 5, title: t('namespace') }
            ];

            const testUsersColumns = [
                { data: 1, title: t('subscriptionId'), render: data => <code>{data}</code> },
                { data: 2, title: t('email') }
            ];

            content.push(
                <NamespaceFilterContext.Consumer>{(context) => <TableSelect key="listCid" id="listCid" format="wide" label={t('list')} withHeader dropdown dataUrl={`rest/lists-table`} columns={listsColumns} selectionKeyIndex={2} selectionLabelIndex={1} namespaceFilter={context.namespaceId}/>}</NamespaceFilterContext.Consumer>
            );

            if (listCid) {
                content.push(
                    <TableSelect key="testUserSubscriptionCid" id="testUserSubscriptionCid" format="wide" label={t('subscription')} withHeader dropdown dataUrl={`rest/subscriptions-test-user-table/${listCid}`} columns={testUsersColumns} selectionKeyIndex={1} selectionLabelIndex={2} />
                );
            }
        }

        if ((mode === TestSendModalDialogMode.CAMPAIGN_CONTENT || mode === TestSendModalDialogMode.CAMPAIGN_STATUS) && target === Target.LIST_ALL) {
            const listsColumns = [
                { data: 1, title: t('name') },
                { data: 2, title: t('id'), render: data => <code>{data}</code> },
                { data: 3, title: t('subscribers') },
                { data: 4, title: t('description') },
                { data: 5, title: t('namespace') }
            ];

            const segmentsColumns = [
                { data: 1, title: t('name') }
            ];

            content.push(
                <NamespaceFilterContext.Consumer>{(context) => <TableSelect key="list" id="list" format="wide" label={t('list')} withHeader dropdown dataUrl='rest/lists-table' columns={listsColumns} selectionLabelIndex={1} namespaceFilter={context.namespaceId}/>}</NamespaceFilterContext.Consumer>
            );

            const selectedList = this.getFormValue('list');
            content.push(
                <div key="segment">
                    <CheckBox id="useSegmentation" format="wide" text={t('useAParticularSegment')}/>
                    {selectedList && this.getFormValue('useSegmentation') &&
                        <TableSelect id="segment" format="wide" withHeader dropdown dataUrl={`rest/segments-table/${selectedList}`} columns={segmentsColumns} selectionLabelIndex={1} />
                    }
                </div>
            );
        }

        if (mode === TestSendModalDialogMode.CAMPAIGN_CONTENT || mode === TestSendModalDialogMode.CAMPAIGN_STATUS) {
            content.push(
                <InputField key="subjectPrepend" id="subjectPrepend" format="wide" label={t('Prepend to subject')}/>
            );

            content.push(
                <InputField key="subjectAppend" id="subjectAppend" format="wide" label={t('Append to subject')}/>
            );
        }

        return (
            <ModalDialog hidden={!this.props.visible} title={t('sendTestEmail')} onCloseAsync={() => this.hideModal()} buttons={[
                { label: t('send'), className: 'btn-primary', onClickAsync: ::this.performAction },
                { label: t('close'), className: 'btn-danger', onClickAsync: ::this.hideModal }
            ]}>
                <Form stateOwner={this} format="wide">
                    {content}
                </Form>
            </ModalDialog>
        );
    }
}
