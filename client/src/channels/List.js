'use strict';

import React, {Component} from 'react';
import {withTranslation} from '../lib/i18n';
import {Icon} from '../lib/bootstrap-components';
import {LinkButton, requiresAuthenticatedUser, Title, Toolbar, withPageHelpers} from '../lib/page';
import {withErrorHandling} from '../lib/error-handling';
import {Table} from '../lib/table';
import {tableAddDeleteButton, tableRestActionDialogInit, tableRestActionDialogRender} from "../lib/modals";
import {withComponentMixins} from "../lib/decorator-helpers";
import styles from "./styles.scss";
import PropTypes from 'prop-types';

@withComponentMixins([
    withTranslation,
    withErrorHandling,
    withPageHelpers,
    requiresAuthenticatedUser
])
export default class List extends Component {
    constructor(props) {
        super(props);

        const t = props.t;

        this.state = {};
        tableRestActionDialogInit(this);
    }

    static propTypes = {
        permissions: PropTypes.object
    }

    render() {
        const t = this.props.t;

        const permissions = this.props.permissions;
        const createPermitted = permissions.createChannel;

        const columns = [
            {
                data: 1,
                title: t('name'),
                actions: data => {
                    const perms = data[5];
                    if (perms.includes('view')) {
                        return [{label: data[1], link: `/channels/${data[0]}/campaigns`}];
                    } else {
                        return [{label: data[1]}];
                    }
                }
            },
            { data: 2, title: t('id'), render: data => <code>{data}</code> },
            { data: 3, title: t('description') },
            { data: 4, title: t('namespace') },
            {
                className: styles.tblCol_buttons,
                actions: data => {
                    const actions = [];
                    const perms = data[5];

                    if (perms.includes('view')) {
                        actions.push({
                            label: <Icon icon="inbox" title={t('campaigns')}/>,
                            link: `/channels/${data[0]}/campaigns`
                        });
                    }

                    if (perms.includes('view') || perms.includes('edit')) {
                        actions.push({
                            label: <Icon icon="edit" title={t('edit')}/>,
                            link: `/channels/${data[0]}/edit`
                        });
                    }

                    if (perms.includes('share')) {
                        actions.push({
                            label: <Icon icon="share" title={t('share')}/>,
                            link: `/channels/${data[0]}/share`
                        });
                    }

                    tableAddDeleteButton(actions, this, perms, `rest/channels/${data[0]}`, data[1], t('deletingChannel'), t('channelDeleted'));

                    return actions;
                }
            }
        ];

        return (
            <div>
                {tableRestActionDialogRender(this)}
                <Toolbar>
                    {createPermitted &&
                        <LinkButton to="/channels/create" className="btn-primary" icon="plus" label={t('createChannel')}/>
                    }
                </Toolbar>

                <Title>{t('channels')}</Title>

                <Table ref={node => this.table = node} withHeader dataUrl="rest/channels-table" columns={columns} />
            </div>
        );
    }
}
