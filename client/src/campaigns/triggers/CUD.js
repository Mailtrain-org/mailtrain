'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import {
    NavButton,
    requiresAuthenticatedUser,
    Title,
    withPageHelpers
} from '../../lib/page';
import {
    AlignedRow,
    Button,
    ButtonRow,
    CheckBox,
    Dropdown,
    Form,
    FormSendMethod,
    InputField,
    TableSelect,
    TextArea,
    withForm
} from '../../lib/form';
import {withErrorHandling} from '../../lib/error-handling';
import {DeleteModalDialog} from "../../lib/modals";
import {getTriggerTypes} from './helpers';
import {
    Entity,
    Event
} from '../../../../shared/triggers';
import moment from 'moment';
import {getCampaignLabels} from "../helpers";


@translate()
@withForm
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class CUD extends Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.campaignTypeLabels = getCampaignLabels(props.t);

        const {entityLabels, eventLabels} = getTriggerTypes(props.t);
        this.entityLabels = entityLabels;

        this.entityOptions = [
            {key: Entity.SUBSCRIPTION, label: entityLabels[Entity.SUBSCRIPTION]},
            {key: Entity.CAMPAIGN, label: entityLabels[Entity.CAMPAIGN]}
        ];

        const SubscriptionEvent = Event[Entity.SUBSCRIPTION];
        const CampaignEvent = Event[Entity.CAMPAIGN];
        this.eventOptions = {
            [Entity.SUBSCRIPTION]: [
                {key: SubscriptionEvent.CREATED, label: eventLabels[Entity.SUBSCRIPTION][SubscriptionEvent.CREATED]},
                {key: SubscriptionEvent.LATEST_OPEN, label: eventLabels[Entity.SUBSCRIPTION][SubscriptionEvent.LATEST_OPEN]},
                {key: SubscriptionEvent.LATEST_CLICK, label: eventLabels[Entity.SUBSCRIPTION][SubscriptionEvent.LATEST_CLICK]}
            ],
            [Entity.CAMPAIGN]: [
                {key: CampaignEvent.DELIVERED, label: eventLabels[Entity.CAMPAIGN][CampaignEvent.DELIVERED]},
                {key: CampaignEvent.OPENED, label: eventLabels[Entity.CAMPAIGN][CampaignEvent.OPENED]},
                {key: CampaignEvent.CLICKED, label: eventLabels[Entity.CAMPAIGN][CampaignEvent.CLICKED]},
                {key: CampaignEvent.NOT_OPENED, label: eventLabels[Entity.CAMPAIGN][CampaignEvent.NOT_OPENED]},
                {key: CampaignEvent.NOT_CLICKED, label: eventLabels[Entity.CAMPAIGN][CampaignEvent.NOT_CLICKED]}
            ]
        };


        this.initForm();
    }

    static propTypes = {
        action: PropTypes.string.isRequired,
        campaign: PropTypes.object,
        entity: PropTypes.object
    }

    componentDidMount() {
        if (this.props.entity) {
            this.getFormValuesFromEntity(this.props.entity, data => {
                data.daysAfter = (Math.round(data.seconds / (3600 * 24))).toString();

                if (data.entity === Entity.SUBSCRIPTION) {
                    data.subscriptionEvent = data.event;
                } else {
                    data.subscriptionEvent = Event[Entity.SUBSCRIPTION].CREATED;
                }

                if (data.entity === Entity.CAMPAIGN) {
                    data.campaignEvent = data.event;
                } else {
                    data.campaignEvent = Event[Entity.CAMPAIGN].DELIVERED;
                }
            });

        } else {
            this.populateFormValues({
                name: '',
                description: '',
                entity: Entity.SUBSCRIPTION,
                subscriptionEvent: Event[Entity.SUBSCRIPTION].CREATED,
                campaignEvent: Event[Entity.CAMPAIGN].DELIVERED,
                daysAfter: '',
                enabled: true,
                source_campaign: null
            });
        }
    }

    localValidateFormValues(state) {
        const t = this.props.t;

        const entityKey = state.getIn(['entity', 'value']);

        if (!state.getIn(['name', 'value'])) {
            state.setIn(['name', 'error'], t('Name must not be empty'));
        } else {
            state.setIn(['name', 'error'], null);
        }

        const daysAfter = state.getIn(['daysAfter', 'value']).trim();
        if (daysAfter === '') {
            state.setIn(['daysAfter', 'error'], t('Values must not be empty'));
        } else if (isNaN(daysAfter) || Number.parseInt(daysAfter) < 0) {
            state.setIn(['daysAfter', 'error'], t('Value must be a non-negative number'));
        } else {
            state.setIn(['daysAfter', 'error'], null);
        }

        if (entityKey === Entity.CAMPAIGN && !state.getIn(['source_campaign', 'value'])) {
            state.setIn(['source_campaign', 'error'], t('Source campaign must not be empty'));
        } else {
            state.setIn(['source_campaign', 'error'], null);
        }
    }

    async submitHandler() {
        const t = this.props.t;

        let sendMethod, url;
        if (this.props.entity) {
            sendMethod = FormSendMethod.PUT;
            url = `rest/triggers/${this.props.campaign.id}/${this.props.entity.id}`
        } else {
            sendMethod = FormSendMethod.POST;
            url = `rest/triggers/${this.props.campaign.id}`
        }

        try {
            this.disableForm();
            this.setFormStatusMessage('info', t('Saving ...'));

            const submitSuccessful = await this.validateAndSendFormValuesToURL(sendMethod, url, data => {
                data.seconds = Number.parseInt(data.daysAfter) * 3600 * 24;

                if (data.entity === Entity.SUBSCRIPTION) {
                    data.event = data.subscriptionEvent;
                } else if (data.entity === Entity.CAMPAIGN) {
                    data.event = data.campaignEvent;
                }
            });

            if (submitSuccessful) {
                this.navigateToWithFlashMessage(`/campaigns/${this.props.campaign.id}/triggers`, 'success', t('Trigger saved'));
            } else {
                this.enableForm();
                this.setFormStatusMessage('warning', t('There are errors in the form. Please fix them and submit again.'));
            }
        } catch (error) {
            throw error;
        }
    }

    render() {
        const t = this.props.t;
        const isEdit = !!this.props.entity;
        
        const entityKey = this.getFormValue('entity');

        const campaignsColumns = [
            { data: 1, title: t('Name') },
            { data: 2, title: t('ID'), render: data => <code>{data}</code> },
            { data: 3, title: t('Description') },
            { data: 4, title: t('Type'), render: data => this.campaignTypeLabels[data] },
            { data: 5, title: t('Created'), render: data => moment(data).fromNow() },
            { data: 6, title: t('Namespace') }
        ];

        const campaignLists = this.props.campaign.lists.map(x => x.list).join(';');

        return (
            <div>
                {isEdit &&
                    <DeleteModalDialog
                        stateOwner={this}
                        visible={this.props.action === 'delete'}
                        deleteUrl={`rest/triggers/${this.props.campaign.id}/${this.props.entity.id}`}
                        backUrl={`/campaigns/${this.props.campaign.id}/triggers/${this.props.entity.id}/edit`}
                        successUrl={`/campaigns/${this.props.campaign.id}/triggers`}
                        deletingMsg={t('Deleting trigger ...')}
                        deletedMsg={t('Trigger deleted')}/>
                }

                <Title>{isEdit ? t('Edit Trigger') : t('Create Trigger')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <InputField id="name" label={t('Name')}/>
                    <TextArea id="description" label={t('Description')}/>

                    <Dropdown id="entity" label={t('Entity')} options={this.entityOptions} help={t('Select the type of the trigger rule.')}/>

                    <InputField id="daysAfter" label={t('Trigger fires')}/>

                    <AlignedRow>days after:</AlignedRow>

                    {entityKey === Entity.SUBSCRIPTION && <Dropdown id="subscriptionEvent" label={t('Event')} options={this.eventOptions[Entity.SUBSCRIPTION]} help={t('Select the event that triggers sending the campaign.')}/>}

                    {entityKey === Entity.CAMPAIGN && <Dropdown id="campaignEvent" label={t('Event')} options={this.eventOptions[Entity.CAMPAIGN]} help={t('Select the event that triggers sending the campaign.')}/>}

                    {entityKey === Entity.CAMPAIGN &&
                        <TableSelect id="source_campaign" label={t('Campaign')} withHeader dropdown dataUrl={`rest/campaigns-others-by-list-table/${this.props.campaign.id}/${campaignLists}`} columns={campaignsColumns} selectionLabelIndex={1} />
                    }

                    <CheckBox id="enabled" text={t('Enabled')}/>

                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="ok" label={t('Save')}/>
                        {isEdit && <NavButton className="btn-danger" icon="remove" label={t('Delete')} linkTo={`/campaigns/${this.props.campaign.id}/triggers/${this.props.entity.id}/delete`}/>}
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}