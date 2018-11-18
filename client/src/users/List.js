'use strict';

import React, {Component} from "react";
import { withTranslation } from '../lib/i18n';
import {NavButton, requiresAuthenticatedUser, Title, Toolbar, withPageHelpers} from "../lib/page";
import {Table} from "../lib/table";
import mailtrainConfig from "mailtrainConfig";
import {Icon} from "../lib/bootstrap-components";
import {
    tableDeleteDialogAddDeleteButton,
    tableDeleteDialogInit,
    tableDeleteDialogRender
} from "../lib/modals";

@withTranslation()
@withPageHelpers
@requiresAuthenticatedUser
export default class List extends Component {
    constructor(props) {
        super(props);

        this.state = {};
        tableDeleteDialogInit(this);
    }

    render() {
        // There are no permissions checks here because this page makes no sense for anyone who does not have manageUsers permission
        // Once someone has this permission, then all on this page can be used.

        const t = this.props.t;

        const columns = [
            { data: 1, title: "Username" },
        ];

        if (mailtrainConfig.isAuthMethodLocal) {
            columns.push({ data: 2, title: "Full Name" });
        }

        columns.push({ data: 3, title: "Namespace" });
        columns.push({ data: 4, title: "Role" });

        columns.push({
            actions: data => {
                const actions = [];

                actions.push({
                    label: <Icon icon="edit" title={t('edit')}/>,
                    link: `/users/${data[0]}/edit`
                });

                actions.push({
                    label: <Icon icon="share" title={t('share')}/>,
                    link: `/users/${data[0]}/shares`
                });

                tableDeleteDialogAddDeleteButton(actions, this, null, data[0], data[1]);

                return actions;
            }
        });

        return (
            <div>
                {tableDeleteDialogRender(this, `rest/users`, t('deletingUser'), t('userDeleted'))}
                <Toolbar>
                    <NavButton linkTo="/users/create" className="btn-primary" icon="plus" label={t('createUser')}/>
                </Toolbar>

                <Title>{t('users')}</Title>

                <Table ref={node => this.table = node} withHeader dataUrl="rest/users-table" columns={columns} />
            </div>
        );
    }
}