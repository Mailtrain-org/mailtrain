'use strict';

import React, {Component} from 'react';
import {withTranslation} from '../lib/i18n';
import {Icon} from '../lib/bootstrap-components';
import {LinkButton, requiresAuthenticatedUser, Title, Toolbar, withPageHelpers} from '../lib/page';
import {withErrorHandling} from '../lib/error-handling';
import {Table} from '../lib/table';
import moment from 'moment';
import {getTagLanguages, getTemplateTypes} from './helpers';
import {tableAddDeleteButton, tableRestActionDialogInit, tableRestActionDialogRender} from "../lib/modals";
import {withComponentMixins} from "../lib/decorator-helpers";
import PropTypes from 'prop-types';


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
        this.tagLanguages = getTagLanguages(props.t);

        this.state = {};
        tableRestActionDialogInit(this);
    }

    static propTypes = {
        permissions: PropTypes.object
    }

    render() {
        const t = this.props.t;

        const permissions = this.props.permissions;
        const createPermitted = permissions.createTemplate;
        const mosaicoTemplatesPermitted = permissions.createMosaicoTemplate || permissions.viewMosaicoTemplate;

        const columns = [
            { data: 1, title: t('name') },
            { data: 2, title: t('description') },
            { data: 3, title: t('type'), render: data => this.templateTypes[data].typeName },
            { data: 4, title: t('tagLanguage'), render: data => this.tagLanguages[data].name },
            { data: 5, title: t('created'), render: data => moment(data).fromNow() },
            { data: 6, title: t('namespace') },
            {
                actions: data => {
                    const actions = [];
                    const perms = data[7];

                    if (perms.includes('edit')) {
                        actions.push({
                            label: <Icon icon="edit" title={t('edit')}/>,
                            link: `/templates/${data[0]}/edit`
                        });
                    }

                    if (perms.includes('viewFiles')) {
                        actions.push({
                            label: <Icon icon="hdd" title={t('files')}/>,
                            link: `/templates/${data[0]}/files`
                        });
                    }

                    if (perms.includes('share')) {
                        actions.push({
                            label: <Icon icon="share" title={t('share')}/>,
                            link: `/templates/${data[0]}/share`
                        });
                    }

                    tableAddDeleteButton(actions, this, perms, `rest/templates/${data[0]}`, data[1], t('deletingTemplate'), t('templateDeleted'));

                    return actions;
                }
            }
        ];

        return (
            <div>
                {tableRestActionDialogRender(this)}
                <Toolbar>
                    {createPermitted &&
                       <LinkButton to="/templates/create" className="btn-primary" icon="plus" label={t('createTemplate')}/>
                    }
                    {mosaicoTemplatesPermitted &&
                        <LinkButton to="/templates/mosaico" className="btn-primary" label={t('mosaicoTemplates')}/>
                    }
                </Toolbar>

                <Title>{t('templates')}</Title>

                <Table ref={node => this.table = node} withHeader dataUrl="rest/templates-table" columns={columns} />
            </div>
        );
    }
}