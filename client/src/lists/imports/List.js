'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import {
    NavButton,
    requiresAuthenticatedUser,
    Title,
    Toolbar,
    withPageHelpers
} from '../../lib/page';
import {withErrorHandling} from '../../lib/error-handling';
import {Table} from '../../lib/table';
import {getImportLabels} from './helpers';
import {Icon} from "../../lib/bootstrap-components";
import mailtrainConfig from 'mailtrainConfig';
import moment from "moment";
import {inProgress} from '../../../../shared/imports';
import {
    tableDeleteDialogAddDeleteButton,
    tableDeleteDialogInit,
    tableDeleteDialogRender
} from "../../lib/modals";

@translate()
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class List extends Component {
    constructor(props) {
        super(props);

        this.state = {};
        tableDeleteDialogInit(this);

        const {importSourceLabels, importStatusLabels} = getImportLabels(props.t);
        this.importSourceLabels = importSourceLabels;
        this.importStatusLabels = importStatusLabels;
    }

    static propTypes = {
        list: PropTypes.object
    }

    componentDidMount() {
    }

    render() {
        const t = this.props.t;

        const columns = [
            { data: 1, title: t('Name') },
            { data: 2, title: t('Description') },
            { data: 3, title: t('Source'), render: data => this.importSourceLabels[data], sortable: false, searchable: false },
            { data: 4, title: t('Status'), render: data => this.importStatusLabels[data], sortable: false, searchable: false },
            { data: 5, title: t('Last run'), render: data => moment(data).fromNow() },
            {
                actions: data => {
                    const actions = [];
                    const status = data[4];
                    
                    let refreshTimeout;
                    
                    if (inProgress(status)) {
                        refreshTimeout = 1000;
                    }

                    if (mailtrainConfig.globalPermissions.setupAutomation && this.props.list.permissions.includes('manageImports')) {
                        actions.push({
                            label: <Icon icon="edit" title={t('Edit')}/>,
                            link: `/lists/${this.props.list.id}/imports/${data[0]}/edit`
                        });
                    }

                    actions.push({
                        label: <Icon icon="eye-open" title={t('Detailed status')}/>,
                        link: `/lists/${this.props.list.id}/imports/${data[0]}/status`
                    });

                    if (this.props.list.permissions.includes('manageImports')) {
                        tableDeleteDialogAddDeleteButton(actions, this, null, data[0], data[1]);
                    }

                    return { refreshTimeout, actions };
                }
            }
        ];

        return (
            <div>
                {tableDeleteDialogRender(this, `rest/imports/${this.props.list.id}`, t('Deleting import ...'), t('Import deleted'))}
                {mailtrainConfig.globalPermissions.setupAutomation && this.props.list.permissions.includes('manageImports') &&
                    <Toolbar>
                        <NavButton linkTo={`/lists/${this.props.list.id}/imports/create`} className="btn-primary" icon="plus" label={t('Create Import')}/>
                    </Toolbar>
                }

                <Title>{t('Imports')}</Title>

                <Table ref={node => this.table = node} withHeader dataUrl={`rest/imports-table/${this.props.list.id}`} columns={columns} />
            </div>
        );
    }
}