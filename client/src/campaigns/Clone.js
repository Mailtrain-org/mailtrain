'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from '../lib/i18n';
import {requiresAuthenticatedUser, Title, withPageHelpers} from '../lib/page'
import {Button, ButtonRow, Form, TableSelect, withForm, withFormErrorHandlers} from '../lib/form';
import {withErrorHandling} from '../lib/error-handling';
import {getTagLanguages, getTemplateTypes, ResourceType} from '../templates/helpers';
import moment from 'moment';
import {getMailerTypes} from "../send-configurations/helpers";
import {getCampaignLabels} from "./helpers";
import {withComponentMixins} from "../lib/decorator-helpers";

@withComponentMixins([
    withTranslation,
    withForm,
    withErrorHandling,
    withPageHelpers,
    requiresAuthenticatedUser
])
export default class Clone extends Component {
    constructor(props) {
        super(props);

        const t = props.t;

        this.templateTypes = getTemplateTypes(props.t, 'data_sourceCustom_', ResourceType.CAMPAIGN);
        this.tagLanguages = getTagLanguages(props.t);

        this.mailerTypes = getMailerTypes(props.t);

        const { campaignTypeLabels } = getCampaignLabels(t);
        this.campaignTypeLabels = campaignTypeLabels;

        this.initForm({
            leaveConfirmation: false,
        });
    }

    static propTypes = {
        cloneFromChannel: PropTypes.object
    }

    componentDidMount() {
        this.populateFormValues({
            sourceCampaign: null
        });
    }

    localValidateFormValues(state) {
        const t = this.props.t;
        const isEdit = !!this.props.entity;

        for (const key of state.keys()) {
            state.setIn([key, 'error'], null);
        }

        if (!state.getIn(['sourceCampaign', 'value'])) {
            state.setIn(['sourceCampaign', 'error'], t('campaignMustBeSelected'));
        }
    }

    @withFormErrorHandlers
    async submitHandler(afterSubmitAction) {
        const t = this.props.t;

        const sourceCampaign = this.getFormValue('sourceCampaign');
        this.navigateTo(`/campaigns/clone/${sourceCampaign}`);
    }

    render() {
        const t = this.props.t;
        const campaignsColumns = [
            { data: 1, title: t('name') },
            { data: 2, title: t('id'), render: data => <code>{data}</code> },
            { data: 3, title: t('description') },
            { data: 4, title: t('type'), render: data => this.campaignTypeLabels[data] },
            { data: 9, title: t('created'), render: data => moment(data).fromNow() },
            { data: 10, title: t('namespace') }
        ];

        let campaignSelect;
        if (this.props.cloneFromChannel) {
            campaignSelect = <TableSelect id="sourceCampaign" label={t('campaign')} withHeader dropdown dataUrl={`rest/campaigns-by-channel-table/${this.props.cloneFromChannel.id}`} columns={campaignsColumns} order={[4, 'desc']} selectionLabelIndex={1} help={t('selectCampaignToBeCloned')}/>
        } else {
            campaignSelect = <TableSelect id="sourceCampaign" label={t('campaign')} withHeader dropdown dataUrl='rest/campaigns-table' columns={campaignsColumns} order={[4, 'desc']} selectionLabelIndex={1} help={t('selectCampaignToBeCloned')}/>
        }

        return (
            <div>
                <Title>{t('createCampaign')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    {campaignSelect}

                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="chevron-right" label={t('next')}/>
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}
