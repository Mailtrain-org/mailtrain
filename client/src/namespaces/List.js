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
import {TreeTable} from '../lib/tree';
import {
    withAsyncErrorHandler,
    withErrorHandling
} from '../lib/error-handling';
import {Icon} from "../lib/bootstrap-components";
import {checkPermissions} from "../lib/permissions";
import {
    tableAddDeleteButton,
    tableRestActionDialogInit,
    tableRestActionDialogRender
} from "../lib/modals";
import {getGlobalNamespaceId} from "../../../shared/namespaces";
import {withComponentMixins} from "../lib/decorator-helpers";

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

    @withAsyncErrorHandler
    async fetchPermissions() {
        const result = await checkPermissions({
            createNamespace: {
                entityTypeId: 'namespace',
                requiredOperations: ['createNamespace']
            }
        });

        this.setState({
            createPermitted: result.data.createNamespace
        });
    }

    componentDidMount() {
        // noinspection JSIgnoredPromiseFromCall
        this.fetchPermissions();
    }

    render() {
        const t = this.props.t;

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
                    label: <Icon icon="share-alt" title={t('share')}/>,
                    link: `/namespaces/${node.key}/share`
                });
            }

            if (Number.parseInt(node.key) !== getGlobalNamespaceId()) {
                tableAddDeleteButton(actions, this, node.data.permissions, `rest/namespaces/${node.key}`, node.data.unsanitizedTitle, t('deletingNamespace'), t('namespaceDeleted'));
            }

            return actions;
        };

        return (
            <div>
                {tableRestActionDialogRender(this)}
                {this.state.createPermitted &&
                    <Toolbar>
                        <NavButton linkTo="/namespaces/create" className="btn-primary" icon="plus" label={t('createNamespace')}/>
                    </Toolbar>
                }

                <Title>{t('namespaces')}</Title>

                <TreeTable ref={node => this.table = node} withHeader withDescription dataUrl="rest/namespaces-tree" actions={actions} />
            </div>
        );
    }
}
