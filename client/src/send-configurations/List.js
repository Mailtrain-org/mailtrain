'use strict';

import React, {Component} from 'react';
import {withTranslation} from '../lib/i18n';
import {Icon} from '../lib/bootstrap-components';
import {LinkButton, requiresAuthenticatedUser, Title, Toolbar, withPageHelpers} from '../lib/page';
import {withErrorHandling} from '../lib/error-handling';
import {Table} from '../lib/table';
import moment from 'moment';
import {getMailerTypes} from './helpers';
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

        this.mailerTypes = getMailerTypes(props.t);

        this.state = {};
        tableRestActionDialogInit(this);
    }

    static propTypes = {
        permissions: PropTypes.object
    }

    render() {
        const t = this.props.t;

        const permissions = this.props.permissions;
        const createPermitted = permissions.createSendConfiguration;

        const columns = [
            { data: 1, title: t('name') },
            { data: 2, title: t('id'), render: data => <code>{data}</code> },
            { data: 3, title: t('description') },
            { data: 4, title: t('type'), render: data => this.mailerTypes[data].typeName },
            { data: 5, title: t('created'), render: data => moment(data).fromNow() },
            { data: 6, title: t('namespace') },
            {
                actions: data => {
                    const actions = [];
                    const perms = data[7];

                    if (perms.includes('edit')) {
                        actions.push({
                            label: <Icon icon="edit" title={t('edit')}/>,
                            link: `/send-configurations/${data[0]}/edit`
                        });
                    }

                    if (perms.includes('share')) {
                        actions.push({
                            label: <Icon icon="share" title={t('share')}/>,
                            link: `/send-configurations/${data[0]}/share`
                        });
                    }

                    tableAddDeleteButton(actions, this, perms, `rest/send-configurations/${data[0]}`, data[1], t('deletingSendConfiguration'), t('sendConfigurationDeleted'));

                    return actions;
                }
            }
        ];

        return (
            <div>
                {tableRestActionDialogRender(this)}
                {createPermitted &&
                    <Toolbar>
                        <LinkButton to="/send-configurations/create" className="btn-primary" icon="plus" label={t('createSendConfiguration')}/>
                    </Toolbar>
                }

                <Title>{t('sendConfigurations-1')}</Title>

                <Table ref={node => this.table = node} withHeader dataUrl="rest/send-configurations-table" columns={columns} />
            </div>
        );
    }
}