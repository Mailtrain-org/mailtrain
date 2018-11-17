'use strict';

import React, {Component} from 'react';
import { withNamespaces } from 'react-i18next';
import { requiresAuthenticatedUser } from './lib/page';

@withNamespaces()
@requiresAuthenticatedUser
export default class List extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const t = this.props.t;

        return (
            <div>
                <h2>{t('home.welcome')}</h2>
                <div>TODO: some dashboard</div>
            </div>
        );
    }
}