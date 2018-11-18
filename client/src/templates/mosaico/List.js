'use strict';

import React, { Component } from 'react';
import { withTranslation } from '../../lib/i18n';
import {DropdownMenu, Icon} from '../../lib/bootstrap-components';
import { requiresAuthenticatedUser, withPageHelpers, Title, Toolbar, MenuLink } from '../../lib/page';
import { withErrorHandling, withAsyncErrorHandler } from '../../lib/error-handling';
import { Table } from '../../lib/table';
import axios from '../../lib/axios';
import moment from 'moment';
import { getTemplateTypes } from './helpers';
import {checkPermissions} from "../../lib/permissions";
import {
    tableDeleteDialogAddDeleteButton,
    tableDeleteDialogInit,
    tableDeleteDialogRender
} from "../../lib/modals";


@withTranslation()
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class List extends Component {
    constructor(props) {
        super(props);

        this.templateTypes = getTemplateTypes(props.t);

        this.state = {};
        tableDeleteDialogInit(this);
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
            { data: 1, title: t('name') },
            { data: 2, title: t('description') },
            { data: 3, title: t('type'), render: data => this.templateTypes[data].typeName },
            { data: 4, title: t('created'), render: data => moment(data).fromNow() },
            { data: 5, title: t('namespace') },
            {
                actions: data => {
                    const actions = [];
                    const perms = data[6];

                    if (perms.includes('edit')) {
                        actions.push({
                            label: <Icon icon="edit" title={t('edit')}/>,
                            link: `/templates/mosaico/${data[0]}/edit`
                        });
                    }

                    if (perms.includes('viewFiles')) {
                        actions.push({
                            label: <Icon icon="hdd" title={t('files')}/>,
                            link: `/templates/mosaico/${data[0]}/files`
                        });
                    }

                    if (perms.includes('viewFiles')) {
                        actions.push({
                            label: <Icon icon="th-large" title={t('blockThumbnails')}/>,
                            link: `/templates/mosaico/${data[0]}/blocks`
                        });
                    }

                    if (perms.includes('share')) {
                        actions.push({
                            label: <Icon icon="share-alt" title={t('share')}/>,
                            link: `/templates/mosaico/${data[0]}/share`
                        });
                    }

                    tableDeleteDialogAddDeleteButton(actions, this, perms, data[0], data[1]);

                    return actions;
                }
            }
        ];

        return (
            <div>
                {tableDeleteDialogRender(this, `rest/mosaico-templates`, t('deletingMosaicoTemplate'), t('mosaicoTemplateDeleted'))}
                {this.state.createPermitted &&
                    <Toolbar>
                        <DropdownMenu className="btn-primary" label={t('createMosaicoTemplate')}>
                            <MenuLink to="/templates/mosaico/create">{t('blank')}</MenuLink>
                            <MenuLink to="/templates/mosaico/create/versafix">{t('versafixOne')}</MenuLink>
                        </DropdownMenu>
                    </Toolbar>
                }

                <Title>{t('mosaicoTemplates')}</Title>

                <Table ref={node => this.table = node} withHeader dataUrl="rest/mosaico-templates-table" columns={columns} />
            </div>
        );
    }
}