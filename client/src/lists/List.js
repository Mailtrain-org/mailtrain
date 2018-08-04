'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import {requiresAuthenticatedUser, withPageHelpers, Title, Toolbar, NavButton} from '../lib/page';
import { withErrorHandling, withAsyncErrorHandler } from '../lib/error-handling';
import { Table } from '../lib/table';
import axios from '../lib/axios';
import {Link} from "react-router-dom";
import {Icon} from "../lib/bootstrap-components";
import {checkPermissions} from "../lib/permissions";

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
            createList: {
                entityTypeId: 'namespace',
                requiredOperations: ['createList']
            }
        });

        this.setState({
            createPermitted: result.data.createList
        });
    }

    componentDidMount() {
        this.fetchPermissions();
    }

    render() {
        const t = this.props.t;

        const columns = [
            {
                data: 1,
                title: t('Name'),
                actions: data => {
                    const perms = data[7];
                    if (perms.includes('viewSubscriptions')) {
                        return [{label: data[1], link: `/lists/${data[0]}/subscriptions`}];
                    } else {
                        return [{label: data[1]}];
                    }
                }
            },
            { data: 2, title: t('ID'), render: data => <code>{data}</code> },
            { data: 3, title: t('Subscribers') },
            { data: 4, title: t('Description') },
            { data: 5, title: t('Namespace') },
            {
                actions: data => {
                    const actions = [];
                    const triggersCount = data[6];
                    const perms = data[7];
                    console.log(data);

                    if (perms.includes('viewSubscriptions')) {
                        actions.push({
                            label: <Icon icon="user" title="Subscribers"/>,
                            link: `/lists/${data[0]}/subscriptions`
                        });
                    }

                    if (perms.includes('edit')) {
                        actions.push({
                            label: <Icon icon="edit" title={t('Edit')}/>,
                            link: `/lists/${data[0]}/edit`
                        });
                    }

                    if (perms.includes('viewFields')) {
                        actions.push({
                            label: <Icon icon="th-list" title={t('Fields')}/>,
                            link: `/lists/${data[0]}/fields`
                        });
                    }

                    if (perms.includes('viewSegments')) {
                        actions.push({
                            label: <Icon icon="tag" title={t('Segments')}/>,
                            link: `/lists/${data[0]}/segments`
                        });
                    }

                    if (triggersCount > 0) {
                        actions.push({
                            label: <Icon icon="flash" title={t('Triggers')}/>,
                            link: `/lists/${data[0]}/triggers`
                        });
                    }

                    if (perms.includes('share')) {
                        actions.push({
                            label: <Icon icon="share-alt" title={t('Share')}/>,
                            link: `/lists/${data[0]}/share`
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
                        <NavButton linkTo="/lists/create" className="btn-primary" icon="plus" label={t('Create List')}/>
                        <NavButton linkTo="/lists/forms" className="btn-primary" label={t('Custom Forms')}/>
                    </Toolbar>
                }

                <Title>{t('Lists')}</Title>

                <Table withHeader dataUrl="rest/lists-table" columns={columns} />
            </div>
        );
    }
}