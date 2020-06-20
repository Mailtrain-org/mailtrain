'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from '../lib/i18n';
import {LinkButton, requiresAuthenticatedUser, Title, withPageHelpers} from '../lib/page'
import {
    AlignedRow,
    Button,
    ButtonRow,
    CheckBox,
    Dropdown,
    Fieldset,
    filterData,
    Form,
    FormSendMethod,
    InputField,
    StaticField,
    TableSelect,
    TextArea,
    withForm,
    withFormErrorHandlers
} from '../lib/form';
import {withAsyncErrorHandler, withErrorHandling} from '../lib/error-handling';
import {getDefaultNamespace, NamespaceSelect, validateNamespace} from '../lib/namespace';
import {DeleteModalDialog} from "../lib/modals";
import mailtrainConfig from 'mailtrainConfig';
import {getTagLanguages, getTemplateTypes, getTypeForm, ResourceType} from '../templates/helpers';
import axios from '../lib/axios';
import styles from "../lib/styles.scss";
import campaignsStyles from "./styles.scss";
import {getUrl} from "../lib/urls";
import {campaignOverridables, CampaignSource, CampaignStatus, CampaignType} from "../../../shared/campaigns";
import moment from 'moment';
import {getMailerTypes} from "../send-configurations/helpers";
import {getCampaignLabels} from "./helpers";
import {withComponentMixins} from "../lib/decorator-helpers";
import interoperableErrors from "../../../shared/interoperable-errors";
import {Trans} from "react-i18next";
import {Table} from "../lib/table";

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

        return (
            <div>
                <Title>{t('Create campaign')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <TableSelect id="sourceCampaign" label={t('campaign')} withHeader dropdown dataUrl='rest/campaigns-table' columns={campaignsColumns} order={[4, 'desc']} selectionLabelIndex={1} help={t('Select campaign to be cloned.')}/>

                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="chevron-right" label={t('Next')}/>
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}
