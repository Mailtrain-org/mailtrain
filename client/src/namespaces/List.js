'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import NamespacesTreeTable from './NamespacesTreeTable';
import { Title, Toolbar, NavButton } from "../lib/page";

@translate()
export default class List extends Component {
    render() {
        const t = this.props.t;

        return (
            <div>
                <Toolbar>
                    <NavButton linkTo="/namespaces/create" className="btn-primary" icon="plus" label={t('Create Namespace')}/>
                </Toolbar>

                <Title>{t('Namespaces')}</Title>

                <NamespacesTreeTable />
            </div>
        );
    }
}
