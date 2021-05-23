'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from '../lib/i18n';
import {LinkButton, requiresAuthenticatedUser, Title, withPageHelpers} from '../lib/page';
import {
    AlignedRow,
    ButtonRow,
    CheckBox,
    DateTimePicker,
    Form,
    InputField,
    TableSelect,
    withForm
} from '../lib/form';
import {withAsyncErrorHandler, withErrorHandling} from '../lib/error-handling';
import {getCampaignLabels} from './helpers';
import {Table} from "../lib/table";
import {Button, Icon, ModalDialog} from "../lib/bootstrap-components";
import axios from "../lib/axios";
import {getPublicUrl, getSandboxUrl, getUrl} from "../lib/urls";
import interoperableErrors from '../../../shared/interoperable-errors';
import {CampaignStatus, CampaignType} from "../../../shared/campaigns";
import moment from 'moment-timezone';
import campaignsStyles from "./styles.scss";
import {withComponentMixins} from "../lib/decorator-helpers";
import {TestSendModalDialog, TestSendModalDialogMode} from "./TestSendModalDialog";
import styles from "../lib/styles.scss";

@withComponentMixins([
    withTranslation,
    withForm,
    withErrorHandling,
    withPageHelpers,
    requiresAuthenticatedUser
])
class PreviewForTestUserModalDialog extends Component {
    constructor(props) {
        super(props);
        this.initForm({
            leaveConfirmation: false
        });
    }

    static propTypes = {
        visible: PropTypes.bool.isRequired,
        onHide: PropTypes.func.isRequired,
        entity: PropTypes.object.isRequired,
    }

    localValidateFormValues(state) {
        const t = this.props.t;

        if (!state.getIn(['testUser', 'value'])) {
            state.setIn(['testUser', 'error'], t('subscriptionHasToBeSelectedToShowThe'))
        } else {
            state.setIn(['testUser', 'error'], null);
        }
    }

    componentDidMount() {
        this.populateFormValues({
            testUser: null,
        });
    }

    async previewAsync() {
        if (this.isFormWithoutErrors()) {
            const entity = this.props.entity;
            const campaignCid = entity.cid;
            const [listCid, subscriptionCid] = this.getFormValue('testUser').split(':');

            if (entity.type === CampaignType.RSS) {
                const result = await axios.post(getUrl('rest/restricted-access-token'), {
                    method: 'rssPreview',
                    params: {
                        campaignCid,
                        listCid
                    }
                });

                const accessToken = result.data;
                window.open(getSandboxUrl(`cpgs/rss-preview/${campaignCid}/${listCid}/${subscriptionCid}`, accessToken, {withLocale: true}), '_blank');

            } else if (entity.type === CampaignType.REGULAR || entity.type === CampaignType.RSS_ENTRY) {
                window.open(getPublicUrl(`archive/${campaignCid}/${listCid}/${subscriptionCid}`, {withLocale: true}), '_blank');

            } else {
                throw new Error('Preview not supported');
            }

        } else {
            this.showFormValidation();
        }
    }

    async hideModal() {
        this.props.onHide();
    }

    render() {
        const t = this.props.t;

        const testUsersColumns = [
            { data: 1, title: t('email') },
            { data: 2, title: t('subscriptionId'), render: data => <code>{data}</code> },
            { data: 3, title: t('listId'), render: data => <code>{data}</code> },
            { data: 4, title: t('list') },
            { data: 5, title: t('listNamespace') }
        ];

        return (
            <ModalDialog hidden={!this.props.visible} title={t('previewCampaign')} onCloseAsync={() => this.hideModal()} buttons={[
                { label: t('preview'), className: 'btn-primary', onClickAsync: ::this.previewAsync },
                { label: t('close'), className: 'btn-danger', onClickAsync: ::this.hideModal }
            ]}>
                <Form stateOwner={this}>
                    <TableSelect id="testUser" label={t('previewAs')} withHeader dropdown dataUrl={`rest/campaigns-test-users-table/${this.props.entity.id}`} columns={testUsersColumns} selectionLabelIndex={1} />
                </Form>
            </ModalDialog>
        );
    }
}

@withComponentMixins([
    withTranslation,
    withForm,
    withErrorHandling,
    withPageHelpers,
    requiresAuthenticatedUser
])
class SendControls extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showTestSendModal: false,
            previewForTestUserVisible: false
        };

        this.initForm({
            leaveConfirmation: false
        });

        this.timezoneOptions = moment.tz.names().map(x => [x]);
    }

    static propTypes = {
        entity: PropTypes.object.isRequired,
        refreshEntity: PropTypes.func.isRequired
    }

    localValidateFormValues(state) {
        const t = this.props.t;

        state.setIn(['date', 'error'], null);
        state.setIn(['time', 'error'], null);
        state.setIn(['timezone', 'error'], null);

        if (state.getIn(['sendLater', 'value'])) {
            const dateValue = state.getIn(['date', 'value']).trim();
            if (!dateValue) {
                state.setIn(['date', 'error'], t('dateMustNotBeEmpty'));
            } else if (!moment(dateValue, 'YYYY-MM-DD', true).isValid()) {
                state.setIn(['date', 'error'], t('dateIsInvalid'));
            }

            const timeValue = state.getIn(['time', 'value']).trim();
            if (!timeValue) {
                state.setIn(['time', 'error'], t('timeMustNotBeEmpty'));
            } else if (!moment(timeValue, 'HH:mm', true).isValid()) {
                state.setIn(['time', 'error'], t('timeIsInvalid'));
            }

            const timezone = state.getIn(['timezone', 'value']);
            if (!timezone) {
                state.setIn(['timezone', 'error'], t('timezoneMustBeSelected'));
            }
        }
    }

    populateSendLater() {
        const entity = this.props.entity;

        if (entity.scheduled) {
            const timezone = entity.data.timezone || moment.tz.guess();
            const date = moment.tz(entity.scheduled, timezone);
            this.populateFormValues({
                sendLater: true,
                date: date.format('YYYY-MM-DD'),
                time: date.format('HH:mm'),
                timezone
            });

        } else {
            this.populateFormValues({
                sendLater: false,
                date: '',
                time: '',
                timezone: moment.tz.guess()
            });
        }
    }

    componentDidMount() {
        this.populateSendLater();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.entity.scheduled !== this.props.entity.scheduled) {
            this.populateSendLater();
        }
    }

    async refreshEntity() {
        await this.props.refreshEntity();
    }

    async postAndMaskStateError(url, data) {
        try {
            await axios.post(getUrl(url), data);
        } catch (err) {
            if (err instanceof interoperableErrors.InvalidStateError) {
                // Just mask the fact that it's not possible to start anything and refresh instead.
            } else {
                throw err;
            }
        }
    }

    async scheduleAsync() {
        if (this.isFormWithoutErrors()) {
            const data = this.getFormValues();
            const dateTime = moment.tz(data.date + ' ' + data.time, 'YYYY-MM-DD HH:mm', data.timezone);

            await this.postAndMaskStateError(`rest/campaign-start-at/${this.props.entity.id}`, {
                startAt: dateTime.valueOf(),
                timezone: data.timezone
            });

        } else {
            this.showFormValidation();
        }

        await this.refreshEntity();
    }

    async startAsync() {
        await this.postAndMaskStateError(`rest/campaign-start/${this.props.entity.id}`);
        await this.refreshEntity();
    }

    async stopAsync() {
        await this.postAndMaskStateError(`rest/campaign-stop/${this.props.entity.id}`);
        await this.refreshEntity();
    }

    async confirmStart() {
        const t = this.props.t;
        this.actionDialog(
            t('confirmLaunch'),
            t('doYouWantToLaunchTheCampaign?'),
            async () => {
                await this.startAsync();
            }
        );
    }

    async confirmSchedule() {
        const t = this.props.t;
        this.actionDialog(
            t('confirmLaunch'),
            t('doYouWantToScheduleTheCampaignForLaunch?'),
            async () => {
                await this.scheduleAsync();
            }
        );
    }

    async resetAsync() {
        const t = this.props.t;
        this.actionDialog(
            t('confirmReset'),
            t('doYouWantToResetTheCampaign?All'),
            async () => {
                await this.postAndMaskStateError(`rest/campaign-reset/${this.props.entity.id}`);
                await this.refreshEntity();
            }
        );
    }

    async enableAsync() {
        await this.postAndMaskStateError(`rest/campaign-enable/${this.props.entity.id}`);
        await this.refreshEntity();
    }

    async disableAsync() {
        await this.postAndMaskStateError(`rest/campaign-disable/${this.props.entity.id}`);
        await this.refreshEntity();
    }

    actionDialog(title, message, callback) {
        this.setState({
            modalTitle: title,
            modalMessage: message,
            modalCallback: callback,
            modalVisible: true
        });
    }

    modalAction(isYes) {
        if (isYes && this.state.modalCallback) {
            this.state.modalCallback();
        }

        this.setState({
            modalTitle: '',
            modalMessage: '',
            modalCallback: null,
            modalVisible: false
        });
    }

    render() {
        const t = this.props.t;
        const entity = this.props.entity;

        const testSendPermitted = entity.permissions.includes('sendToTestUsers');
        const sendPermitted = entity.permissions.includes('send');

        const dialogs = (
            <>
                PreviewForTestUserModalDialog
                <TestSendModalDialog
                    mode={TestSendModalDialogMode.CAMPAIGN_STATUS}
                    visible={this.state.showTestSendModal}
                    onHide={() => this.setState({showTestSendModal: false})}
                    campaign={this.props.entity}
                />
                <PreviewForTestUserModalDialog
                    visible={this.state.previewForTestUserVisible}
                    onHide={() => this.setState({previewForTestUserVisible: false})}
                    entity={this.props.entity}
                />
                <ModalDialog hidden={!this.state.modalVisible} title={this.state.modalTitle} onCloseAsync={() => this.modalAction(false)} buttons={[
                    { label: t('no'), className: 'btn-primary', onClickAsync: () => this.modalAction(false) },
                    { label: t('yes'), className: 'btn-danger', onClickAsync: () => this.modalAction(true) }
                ]}>
                    {this.state.modalMessage}
                </ModalDialog>
            </>
        );

        const testButtons = (
            <>
                <Button className="btn-success" label={t('preview')} onClickAsync={async () => this.setState({previewForTestUserVisible: true})}/>
                {testSendPermitted && <Button className="btn-success" label={t('testSend')} onClickAsync={async () => this.setState({showTestSendModal: true})}/>}
            </>
        );

        let sendStatus = null;
        if (entity.status === CampaignStatus.IDLE || entity.status === CampaignStatus.PAUSED || (entity.status === CampaignStatus.SCHEDULED && entity.scheduled)) {
            sendStatus = (
                <AlignedRow label={t('sendStatus')}>
                    {entity.status === CampaignStatus.SCHEDULED ? t('campaignIsScheduledForDelivery') : t('campaignIsReadyToBeSentOut')}
                </AlignedRow>
            );

        } else if (entity.status === CampaignStatus.PAUSING) {
            sendStatus = (
                <AlignedRow label={t('sendStatus')}>
                    {t('campaignIsBeingPausedPleaseWait')}
                </AlignedRow>
            );

        } else if (entity.status === CampaignStatus.SENDING || (entity.status === CampaignStatus.SCHEDULED && !entity.scheduled)) {
            sendStatus = (
                <AlignedRow label={t('sendStatus')}>
                    {t('campaignIsBeingSentOut')}
                </AlignedRow>
            );

        } else if (entity.status === CampaignStatus.FINISHED) {
            sendStatus = (
                <AlignedRow label={t('sendStatus')}>
                    {sendPermitted ? t('allMessagesSent!HitContinueIfYouWantTo') : t('allMessagesSent!')}
                </AlignedRow>
            );

        } else if (entity.status === CampaignStatus.INACTIVE) {
            sendStatus = (
                <AlignedRow label={t('sendStatus')}>
                    {sendPermitted ? t('yourCampaignIsCurrentlyDisabledClick') : t('yourCampaignIsCurrentlyDisabled')}
                </AlignedRow>
            );

        } else if (entity.status === CampaignStatus.ACTIVE) {
            sendStatus = (
                <AlignedRow label={t('sendStatus')}>
                    {t('yourCampaignIsEnabledAndSendingMessages')}
                </AlignedRow>
            );
        }

        let content = null;
        let sendButtons = null;
        if (sendPermitted) {
            if (entity.status === CampaignStatus.IDLE || entity.status === CampaignStatus.PAUSED || (entity.status === CampaignStatus.SCHEDULED && entity.scheduled)) {

                const timezoneColumns = [
                    { data: 0, title: t('timezone') }
                ];

                const dateValue = (this.getFormValue('date') || '').trim();
                const timeValue = (this.getFormValue('time') || '').trim();
                const timezone = this.getFormValue('timezone');

                let dateTimeHelp = t('selectDateTimeAndATimezoneToDisplayThe');
                let dateTimeAlert = null;
                if (moment(dateValue, 'YYYY-MM-DD', true).isValid() && moment(timeValue, 'HH:mm', true).isValid() && timezone) {
                    const dateTime = moment.tz(dateValue + ' ' + timeValue, 'YYYY-MM-DD HH:mm', timezone);

                    dateTimeHelp = dateTime.toString();
                    if (!moment().isBefore(dateTime)) {
                        dateTimeAlert = <div className="alert alert-danger" role="alert">{t('scheduledDatetimeSeemsToBeInThePastIfYou')}</div>;
                    }
                }

                content = (
                    <Form stateOwner={this}>
                        {entity.status !== CampaignStatus.SCHEDULED &&
                            <CheckBox id="sendLater" label={t('sendLater')} text={t('scheduleDeliveryAtAParticularDatetime')}/>
                        }
                        {this.getFormValue('sendLater') &&
                        <div>
                            <DateTimePicker id="date" label={t('date')} />
                            <InputField id="time" label={t('time')} help={t('enter24HourTimeInFormatHhmmEg1348')}/>
                            <TableSelect id="timezone" label={t('timezone')} dropdown columns={timezoneColumns} selectionKeyIndex={0} selectionLabelIndex={0} data={this.timezoneOptions}
                                         help={dateTimeHelp}
                            />
                            {dateTimeAlert && <AlignedRow>{dateTimeAlert}</AlignedRow>}
                        </div>
                        }
                    </Form>
                );

                sendButtons = (
                    <>
                        {this.getFormValue('sendLater') ?
                            <Button className="btn-primary" icon="play" label={entity.status === CampaignStatus.SCHEDULED ? t('rescheduleSend') : t('scheduleSend')} onClickAsync={::this.confirmSchedule}/>
                            :
                            <Button className="btn-primary" icon="play" label={t('send')} onClickAsync={::this.confirmStart}/>
                        }
                        {entity.status === CampaignStatus.SCHEDULED && <Button className="btn-primary" icon="pause" label={t('cancelScheduling')} onClickAsync={::this.stopAsync}/>}
                        {entity.status === CampaignStatus.PAUSED && <Button className="btn-primary" icon="redo" label={t('reset')} onClickAsync={::this.resetAsync}/>}
                        {entity.status === CampaignStatus.PAUSED && <LinkButton className="btn-secondary" icon="signal" label={t('viewStatistics')} to={`/campaigns/${entity.id}/statistics`}/>}
                    </>
                );

            } else if (entity.status === CampaignStatus.PAUSING) {
                sendButtons = (
                    <>
                        <Button className="btn-primary" icon="pause" label={t('pausing')} disabled={true}/>
                        <LinkButton className="btn-secondary" icon="signal" label={t('viewStatistics')} to={`/campaigns/${entity.id}/statistics`}/>
                    </>
                );

            } else if (entity.status === CampaignStatus.SENDING || (entity.status === CampaignStatus.SCHEDULED && !entity.scheduled)) {
                sendButtons = (
                    <>
                        <Button className="btn-primary" icon="pause" label={t('pause')} onClickAsync={::this.stopAsync}/>
                        <LinkButton className="btn-secondary" icon="signal" label={t('viewStatistics')} to={`/campaigns/${entity.id}/statistics`}/>
                    </>
                );

            } else if (entity.status === CampaignStatus.FINISHED) {
                sendButtons = (
                    <>
                        <Button className="btn-primary" icon="play" label={t('continue')} onClickAsync={::this.confirmStart}/>
                        <Button className="btn-primary" icon="redo" label={t('reset')} onClickAsync={::this.resetAsync}/>
                        <LinkButton className="btn-secondary" icon="signal" label={t('viewStatistics')} to={`/campaigns/${entity.id}/statistics`}/>
                    </>
                );

            } else if (entity.status === CampaignStatus.INACTIVE) {
                sendButtons = (
                    <>
                        <Button className="btn-primary" icon="play" label={t('enable')} onClickAsync={::this.enableAsync}/>
                    </>
                );

            } else if (entity.status === CampaignStatus.ACTIVE) {
                sendButtons = (
                    <>
                        <Button className="btn-primary" icon="stop" label={t('disable')} onClickAsync={::this.disableAsync}/>
                    </>
                );
            }
        }

        return (
            <div>
                {dialogs}
                {sendStatus}
                {content}
                <ButtonRow className={campaignsStyles.sendButtonRow}>
                    {sendButtons}
                    {testButtons}
                </ButtonRow>
            </div>
        );
    }
}

@withComponentMixins([
    withTranslation,
    withErrorHandling,
    withPageHelpers,
    requiresAuthenticatedUser
])
export default class Status extends Component {
    constructor(props) {
        super(props);

        const t = props.t;

        this.state = {
            entity: props.entity,
            sendConfiguration: null,
            sendConfigurationNotPermitted: false
        };

        const { campaignTypeLabels, campaignStatusLabels } = getCampaignLabels(t);
        this.campaignTypeLabels = campaignTypeLabels;
        this.campaignStatusLabels = campaignStatusLabels;

        this.refreshTimeoutHandler = ::this.periodicRefreshTask;
        this.refreshTimeoutId = 0;
    }

    static propTypes = {
        entity: PropTypes.object
    }

    @withAsyncErrorHandler
    async refreshEntity() {
        const newState = {};

        let resp;

        resp = await axios.get(getUrl(`rest/campaigns-settings/${this.props.entity.id}`));
        newState.entity = resp.data;

        try {
            resp = await axios.get(getUrl(`rest/send-configurations-public/${newState.entity.send_configuration}`));
            newState.sendConfiguration = resp.data;
        } catch (err) {
            if (err instanceof interoperableErrors.PermissionDeniedError) {
                newState.sendConfiguration = null;
                newState.sendConfigurationNotPermitted = true;
            } else {
                throw err;
            }
        }

        this.setState(newState);
    }

    async periodicRefreshTask() {
        // The periodic task runs all the time, so that we don't have to worry about starting/stopping it as a reaction to the buttons.
        await this.refreshEntity();
        if (this.refreshTimeoutHandler) { // For some reason the task gets rescheduled if server is restarted while the page is shown. That why we have this check here.
            this.refreshTimeoutId = setTimeout(this.refreshTimeoutHandler, 10000);
        }
    }

    componentDidMount() {
        // noinspection JSIgnoredPromiseFromCall
        this.periodicRefreshTask();
    }

    componentWillUnmount() {
        clearTimeout(this.refreshTimeoutId);
        this.refreshTimeoutHandler = null;
    }


    render() {
        const t = this.props.t;
        const entity = this.state.entity;

        let sendSettings;
        if (this.state.sendConfiguration) {
            sendSettings = [];
            
            const addOverridable = (id, label) => {
                if(this.state.sendConfiguration[id + '_overridable'] == 1 && entity[id + '_override'] != null){
                    sendSettings.push(<AlignedRow key={id} label={label}>{entity[id + '_override']}</AlignedRow>);
                }
                else{
                    sendSettings.push(<AlignedRow key={id} label={label}>{this.state.sendConfiguration[id]}</AlignedRow>);
                }
            };


            addOverridable('from_name', t('fromName'));
            addOverridable('from_email', t('fromEmailAddress'));
            addOverridable('reply_to', t('replytoEmailAddress'));
            sendSettings.push(<AlignedRow key="subject" label={t('subjectLine')}>{entity.subject}</AlignedRow>);
        } else {
            if (this.state.sendConfigurationNotPermitted) {
                sendSettings = null;
            } else {
                sendSettings =  <AlignedRow>{t('loadingSendConfiguration')}</AlignedRow>
            }
        }

        const listsColumns = [
            { data: 1, title: t('name') },
            { data: 2, title: t('id'), render: data => <code>{data}</code> },
            { data: 4, title: t('segment') },
            { data: 3, title: t('listNamespace') }
        ];

        const campaignsChildrenColumns = [
            { data: 1, title: t('name') },
            { data: 2, title: t('id'), render: data => <code>{data}</code> },
            { data: 5, title: t('status'), render: (data, display, rowData) => this.campaignStatusLabels[data] },
            { data: 8, title: t('created'), render: data => moment(data).fromNow() },
            {
                actions: data => {
                    const actions = [];
                    const perms = data[10];
                    const campaignType = data[4];
                    const campaignSource = data[7];

                    if (perms.includes('view')) {
                        actions.push({
                            label: <Icon icon="envelope" title={t('status')}/>,
                            link: `/campaigns/${data[0]}/status`
                        });
                    }

                    return actions;
                }
            }
        ];

        return (
            <div>
                <Title>{t('campaignStatus')}</Title>

                <AlignedRow label={t('name')}>{entity.name}</AlignedRow>
                <AlignedRow label={t('sent')}>{entity.delivered}</AlignedRow>
                <AlignedRow label={t('status')}>{this.campaignStatusLabels[entity.status]}</AlignedRow>

                {sendSettings}

                <AlignedRow label={t('targetListssegments')}>
                    <Table withHeader dataUrl={`rest/lists-with-segment-by-campaign-table/${this.props.entity.id}`} columns={listsColumns} />
                </AlignedRow>

                <hr/>
                <SendControls entity={entity} refreshEntity={::this.refreshEntity}/>

                {entity.type === CampaignType.RSS &&
                    <div>
                        <hr/>
                        <h3>RSS Entries</h3>
                        <p>{t('ifANewEntryIsFoundFromCampaignFeedANew')}</p>
                        <Table withHeader dataUrl={`rest/campaigns-children/${this.props.entity.id}`} columns={campaignsChildrenColumns} order={[3, 'desc']}/>
                    </div>
                }
            </div>
        );
    }
}