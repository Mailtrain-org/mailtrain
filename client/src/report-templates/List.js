'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { DropdownMenu } from '../lib/bootstrap-components';
import { Title, Toolbar, DropdownLink } from '../lib/page';
import { Table } from '../lib/table';
import moment from 'moment';

@translate()
export default class List extends Component {
    render() {
        const t = this.props.t;

        const actionLinks = [{
            label: 'Edit',
            link: data => '/report-templates/edit/' + data[0]
        }];

        const columns = [
            { data: 0, title: "#" },
            { data: 1, title: t('Name') },
            { data: 2, title: t('Description') },
            { data: 3, title: t('Created'), render: data => moment(data).fromNow() }
        ];

        return (
            <div>
                <Toolbar>
                    <DropdownMenu className="btn-primary" label={t('Create Report Template')}>
                        <DropdownLink to="/report-templates/create">{t('Blank')}</DropdownLink>
                        <DropdownLink to="/report-templates/create/subscribers-all">{t('All Subscribers')}</DropdownLink>
                        <DropdownLink to="/report-templates/create/subscribers-grouped">{t('Grouped Subscribers')}</DropdownLink>
                        <DropdownLink to="/report-templates/create/export-list-csv">{t('Export List as CSV')}</DropdownLink>
                    </DropdownMenu>
                </Toolbar>

                <Title>{t('Users')}</Title>

                <Table withHeader dataUrl="/rest/report-templates-table" columns={columns} actionLinks={actionLinks} />
            </div>
        );
    }
}