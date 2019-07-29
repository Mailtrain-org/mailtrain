'use strict';

import React, {Component} from 'react';
import {withTranslation} from '../lib/i18n';
import {LinkButton, requiresAuthenticatedUser, Title, Toolbar, withPageHelpers} from '../lib/page';
import {TreeTable} from '../lib/tree';
import {withErrorHandling} from '../lib/error-handling';
import {Icon} from "../lib/bootstrap-components";
import {tableAddDeleteButton, tableRestActionDialogInit, tableRestActionDialogRender} from "../lib/modals";
import {getGlobalNamespaceId} from "../../../shared/namespaces";
import {withComponentMixins} from "../lib/decorator-helpers";
import mailtrainConfig from 'mailtrainConfig';
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

        this.state = {};
        tableRestActionDialogInit(this);
    }

    static propTypes = {
        permissions: PropTypes.object
    }

    render() {
        const t = this.props.t;

        const permissions = this.props.permissions;
        const createPermitted = permissions.createNamespace;

        const actions = node => {
            const actions = [];

            if (node.data.permissions.includes('edit')) {
                actions.push({
                    label: <Icon icon="edit" title={t('edit')}/>,
                    link: `/namespaces/${node.key}/edit`
                });
            }

            if (node.data.permissions.includes('share')) {
                actions.push({
                    label: <Icon icon="share" title={t('share')}/>,
                    link: `/namespaces/${node.key}/share`
                });
            }

            const namespaceId = Number.parseInt(node.key);
            if (namespaceId !== getGlobalNamespaceId() && mailtrainConfig.user.namespace !== namespaceId) {
                tableAddDeleteButton(actions, this, node.data.permissions, `rest/namespaces/${node.key}`, node.data.unsanitizedTitle, t('deletingNamespace'), t('namespaceDeleted'));
            }

            return actions;
        };

        return (
            <div>
                {tableRestActionDialogRender(this)}
                {createPermitted &&
                    <Toolbar>
                        <LinkButton to="/namespaces/create" className="btn-primary" icon="plus" label={t('createNamespace')}/>
                    </Toolbar>
                }

                <Title>{t('namespaces')}</Title>

                <TreeTable ref={node => this.table = node} withHeader withDescription dataUrl="rest/namespaces-tree" actions={actions} />
            </div>
        );
    }
}
