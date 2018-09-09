'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import {requiresAuthenticatedUser, withPageHelpers, Title, Toolbar, NavButton} from '../../lib/page';
import { withErrorHandling, withAsyncErrorHandler } from '../../lib/error-handling';
import { Table } from '../../lib/table';
import axios from '../../lib/axios';
import {Icon} from "../../lib/bootstrap-components";
import {checkPermissions} from "../../lib/permissions";

@translate()
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class List extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    @withAsyncErrorHandler
    async fetchPermissions() {
        const result = await checkPermissions({
            createCustomForm: {
                entityTypeId: 'namespace',
                requiredOperations: ['createCustomForm']
            }
        });

        this.setState({
            createPermitted: result.data.createCustomForm
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
            { data: 3, title: t('Namespace') },
            {
                actions: data => {
                    const actions = [];
                    const perms = data[4];

                    if (perms.includes('edit')) {
                        actions.push({
                            label: <Icon icon="edit" title={t('Edit')}/>,
                            link: `/lists/forms/${data[0]}/edit`
                        });
                    }
                    if (perms.includes('share')) {
                        actions.push({
                            label: <Icon icon="share-alt" title={t('Share')}/>,
                            link: `/lists/forms/${data[0]}/share`
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
                        <NavButton linkTo="/lists/forms/create" className="btn-primary" icon="plus" label={t('Create Custom Form')}/>
                    </Toolbar>
                }

                <Title>{t('Forms')}</Title>

                <Table withHeader dataUrl="rest/forms-table" columns={columns} />
            </div>
        );
    }
}