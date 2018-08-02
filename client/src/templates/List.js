'use strict';

import React, {Component} from 'react';
import {translate} from 'react-i18next';
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
import moment from 'moment';
import {getTemplateTypes} from './helpers';
import {checkPermissions} from "../lib/permissions";

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
            createTemplate: {
                entityTypeId: 'namespace',
                requiredOperations: ['createTemplate']
            },
            createMosaicoTemplate: {
                entityTypeId: 'namespace',
                requiredOperations: ['createMosaicoTemplate']
            },
            viewMosaicoTemplate: {
                entityTypeId: 'mosaicoTemplate',
                requiredOperations: ['view']
            }
        });

        this.setState({
            createPermitted: result.data.createTemplate,
            mosaicoTemplatesPermitted: result.data.createMosaicoTemplate || result.data.viewMosaicoTemplate
        });
    }

    componentDidMount() {
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
                            link: `/templates/${data[0]}/edit`
                        });
                    }

                    if (perms.includes('viewFiles')) {
                        actions.push({
                            label: <Icon icon="hdd" title={t('Files')}/>,
                            link: `/templates/${data[0]}/files`
                        });
                    }

                    if (perms.includes('share')) {
                        actions.push({
                            label: <Icon icon="share-alt" title={t('Share')}/>,
                            link: `/templates/${data[0]}/share`
                        });
                    }

                    return actions;
                }
            }
        ];

        return (
            <div>
                <Toolbar>
                    {this.state.createPermitted &&
                       <NavButton linkTo="/templates/create" className="btn-primary" icon="plus" label={t('Create Template')}/>
                    }
                    {this.state.mosaicoTemplatesPermitted &&
                        <NavButton linkTo="/templates/mosaico" className="btn-primary" label={t('Mosaico Templates')}/>
                    }
                </Toolbar>

                <Title>{t('Templates')}</Title>

                <Table withHeader dataUrl="rest/templates-table" columns={columns} />
            </div>
        );
    }
}