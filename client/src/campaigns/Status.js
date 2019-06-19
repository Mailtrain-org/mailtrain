'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from '../lib/i18n';
import {LinkButton, requiresAuthenticatedUser, Title, withPageHelpers} from '../lib/page';
import {AlignedRow, ButtonRow, CheckBox, DatePicker, Form, InputField, TableSelect, withForm} from '../lib/form';
import {withAsyncErrorHandler, withErrorHandling} from '../lib/error-handling';
import {getCampaignLabels} from './helpers';
import {Table} from "../lib/table";
import {Button, Icon, ModalDialog} from "../lib/bootstrap-components";
import axios from "../lib/axios";
import {getPublicUrl, getUrl} from "../lib/urls";
import interoperableErrors from '../../../shared/interoperable-errors';
import {CampaignStatus, CampaignType} from "../../../shared/campaigns";
import moment from 'moment';
import campaignsStyles from "./styles.scss";
import {withComponentMixins} from "../lib/decorator-helpers";


@withComponentMixins([
    withTranslation,
    withForm,
    withErrorHandling,
    withPageHelpers,
    requiresAuthenticatedUser
])
class TestUser extends Component {
    constructor(props) {
        super(props);
        this.initForm({
            leaveConfirmation: false
        });
    }

    static propTypes = {
        entity: PropTypes.object.isRequired
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
            const campaignCid = this.props.entity.cid;
            const [listCid, subscriptionCid] = this.getFormValue('testUser').split(':');

            window.open(getPublicUrl(`archive/${campaignCid}/${listCid}/${subscriptionCid}`, {withLocale: true}), '_blank');
        } else {
            this.showFormValidation();
        }
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
            <Form stateOwner={this}>
                <TableSelect id="testUser" label={t('previewCampaignAs')} withHeader dropdown dataUrl={`rest/campaigns-test-users-table/${this.props.entity.id}`} columns={testUsersColumns} selectionLabelIndex={1} />
                <ButtonRow>
                    <Button className="btn-primary" label={t('preview')} onClickAsync={::this.previewAsync}/>
                </ButtonRow>
            </Form>
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
        this.initForm({
            leaveConfirmation: false
        });
    }

    static propTypes = {
        entity: PropTypes.object.isRequired,
        refreshEntity: PropTypes.func.isRequired
    }

    localValidateFormValues(state) {
        const t = this.props.t;

        state.setIn(['date', 'error'], null);
        state.setIn(['time', 'error'], null);

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
        }
    }

    componentDidMount() {
        const entity = this.props.entity;

        if (entity.scheduled) {
            const date = moment(entity.scheduled);
            this.populateFormValues({
                sendLater: true,
                date: date.format('YYYY-MM-DD'),
                time: date.format('HH:mm')
            });

        } else {
            this.populateFormValues({
                sendLater: false,
                date: '',
                time: ''
            });
        }
    }

    async refreshEntity() {
        await this.props.refreshEntity();
    }

    async postAndMaskStateError(url) {
        try {
            await axios.post(getUrl(url));
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
            const date = moment(data.date, 'YYYY-MM-DD');
            const time = moment(data.time, 'HH:mm');

            date.hour(time.hour());
            date.minute(time.minute());
            date.second(0);
            date.millisecond(0);
            date.utcOffset(0, true); // TODO, process offset from user settings


            await this.postAndMaskStateError(`rest/campaign-start-at/${this.props.entity.id}/${date.valueOf()}`);

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
                await this.refreshEntity();
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

        const yesNoDialog = (
            <ModalDialog hidden={!this.state.modalVisible} title={this.state.modalTitle} onCloseAsync={() => this.modalAction(false)} buttons={[
                { label: t('no'), className: 'btn-primary', onClickAsync: () => this.modalAction(false) },
                { label: t('yes'), className: 'btn-danger', onClickAsync: () => this.modalAction(true) }
            ]}>
                {this.state.modalMessage}
            </ModalDialog>
        );

        if (entity.status === CampaignStatus.IDLE || entity.status === CampaignStatus.PAUSED || (entity.status === CampaignStatus.SCHEDULED && entity.scheduled)) {

            const subscrInfo = entity.subscriptionsToSend === undefined ? '' : ` (${entity.subscriptionsToSend} ${t('subscribers-1')})`;

            return (
                <div>{yesNoDialog}
                    <AlignedRow label={t('sendStatus')}>
                        {entity.scheduled ? t('campaignIsScheduledForDelivery') : t('campaignIsReadyToBeSentOut')}
                    </AlignedRow>

                    <Form stateOwner={this}>
                        <CheckBox id="sendLater" label={t('sendLater')} text={t('scheduleDeliveryAtAParticularDatetime')}/>
                        {this.getFormValue('sendLater') &&
                            <div>
                                <DatePicker id="date" label={t('date')} />
                                <InputField id="time" label={t('time')} help={t('enter24HourTimeInFormatHhmmEg1348')}/>
                                {/* TODO: Timezone selector */}
                            </div>
                        }
                    </Form>
                    <ButtonRow className={campaignsStyles.sendButtonRow}>
                        {this.getFormValue('sendLater') ?
                            <Button className="btn-primary" icon="send" label={(entity.scheduled ? t('rescheduleSend') : t('scheduleSend')) + subscrInfo} onClickAsync={::this.scheduleAsync}/>
                            :
                            <Button className="btn-primary" icon="send" label={t('send') + subscrInfo} onClickAsync={::this.confirmStart}/>
                        }
                        {entity.status === CampaignStatus.PAUSED && <LinkButton className="btn-secondary" icon="signal" label={t('viewStatistics')} to={`/campaigns/${entity.id}/statistics`}/>}
                    </ButtonRow>
                </div>
            );

        } else if (entity.status === CampaignStatus.SENDING || (entity.status === CampaignStatus.SCHEDULED && !entity.scheduled)) {
            return (
                <div>{yesNoDialog}
                    <AlignedRow label={t('sendStatus')}>
                        {t('campaignIsBeingSentOut')}
                    </AlignedRow>
                    <ButtonRow>
                        <Button className="btn-primary" icon="stop" label={t('stop')} onClickAsync={::this.stopAsync}/>
                        <LinkButton className="btn-secondary" icon="signal" label={t('viewStatistics')} to={`/campaigns/${entity.id}/statistics`}/>
                    </ButtonRow>
                </div>
            );

        } else if (entity.status === CampaignStatus.FINISHED) {
            const subscrInfo = entity.subscriptionsToSend === undefined ? '' : ` (${entity.subscriptionsToSend} ${t('subscribers-1')})`;

            return (
                <div>{yesNoDialog}
                    <AlignedRow label={t('sendStatus')}>
                        {t('allMessagesSent!HitContinueIfYouYouWant')}
                    </AlignedRow>
                    <ButtonRow>
                        <Button className="btn-primary" icon="play" label={t('continue') + subscrInfo} onClickAsync={::this.confirmStart}/>
                        <Button className="btn-primary" icon="refresh" label={t('reset')} onClickAsync={::this.resetAsync}/>
                        <LinkButton className="btn-secondary" icon="signal" label={t('viewStatistics')} to={`/campaigns/${entity.id}/statistics`}/>
                    </ButtonRow>
                </div>
            );

        } else if (entity.status === CampaignStatus.INACTIVE) {
            return (
                <div>{yesNoDialog}
                    <AlignedRow label={t('sendStatus')}>
                        {t('yourCampaignIsCurrentlyDisabledClick')}
                    </AlignedRow>
                    <ButtonRow>
                        <Button className="btn-primary" icon="play" label={t('enable')} onClickAsync={::this.enableAsync}/>
                    </ButtonRow>
                </div>
            );

        } else if (entity.status === CampaignStatus.ACTIVE) {
            return (
                <div>{yesNoDialog}
                    <AlignedRow label={t('sendStatus')}>
                        {t('yourCampaignIsEnabledAndSendingMessages')}
                    </AlignedRow>
                    <ButtonRow>
                        <Button className="btn-primary" icon="stop" label={t('disable')} onClickAsync={::this.disableAsync}/>
                    </ButtonRow>
                </div>
            );
        } else {

            return null;
        }
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
            sendConfiguration: null
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
        let resp;

        resp = await axios.get(getUrl(`rest/campaigns-stats/${this.props.entity.id}`));
        const entity = resp.data;

        resp = await axios.get(getUrl(`rest/send-configurations-public/${entity.send_configuration}`));
        const sendConfiguration = resp.data;

        this.setState({
            entity,
            sendConfiguration
        });
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
            addOverridable('subject', t('subjectLine'));
        } else {
            sendSettings =  <AlignedRow>{t('loadingSendConfiguration')}</AlignedRow>
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

                    if (perms.includes('viewStats')) {
                        actions.push({
                            label: <Icon icon="send" title={t('status')}/>,
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
                <AlignedRow label={t('delivered')}>{entity.delivered}</AlignedRow>
                <AlignedRow label={t('status')}>{this.campaignStatusLabels[entity.status]}</AlignedRow>

                {sendSettings}

                <AlignedRow label={t('targetListssegments')}>
                    <Table withHeader dataUrl={`rest/lists-with-segment-by-campaign-table/${this.props.entity.id}`} columns={listsColumns} />
                </AlignedRow>

                {(entity.type === CampaignType.REGULAR || entity.type === CampaignType.TRIGGERED) &&
                    <div>
                        <hr/>
                        <TestUser entity={entity}/>
                    </div>
                }

                <hr/>
                <SendControls entity={entity} refreshEntity={::this.refreshEntity}/>

                {entity.type === CampaignType.RSS &&
                    <div>
                        <hr/>
                        <h3>RSS Entries</h3>
                        <p>{t('ifANewEntryIsFoundFromCampaignFeedANew')}</p>
                        <Table withHeader dataUrl={`rest/campaigns-children/${this.props.entity.id}`} columns={campaignsChildrenColumns} />
                    </div>
                }
            </div>
        );
    }
}