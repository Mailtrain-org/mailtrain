'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import {
    I18nextProvider,
} from 'react-i18next';
import i18n from './i18n';
import styles from "./mosaico.scss";
import { MosaicoSandbox } from './mosaico';
import { UntrustedContentRoot } from './untrusted';

export default function() {
    ReactDOM.render(
        <I18nextProvider i18n={ i18n }>
            <UntrustedContentRoot render={props => <MosaicoSandbox {...props} />} />
        </I18nextProvider>,
        document.getElementById('root')
    );
};


