'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import {requiresAuthenticatedUser, withPageHelpers, Title, Toolbar, NavButton} from '../../lib/page';
import { withErrorHandling } from '../../lib/error-handling';
import { Table } from '../../lib/table';

@translate()
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class List extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    static propTypes = {
        list: PropTypes.object
    }

    componentDidMount() {
    }

    render() {
        const t = this.props.t;

        const columns = [
            { data: 1, title: t('Name') },
            {
                actions: data => [{
                    label: <span className="glyphicon glyphicon-edit" aria-hidden="true" title="Edit"></span>,
                    link: `/lists/${this.props.list.id}/segments/${data[0]}/edit`
                }]
            }
        ];

        return (
            <div>
                <Toolbar>
                    <NavButton linkTo={`/lists/${this.props.list.id}/segments/create`} className="btn-primary" icon="plus" label={t('Create Segment')}/>
                </Toolbar>

                <Title>{t('Segment')}</Title>

                <Table withHeader dataUrl={`/rest/segments-table/${this.props.list.id}`} columns={columns} />
            </div>
        );
    }
}