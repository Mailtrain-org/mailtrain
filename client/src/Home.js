'use strict';

import React, {Component} from 'react';
import {translate} from 'react-i18next';
import { requiresAuthenticatedUser } from './lib/page';

@translate()
@requiresAuthenticatedUser
export default class List extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const t = this.props.t;

        return (
            <div>
                <h2>{t('Welcome to Mailtrain...')}</h2>
                <div>TODO: some dashboard</div>
            </div>
        );
    }
}