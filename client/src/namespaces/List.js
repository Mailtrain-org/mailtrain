'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { requiresAuthenticatedUser, withPageHelpers, Title, Toolbar, NavButton } from '../lib/page';
import { TreeTable } from '../lib/tree';

@translate()
@withPageHelpers
@requiresAuthenticatedUser
export default class List extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const t = this.props.t;

        const actions = node => {
            const actions = [];

            if (node.data.permissions.includes('edit')) {
                actions.push({
                    label: 'Edit',
                    link: '/namespaces/edit/' + node.key
                });
            }

            if (node.data.permissions.includes('share')) {
                actions.push({
                    label: 'Share',
                    link: '/namespaces/share/' + node.key
                });
            }

            return actions;
        };

        return (
            <div>
                <Toolbar>
                    <NavButton linkTo="/namespaces/create" className="btn-primary" icon="plus" label={t('Create Namespace')}/>
                </Toolbar>

                <Title>{t('Namespaces')}</Title>

                <TreeTable withHeader withDescription dataUrl="/rest/namespaces-tree" actions={actions} />
            </div>
        );
    }
}
