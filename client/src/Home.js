'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
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

    static propTypes = {
        configItems: PropTypes.object
    }

    render() {
        const t = this.props.t;

        return (
            <div>
                <h2>{t('Mailtrain 2 beta')}</h2>
                <div>{t('Build') + ' 2020-07-17-0000'}</div>
                <p>{this.props.configItems.shoutout}</p>
            </div>
        );
    }
}