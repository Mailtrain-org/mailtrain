'use strict';

import './public-path';

import React from 'react';
import ReactDOM from 'react-dom';
import {I18nextProvider,} from 'react-i18next';
import i18n from './i18n';
import {MosaicoSandbox} from './mosaico';
import {UntrustedContentRoot, parentRPC} from './untrusted';

export default function() {
    parentRPC.init();

    ReactDOM.render(
        <I18nextProvider i18n={ i18n }>
            <UntrustedContentRoot render={props => <MosaicoSandbox {...props} />} />
        </I18nextProvider>,
        document.getElementById('root')
    );
};


