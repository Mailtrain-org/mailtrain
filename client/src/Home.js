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
                <h2>{t('mailtrain2')}</h2>
                <div>{t('build') + ' 2021-05-25-0915'}</div>
                <p>{mailtrainConfig.shoutout}</p>
            </div>
        );
    }
}