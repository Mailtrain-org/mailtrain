'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { Title, Toolbar, NavButton } from '../lib/page';
import { Table } from '../lib/table';
import moment from 'moment';

@translate()
export default class List extends Component {
    render() {
        const t = this.props.t;

        const actionLinks = [{
            label: 'Edit',
            link: data => '/reports/edit/' + data[0]
        }];

        const columns = [
            { data: 0, title: "#" },
            { data: 1, title: t('Name') },
            { data: 2, title: t('Template') },
            { data: 3, title: t('Description') },
            { data: 4, title: t('Last Run'), render: data => data ? moment(data).fromNow() : t('Not run yet') }
        ];

        return (
            <div>
                <Toolbar>
                    <NavButton linkTo="/reports/create" className="btn-primary" icon="plus" label={t('Create Report')}/>
                    <NavButton linkTo="/reports/templates" className="btn-primary" label={t('Report Templates')}/>
                </Toolbar>

                <Title>{t('Reports')}</Title>

                <Table withHeader dataUrl="/rest/reports-table" columns={columns} actionLinks={actionLinks} />
            </div>
        );
    }
}