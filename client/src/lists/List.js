'use strict';

import React, {Component} from 'react';
import {withTranslation} from '../lib/i18n';
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
import {Link} from "react-router-dom";
import {Icon} from "../lib/bootstrap-components";
import {checkPermissions} from "../lib/permissions";
import {
    tableAddDeleteButton,
    tableRestActionDialogInit,
    tableRestActionDialogRender
} from "../lib/modals";
import {withComponentMixins} from "../lib/decorator-helpers";
import {withForm} from "../lib/form";

@withComponentMixins([
    withTranslation,
    withForm,
    withErrorHandling,
    withPageHelpers,
    requiresAuthenticatedUser
])
export default class List extends Component {
    constructor(props) {
        super(props);

        this.state = {};
        tableRestActionDialogInit(this);
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
        // noinspection JSIgnoredPromiseFromCall
        this.fetchPermissions();
    }

    render() {
        const t = this.props.t;

        const columns = [
            {
                data: 1,
                title: t('name'),
                actions: data => {
                    const perms = data[7];
                    if (perms.includes('viewSubscriptions')) {
                        return [{label: data[1], link: `/lists/${data[0]}/subscriptions`}];
                    } else {
                        return [{label: data[1]}];
                    }
                }
            },
            { data: 2, title: t('id'), render: data => <code>{data}</code> },
            { data: 3, title: t('subscribers') },
            { data: 4, title: t('description') },
            { data: 5, title: t('namespace') },
            {
                actions: data => {
                    const actions = [];
                    const triggersCount = data[6];
                    const perms = data[7];

                    if (perms.includes('viewSubscriptions')) {
                        actions.push({
                            label: <Icon icon="user" title="Subscribers"/>,
                            link: `/lists/${data[0]}/subscriptions`
                        });
                    }

                    if (perms.includes('edit')) {
                        actions.push({
                            label: <Icon icon="edit" title={t('edit')}/>,
                            link: `/lists/${data[0]}/edit`
                        });
                    }

                    if (perms.includes('viewFields')) {
                        actions.push({
                            label: <Icon icon="th-list" title={t('fields')}/>,
                            link: `/lists/${data[0]}/fields`
                        });
                    }

                    if (perms.includes('viewSegments')) {
                        actions.push({
                            label: <Icon icon="tags" title={t('segments')}/>,
                            link: `/lists/${data[0]}/segments`
                        });
                    }

                    if (perms.includes('viewImports')) {
                        actions.push({
                            label: <Icon icon="file-import" title={t('imports')}/>,
                            link: `/lists/${data[0]}/imports`
                        });
                    }

                    if (triggersCount > 0) {
                        actions.push({
                            label: <Icon icon="bell" title={t('triggers')}/>,
                            link: `/lists/${data[0]}/triggers`
                        });
                    }

                    if (perms.includes('share')) {
                        actions.push({
                            label: <Icon icon="share" title={t('share')}/>,
                            link: `/lists/${data[0]}/share`
                        });
                    }

                    tableAddDeleteButton(actions, this, perms, `rest/lists/${data[0]}`, data[1], t('deletingList'), t('listDeleted'));

                    return actions;
                }
            }
        ];

        return (
            <div>
                {tableRestActionDialogRender(this)}
                {this.state.createPermitted &&
                    <Toolbar>
                        <NavButton linkTo="/lists/create" className="btn-primary" icon="plus" label={t('createList')}/>
                        <NavButton linkTo="/lists/forms" className="btn-primary" label={t('customForms-1')}/>
                    </Toolbar>
                }

                <Title>{t('lists')}</Title>

                <Table ref={node => this.table = node} withHeader dataUrl="rest/lists-table" columns={columns} />
            </div>
        );
    }
}