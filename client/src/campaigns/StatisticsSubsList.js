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
export default class StatisticsSubsList extends Component {
    constructor(props) {
        super(props);

        const t = props.t;

        this.state = {
        };
}

    static propTypes = {
        entity: PropTypes.object,
        status: PropTypes.number,
        title: PropTypes.string
    }


    render() {
        const t = this.props.t;

        const subscribersColumns = [
            { data: 0, title: t('email') },
            { data: 1, title: t('subscriptionId'), render: data => <code>{data}</code> },
            { data: 2, title: t('listId'), render: data => <code>{data}</code> },
            { data: 3, title: t('list') },
            { data: 4, title: t('listNamespace') }
        ];

        return (
            <div>
                <Title>{this.props.title}</Title>

                <Table ref={node => this.table = node} withHeader dataUrl={`rest/campaigns-subscribers-by-status-table/${this.props.entity.id}/${this.props.status}`} columns={subscribersColumns} />
           </div>
        );
    }
}