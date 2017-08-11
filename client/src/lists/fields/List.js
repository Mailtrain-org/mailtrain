'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import {requiresAuthenticatedUser, withPageHelpers, Title, Toolbar, NavButton} from '../../lib/page';
import { withErrorHandling } from '../../lib/error-handling';
import { Table } from '../../lib/table';
import { getFieldTypes } from './field-types';

@translate()
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class List extends Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.state.listId = parseInt(props.match.params.listId);
        this.fieldTypes = getFieldTypes(props.t);
    }

    componentDidMount() {
    }

    render() {
        const t = this.props.t;

        const actions = data => [{
            label: <span className="glyphicon glyphicon-edit" aria-hidden="true" title="Edit"></span>,
            link: `/lists/fields/edit/${this.state.listId}/${data[0]}`
        }];

        const columns = [
            { data: 4, title: "#" },
            { data: 1, title: t('Name') },
            { data: 2, title: t('Type'), render: data => this.fieldTypes[data].label, sortable: false, searchable: false },
            { data: 3, title: t('Merge Tag') }
        ];

        return (
            <div>
                <Toolbar>
                    <NavButton linkTo={`/lists/fields/${this.state.listId}/create`} className="btn-primary" icon="plus" label={t('Create Field')}/>
                </Toolbar>

                <Title>{t('Fields')}</Title>

                <Table withHeader dataUrl={`/rest/fields-table/${this.state.listId}`} columns={columns} actions={actions} />
            </div>
        );
    }
}