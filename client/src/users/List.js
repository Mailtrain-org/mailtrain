'use strict';

import React, {Component} from "react";
import {withTranslation} from '../lib/i18n';
import {LinkButton, requiresAuthenticatedUser, Title, Toolbar, withPageHelpers} from "../lib/page";
import {Table} from "../lib/table";
import mailtrainConfig from "mailtrainConfig";
import {Icon} from "../lib/bootstrap-components";
import {tableAddDeleteButton, tableRestActionDialogInit, tableRestActionDialogRender} from "../lib/modals";
import {withComponentMixins} from "../lib/decorator-helpers";

@withComponentMixins([
    withTranslation,
    withPageHelpers,
    requiresAuthenticatedUser
])
export default class List extends Component {
    constructor(props) {
        super(props);

        this.state = {};
        tableRestActionDialogInit(this);
    }

    render() {
        // There are no permissions checks here because this page makes no sense for anyone who does not have manageUsers permission
        // Once someone has this permission, then all on this page can be used.

        const t = this.props.t;

        const columns = [
            { data: 1, title: t("username") },
        ];

        if (mailtrainConfig.isAuthMethodLocal) {
            columns.push({ data: 2, title: t("fullName") });
        }

        columns.push({ data: 3, title: t("namespace") });
        columns.push({ data: 4, title: t("role") });

        columns.push({
            actions: data => {
                const actions = [];

                actions.push({
                    label: <Icon icon="edit" title={t('edit')}/>,
                    link: `/users/${data[0]}/edit`
                });

                actions.push({
                    label: <Icon icon="share-square" title={t('share')}/>,
                    link: `/users/${data[0]}/shares`
                });

                tableAddDeleteButton(actions, this, null, `rest/users/${data[0]}`, data[1], t('deletingUser'), t('userDeleted'));

                return actions;
            }
        });

        return (
            <div>
                {tableRestActionDialogRender(this)}
                <Toolbar>
                    <LinkButton to="/users/create" className="btn-primary" icon="plus" label={t('createUser')}/>
                </Toolbar>

                <Title>{t('users')}</Title>

                <Table ref={node => this.table = node} withHeader dataUrl="rest/users-table" columns={columns} />
            </div>
        );
    }
}
