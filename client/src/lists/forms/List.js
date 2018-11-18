'use strict';

import React, { Component } from 'react';
import { withTranslation } from '../../lib/i18n';
import {requiresAuthenticatedUser, withPageHelpers, Title, Toolbar, NavButton} from '../../lib/page';
import { withErrorHandling, withAsyncErrorHandler } from '../../lib/error-handling';
import { Table } from '../../lib/table';
import axios from '../../lib/axios';
import {Icon} from "../../lib/bootstrap-components";
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

        this.state = {};
        tableDeleteDialogInit(this);
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
            { data: 1, title: t('name') },
            { data: 2, title: t('description') },
            { data: 3, title: t('namespace') },
            {
                actions: data => {
                    const actions = [];
                    const perms = data[4];

                    if (perms.includes('edit')) {
                        actions.push({
                            label: <Icon icon="edit" title={t('edit')}/>,
                            link: `/lists/forms/${data[0]}/edit`
                        });
                    }
                    if (perms.includes('share')) {
                        actions.push({
                            label: <Icon icon="share-alt" title={t('share')}/>,
                            link: `/lists/forms/${data[0]}/share`
                        });
                    }

                    tableDeleteDialogAddDeleteButton(actions, this, perms, data[0], data[1]);

                    return actions;
                }
            }
        ];

        return (
            <div>
                {tableDeleteDialogRender(this, `rest/forms`, t('deletingForm'), t('formDeleted'))}
                {this.state.createPermitted &&
                    <Toolbar>
                        <NavButton linkTo="/lists/forms/create" className="btn-primary" icon="plus" label={t('createCustomForm')}/>
                    </Toolbar>
                }

                <Title>{t('forms')}</Title>

                <Table ref={node => this.table = node} withHeader dataUrl="rest/forms-table" columns={columns} />
            </div>
        );
    }
}