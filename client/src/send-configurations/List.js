'use strict';

import React, {Component} from 'react';
import { withTranslation } from '../lib/i18n';
import {Icon} from '../lib/bootstrap-components';
import {
    NavButton,
    requiresAuthenticatedUser,
    Title,
    Toolbar,
    withPageHelpers
} from '../lib/page';
import {
    withAsyncErrorHandler,
    withErrorHandling
} from '../lib/error-handling';
import {Table} from '../lib/table';
import axios from '../lib/axios';
import moment from 'moment';
import {getMailerTypes} from './helpers';
import {checkPermissions} from "../lib/permissions";
import {
    tableAddDeleteButton,
    tableRestActionDialogInit,
    tableRestActionDialogRender
} from "../lib/modals";


@withTranslation()
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class List extends Component {
    constructor(props) {
        super(props);

        this.mailerTypes = getMailerTypes(props.t);

        this.state = {};
        tableRestActionDialogInit(this);
    }

    @withAsyncErrorHandler
    async fetchPermissions() {
        const result = await checkPermissions({
            createSendConfiguration: {
                entityTypeId: 'namespace',
                requiredOperations: ['createSendConfiguration']
            }
        });

        this.setState({
            createPermitted: result.data.createSendConfiguration
        });
    }

    componentDidMount() {
        // noinspection JSIgnoredPromiseFromCall
        this.fetchPermissions();
    }

    render() {
        const t = this.props.t;

        const columns = [
            { data: 1, title: t('name') },
            { data: 2, title: t('id'), render: data => <code>{data}</code> },
            { data: 3, title: t('description') },
            { data: 4, title: t('type'), render: data => this.mailerTypes[data].typeName },
            { data: 5, title: t('created'), render: data => moment(data).fromNow() },
            { data: 6, title: t('namespace') },
            {
                actions: data => {
                    const actions = [];
                    const perms = data[7];

                    if (perms.includes('edit')) {
                        actions.push({
                            label: <Icon icon="edit" title={t('edit')}/>,
                            link: `/send-configurations/${data[0]}/edit`
                        });
                    }

                    if (perms.includes('share')) {
                        actions.push({
                            label: <Icon icon="share-alt" title={t('share')}/>,
                            link: `/send-configurations/${data[0]}/share`
                        });
                    }

                    tableAddDeleteButton(actions, this, perms, `rest/send-configurations/${data[0]}`, data[1], t('deletingSendConfiguration'), t('sendConfigurationDeleted'));

                    return actions;
                }
            }
        ];

        return (
            <div>
                {tableRestActionDialogRender(this)}
                {this.state.createPermitted &&
                    <Toolbar>
                        <NavButton linkTo="/send-configurations/create" className="btn-primary" icon="plus" label={t('createSendConfiguration')}/>
                    </Toolbar>
                }

                <Title>{t('sendConfigurations-1')}</Title>

                <Table ref={node => this.table = node} withHeader dataUrl="rest/send-configurations-table" columns={columns} />
            </div>
        );
    }
}