'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from '../lib/i18n';
import {requiresAuthenticatedUser, Title, withPageHelpers} from '../lib/page';
import {withErrorHandling} from '../lib/error-handling';
import {Table} from "../lib/table";
import {withComponentMixins} from "../lib/decorator-helpers";

@withComponentMixins([
    withTranslation,
    withErrorHandling,
    withPageHelpers,
    requiresAuthenticatedUser
])
export default class StatisticsLinkClicks extends Component {
    constructor(props) {
        super(props);

        const t = props.t;

        this.state = {
        };
}

    static propTypes = {
        entity: PropTypes.object,
        title: PropTypes.string
    }


    render() {
        const t = this.props.t;

        const linksColumns = [
            { data: 0, title: t('url'), render: data => <code>{data}</code> },
            { data: 1, title: t('uniqueVisitors') },
            { data: 2, title: t('totalClicks') }
        ];

        return (
            <div>
                <Title>{t('campaignLinks')}</Title>

                <Table ref={node => this.table = node} withHeader dataUrl={`rest/campaigns-link-clicks-table/${this.props.entity.id}`} columns={linksColumns} />
           </div>
        );
    }
}