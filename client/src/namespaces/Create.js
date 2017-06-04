'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { Title } from "../lib/page";
import csfrToken from 'csfrToken';

@translate()
export default class Create extends Component {
    render() {
        const t = this.props.t;
        console.log('csfrToken = ' + csfrToken);

        return (
            <div>
                <Title>{t('Create Namespace')}</Title>
            </div>
        );
    }
}
