'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import {DropdownMenu, Icon} from '../../lib/bootstrap-components';
import { requiresAuthenticatedUser, withPageHelpers, Title, Toolbar, MenuLink } from '../../lib/page';
import { withErrorHandling, withAsyncErrorHandler } from '../../lib/error-handling';
import { Table } from '../../lib/table';
import axios from '../../lib/axios';
import moment from 'moment';
import { getTemplateTypes } from './helpers';
import {checkPermissions} from "../../lib/permissions";


@translate()
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class List extends Component {
    constructor(props) {
        super(props);

        this.templateTypes = getTemplateTypes(props.t);

        this.state = {};
    }

    @withAsyncErrorHandler
    async fetchPermissions() {
        const result = await checkPermissions({
            createMosaicoTemplate: {
                entityTypeId: 'namespace',
                requiredOperations: ['createMosaicoTemplate']
            }
        });

        this.setState({
            createPermitted: result.data.createMosaicoTemplate
        });
    }

    componentDidMount() {
        // noinspection JSIgnoredPromiseFromCall
        this.fetchPermissions();
    }

    render() {
        const t = this.props.t;

        const columns = [
            { data: 1, title: t('Name') },
            { data: 2, title: t('Description') },
            { data: 3, title: t('Type'), render: data => this.templateTypes[data].typeName },
            { data: 4, title: t('Created'), render: data => moment(data).fromNow() },
            { data: 5, title: t('Namespace') },
            {
                actions: data => {
                    const actions = [];
                    const perms = data[6];

                    if (perms.includes('edit')) {
                        actions.push({
                            label: <Icon icon="edit" title={t('Edit')}/>,
                            link: `/templates/mosaico/${data[0]}/edit`
                        });
                    }

                    if (perms.includes('viewFiles')) {
                        actions.push({
                            label: <Icon icon="hdd" title={t('Files')}/>,
                            link: `/templates/mosaico/${data[0]}/files`
                        });
                    }

                    if (perms.includes('viewFiles')) {
                        actions.push({
                            label: <Icon icon="th-large" title={t('Block thumbnails')}/>,
                            link: `/templates/mosaico/${data[0]}/blocks`
                        });
                    }

                    if (perms.includes('share')) {
                        actions.push({
                            label: <Icon icon="share-alt" title={t('Share')}/>,
                            link: `/templates/mosaico/${data[0]}/share`
                        });
                    }

                    return actions;
                }
            }
        ];

        return (
            <div>
                {this.state.createPermitted &&
                    <Toolbar>
                        <DropdownMenu className="btn-primary" label={t('Create Mosaico Template')}>
                            <MenuLink to="/templates/mosaico/create">{t('Blank')}</MenuLink>
                            <MenuLink to="/templates/mosaico/create/versafix">{t('Versafix One')}</MenuLink>
                        </DropdownMenu>
                    </Toolbar>
                }

                <Title>{t('Mosaico Templates')}</Title>

                <Table withHeader dataUrl="rest/mosaico-templates-table" columns={columns} />
            </div>
        );
    }
}