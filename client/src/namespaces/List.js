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

        const actions = key => [
            {
                label: 'Edit',
                link: '/namespaces/edit/' + key
            },
            {
                label: 'Share',
                link: '/namespaces/share/' + key
            }
        ];

        return (
            <div>
                <Toolbar>
                    <NavButton linkTo="/namespaces/create" className="btn-primary" icon="plus" label={t('Create Namespace')}/>
                </Toolbar>

                <Title>{t('Namespaces')}</Title>

                <TreeTable withHeader dataUrl="/rest/namespaces-tree" actions={actions} />
            </div>
        );
    }
}
