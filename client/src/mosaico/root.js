'use strict';

import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {
    I18nextProvider,
    translate
} from 'react-i18next';
import i18n from '../lib/i18n';
import PropTypes from "prop-types";

@translate()
class MosaicoEditor extends Component {
    constructor(props) {
        super(props);

    }

    static propTypes = {
        //structure: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
    }

    componentDidMount() {
        const basePath = '/public/mosaico';

        if (!Mosaico.isCompatible()) {
            alert('Update your browser!');
            return;
        }

        const plugins = window.mosaicoPlugins;

        plugins.unshift(vm => {
            // This is a fix for the use of hardcoded path in Mosaico
            vm.logoPath = basePath + '/img/mosaico32.png'
        });

        const config = {
            imgProcessorBackend: basePath+'/img/',
            emailProcessorBackend: basePath+'/dl/',
            titleToken: "MOSAICO Responsive Email Designer",
            fileuploadConfig: {
                url: basePath+'/upload/'
            },
            strings: window.mosaicoLanguageStrings
        };

        const metadata = undefined;
        const model = undefined;
        const template = basePath + '/templates/versafix-1/index.html';

        Mosaico.start(config, template, metadata, model, plugins);
    }

    componentDidUpdate() {

    }

    render() {
        return (
            <div>
            </div>
        );
    }
}


export default function() {
    ReactDOM.render(
        <I18nextProvider i18n={ i18n }><MosaicoEditor /></I18nextProvider>,
        document.getElementById('root')
    );
};


