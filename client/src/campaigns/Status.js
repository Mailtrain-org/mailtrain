'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import {
    requiresAuthenticatedUser,
    Title,
    withPageHelpers
} from '../lib/page';
import {
    AlignedRow,
    ButtonRow,
    CheckBox,
    DatePicker,
    Form,
    InputField,
    TableSelect,
    withForm
} from '../lib/form';
import {
    withAsyncErrorHandler,
    withErrorHandling
} from '../lib/error-handling';
import {getCampaignLabels} from './helpers';
import {Table} from "../lib/table";
import {Button} from "../lib/bootstrap-components";
import axios from "../lib/axios";
import {getUrl} from "../lib/urls";
import interoperableErrors from '../../../shared/interoperable-errors';
import {CampaignStatus} from "../../../shared/campaigns";
import moment from 'moment';
import campaignsStyles from "./styles.scss";


@translate()
@withForm
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
class TestUser extends Component {
    constructor(props) {
        super(props);
        this.initForm();
    }

    static propTypes = {
        entity: PropTypes.object.isRequired
    }

    localValidateFormValues(state) {
        const t = this.props.t;

        if (!state.getIn(['testUser', 'value'])) {
            state.setIn(['testUser', 'error'], t('Subscription has to be selected to show the campaign for a test user.'))
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
            const data = this.getFormValues();

            console.log(this.props.entity);
            console.log(data);

            // FIXME - navigate to campaign preview
            // window.location =
        } else {
            this.showFormValidation();
        }
    }

    render() {
        const t = this.props.t;

        const testUsersColumns = [
            { data: 1, title: t('Email') },
            { data: 4, title: t('List ID'), render: data => <code>{data}</code> },
            { data: 5, title: t('List') },
            { data: 6, title: t('Segment') },
            { data: 7, title: t('List namespace') }
        ];

        return (
            <Form stateOwner={this}>
                <TableSelect id="testUser" label={t('Preview campaign as')} withHeader dropdown dataUrl={`rest/campaigns-test-users-table/${this.props.entity.id}`} columns={testUsersColumns} selectionLabelIndex={1} />
                <ButtonRow>
                    <Button className="btn-primary" label={t('Preview')} onClickAsync={::this.previewAsync}/>
                </ButtonRow>
            </Form>
        );
    }
}

@translate()
@withForm
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
class SendControls extends Component {
    constructor(props) {
        super(props);
        this.initForm();
    }

    static propTypes = {
        entity: PropTypes.object.isRequired,
        refreshEntity: PropTypes.func.isRequired
    }

    localValidateFormValues(state) {
        const t = this.props.t;

        state.setIn(['date', 'error'], null);
        state.setIn(['time', 'error'], null);

        if (!state.getIn(['sendLater', 'value'])) {
            const dateValue = state.getIn(['date', 'value']);
            if (!dateValue) {
                state.setIn(['date', 'error'], t('Date must not be empty'));
            } else if (!moment.utc(dateValue, 'YYYY-MM-DD').isValid()) {
                state.setIn(['date', 'error'], t('Date is invalid'));
            }

            const timeValue = state.getIn(['time', 'value']);
            const time = moment.utc(timeValue, 'HH:mm').isValid();
            if (!timeValue) {
                state.setIn(['time', 'error'], t('Time must not be empty'));
            } else if (!time) {
                state.setIn(['time', 'error'], t('Time is invalid'));
            }
        }
    }

    componentDidMount() {
        const entity = this.props.entity;

        if (entity.scheduled) {
            const date = moment(entity.scheduled);
            this.populateFormValues({
                sendLater: true,
                date: date.utc().format('YYYY-MM-DD'),
                time: date.utc().format('HH:mm')
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
            const date = moment.utc(data.date);
            const time = moment.utc(date.time);

            date.hour(time.hour());
            date.minute(time.minute());
            date.second(0);
            date.millisecond(0);

            await this.postAndMaskStateError(`rest/campaign-start-at/${this.props.entity.id}/${date.toDate()}`);

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

    async resetAsync() {
        await this.postAndMaskStateError(`rest/campaign-reset/${this.props.entity.id}`);
        await this.refreshEntity();
    }

    render() {
        const t = this.props.t;
        const entity = this.props.entity;

        if (entity.status === CampaignStatus.IDLE || entity.status === CampaignStatus.PAUSED || (entity.status === CampaignStatus.SCHEDULED && entity.scheduled)) {

            const subscrInfo = entity.subscriptionsTotal === undefined ? '' : ` (${entity.subscriptionsTotal} ${t('subscribers')})`;

            return (
                <div>
                    <AlignedRow label={t('Send status')}>
                        {entity.scheduled ? t('Campaign is scheduled for delivery.') : t('Campaign is ready to be sent out.')}
                    </AlignedRow>

                    <Form stateOwner={this}>
                        <CheckBox id="sendLater" label={t('Send later')} text={t('Schedule deliver at particular date/time')}/>
                        {this.getFormValue('sendLater') &&
                            <div>
                                <DatePicker id="date" label={t('Date')} />
                                <InputField id="time" label={t('Time')} help={t('Enter 24-hour time in format HH:MM (e.g. 13:48)')}/>
                            </div>
                        }
                    </Form>
                    <ButtonRow className={campaignsStyles.sendButtonRow}>
                        {this.getFormValue('sendLater') ?
                            <Button className="btn-primary" icon="send" label={(entity.scheduled ? t('Reschedule send') : t('Schedule send')) + subscrInfo} onClickAsync={::this.scheduleAsync}/>
                            :
                            <Button className="btn-primary" icon="send" label={t('Send') + subscrInfo} onClickAsync={::this.startAsync}/>
                        }
                    </ButtonRow>
                </div>
            );

        } else if (entity.status === CampaignStatus.SENDING || (entity.status === CampaignStatus.SCHEDULED && !entity.scheduled)) {
            return (
                <div>
                    <AlignedRow label={t('Send status')}>
                        {t('Campaign is being sent out.')}
                    </AlignedRow>
                    <ButtonRow>
                        <Button className="btn-primary" icon="stop" label={t('Stop')} onClickAsync={::this.stopAsync}/>
                    </ButtonRow>
                </div>
            );

        } else if (entity.status === CampaignStatus.FINISHED) {
            return (
                <div>
                    <AlignedRow label={t('Send status')}>
                        {t('All messages sent! Hit "Continue" if you you want to send this campaign to new subscribers.')}
                    </AlignedRow>
                    <ButtonRow>
                        <Button className="btn-primary" icon="play" label={t('Continue')} onClickAsync={::this.startAsync}/>
                        <Button className="btn-primary" icon="refresh" label={t('Reset')} onClickAsync={::this.resetAsync}/>
                    </ButtonRow>
                </div>
            );
        } else {

            return null;
        }
    }
}

@translate()
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
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
                sendSettings.push(<AlignedRow key={id} label={label}>{entity[id + '_override'] === null ? this.state.sendConfiguration[id] : entity[id + '_override']}</AlignedRow>);
            };

            addOverridable('from_name', t('"From" name'));
            addOverridable('from_email', t('"From" email address'));
            addOverridable('reply_to', t('"Reply-to" email address'));
            addOverridable('subject', t('"Subject" line'));
        } else {
            sendSettings =  <AlignedRow>{t('Loading send configuration ...')}</AlignedRow>
        }

        const listsColumns = [
            { data: 1, title: t('Name') },
            { data: 2, title: t('ID'), render: data => <code>{data}</code> },
            { data: 4, title: t('Segment') },
            { data: 3, title: t('List namespace') }
        ];

        return (
            <div>
                <Title>{t('Campaign Status')}</Title>

                <AlignedRow label={t('Name')}>{entity.name}</AlignedRow>
                <AlignedRow label={t('Subscribers')}>{entity.subscriptionsTotal === undefined ? t('computing ...') : entity.subscriptionsTotal}</AlignedRow>
                <AlignedRow label={t('Status')}>{this.campaignStatusLabels[entity.status]}</AlignedRow>

                {sendSettings}

                <AlignedRow label={t('Target lists/segments')}>
                    <Table withHeader dataUrl={`rest/lists-with-segment-by-campaign-table/${this.props.entity.id}`} columns={listsColumns} />
                </AlignedRow>

                <hr/>

                <TestUser entity={entity}/>

                <hr/>

                <SendControls entity={entity} refreshEntity={::this.refreshEntity}/>
            </div>
        );
    }
}