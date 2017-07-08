'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { Title, Toolbar, NavButton } from '../lib/page';
import { TreeTable } from '../lib/tree';

@translate()
export default class List extends Component {
    render() {
        const t = this.props.t;

        const actionLinks = [
            {
                label: 'Edit',
                link: key => '/namespaces/edit/' + key
            }
        ];

        return (
            <div>
                <Toolbar>
                    <NavButton linkTo="/namespaces/create" className="btn-primary" icon="plus" label={t('Create Namespace')}/>
                </Toolbar>

                <Title>{t('Namespaces')}</Title>

                <TreeTable withHeader dataUrl="/rest/namespaces-tree" actionLinks={actionLinks} />
            </div>
        );
    }
}
