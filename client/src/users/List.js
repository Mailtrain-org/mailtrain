'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { requiresAuthenticatedUser, withPageHelpers, Title, Toolbar, NavButton } from '../lib/page';
import { Table } from '../lib/table';
import mailtrainConfig from 'mailtrainConfig';

@translate()
@withPageHelpers
@requiresAuthenticatedUser
export default class List extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const t = this.props.t;

        const actions = data => [
            {
                label: 'Edit',
                link: '/users/edit/' + data[0]
            },
            {
                label: 'Shares',
                link: '/users/shares/' + data[0]
            }
        ];

        const columns = [
            { data: 0, title: "#" },
            { data: 1, title: "Username" }
        ];

        if (mailtrainConfig.isAuthMethodLocal) {
            columns.push({ data: 2, title: "Full Name" });
        }

        columns.push({ data: 3, title: "Namespace" });
        columns.push({ data: 4, title: "Role" });

        return (
            <div>
                <Toolbar>
                    <NavButton linkTo="/users/create" className="btn-primary" icon="plus" label={t('Create User')}/>
                </Toolbar>

                <Title>{t('Users')}</Title>

                <Table withHeader dataUrl="/rest/users-table" columns={columns} actions={actions} />
            </div>
        );
    }
}