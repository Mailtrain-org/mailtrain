'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from './lib/i18n';
import {requiresAuthenticatedUser} from './lib/page';
import {withComponentMixins} from "./lib/decorator-helpers";
import mailtrainConfig from 'mailtrainConfig';

@withComponentMixins([
    withTranslation,
    requiresAuthenticatedUser
])
export default class List extends Component {
    constructor(props) {
        super(props);
    }

    static propTypes = {
    }

    render() {
        const t = this.props.t;

        return (
            <div>
                <h2>{t('mailtrain3')}</h2>
                <div>{t('build') + ' 2024-08-23-1025'}</div>
                <p>{mailtrainConfig.shoutout}</p>
            </div>
        );
    }
}