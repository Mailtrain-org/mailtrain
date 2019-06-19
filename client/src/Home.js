'use strict';

import React, {Component} from 'react';
import {withTranslation} from './lib/i18n';
import {requiresAuthenticatedUser} from './lib/page';
import {withComponentMixins} from "./lib/decorator-helpers";

@withComponentMixins([
    withTranslation,
    requiresAuthenticatedUser
])
export default class List extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const t = this.props.t;

        return (
            <div>
                <h2>{t('welcomeToMailtrain')}</h2>
                <div>TODO: some dashboard</div>
            </div>
        );
    }
}