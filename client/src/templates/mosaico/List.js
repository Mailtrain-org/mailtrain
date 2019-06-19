'use strict';

import React, {Component} from 'react';
import {withTranslation} from '../../lib/i18n';
import {ButtonDropdown, Icon} from '../../lib/bootstrap-components';
import {DropdownLink, requiresAuthenticatedUser, Title, Toolbar, withPageHelpers} from '../../lib/page';
import {withAsyncErrorHandler, withErrorHandling} from '../../lib/error-handling';
import {Table} from '../../lib/table';
import moment from 'moment';
import {getTemplateTypes} from './helpers';
import {checkPermissions} from "../../lib/permissions";
import {tableAddDeleteButton, tableRestActionDialogInit, tableRestActionDialogRender} from "../../lib/modals";
import {withComponentMixins} from "../../lib/decorator-helpers";


@withComponentMixins([
    withTranslation,
    withErrorHandling,
    withPageHelpers,
    requiresAuthenticatedUser
])
export default class List extends Component {
    constructor(props) {
        super(props);

        this.templateTypes = getTemplateTypes(props.t);

        this.state = {};
        tableRestActionDialogInit(this);
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
                            label: <Icon icon="share" title={t('share')}/>,
                            link: `/templates/mosaico/${data[0]}/share`
                        });
                    }

                    tableAddDeleteButton(actions, this, perms, `rest/mosaico-templates/${data[0]}`, data[1], t('deletingMosaicoTemplate'), t('mosaicoTemplateDeleted'));

                    return actions;
                }
            }
        ];

        return (
            <div>
                {tableRestActionDialogRender(this)}
                {this.state.createPermitted &&
                    <Toolbar>
                        <ButtonDropdown buttonClassName="btn-primary" menuClassName="dropdown-menu-right" label={t('createMosaicoTemplate')}>
                            <DropdownLink to="/templates/mosaico/create">{t('blank')}</DropdownLink>
                            <DropdownLink to="/templates/mosaico/create/versafix">{t('versafixOne')}</DropdownLink>
                            <DropdownLink to="/templates/mosaico/create/mjml-sample">{t('mjmlSample')}</DropdownLink>
                        </ButtonDropdown>
                    </Toolbar>
                }

                <Title>{t('mosaicoTemplates')}</Title>

                <Table ref={node => this.table = node} withHeader dataUrl="rest/mosaico-templates-table" columns={columns} />
            </div>
        );
    }
}