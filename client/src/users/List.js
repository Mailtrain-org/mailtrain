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
        // There are no permissions checks here because this page makes no sense for anyone who does not have manageUsers permission
        // Once someone has this permission, then all on this page can be used.

        const t = this.props.t;

        const actions = data => [
            {
                label: <span className="glyphicon glyphicon-edit" aria-hidden="true" title="Edit"></span>,
                link: `/users/${data[0]}/edit`
            },
            {
                label: <span className="glyphicon glyphicon-share" aria-hidden="true" title="Share"></span>,
                link: `/users/${data[0]}/shares`
            }
        ];

        const columns = [
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