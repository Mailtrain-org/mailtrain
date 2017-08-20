'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import {requiresAuthenticatedUser, withPageHelpers, Title, Toolbar, NavButton} from '../../lib/page';
import { withErrorHandling } from '../../lib/error-handling';
import { Table } from '../../lib/table';
import { getFieldTypes } from './helpers';
import {Icon} from "../../lib/bootstrap-components";

@translate()
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class List extends Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.fieldTypes = getFieldTypes(props.t);
    }

    static propTypes = {
        list: PropTypes.object
    }

    componentDidMount() {
    }

    render() {
        const t = this.props.t;

        const columns = [
            { data: 4, title: "#" },
            { data: 1, title: t('Name'),
                render: (data, cmd, rowData) => rowData[2] === 'option' ? <span><span className="glyphicon glyphicon-record" aria-hidden="true"></span> {data}</span> : data
            },
            { data: 2, title: t('Type'), render: data => this.fieldTypes[data].label, sortable: false, searchable: false },
            { data: 3, title: t('Merge Tag') },
            {
                actions: data => [{
                    label: <Icon icon="edit" title={t('Edit')}/>,
                    link: `/lists/${this.props.list.id}/fields/${data[0]}/edit`
                }]
            }
        ];

        return (
            <div>
                <Toolbar>
                    <NavButton linkTo={`/lists/${this.props.list.id}/fields/create`} className="btn-primary" icon="plus" label={t('Create Field')}/>
                </Toolbar>

                <Title>{t('Fields')}</Title>

                <Table withHeader dataUrl={`/rest/fields-table/${this.props.list.id}`} columns={columns} />
            </div>
        );
    }
}