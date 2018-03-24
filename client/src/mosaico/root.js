'use strict';

import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {
    I18nextProvider,
    translate
} from 'react-i18next';
import i18n from '../lib/i18n';
import PropTypes from "prop-types";
import styles from "./styles.scss";

const ResourceType = {
    TEMPLATE: 'template',
    CAMPAIGN: 'campaign'
}

@translate()
class MosaicoEditor extends Component {
    constructor(props) {
        super(props);
        this.viewModel = null;
        this.state = {
            entityTypeId: ResourceType.TEMPLATE, // FIXME
            entityId: 13 // FIXME
        }
    }

    static propTypes = {
        //structure: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
    }

    async onClose(evt) {
        const t = this.props.t;

        evt.preventDefault();
        evt.stopPropagation();

        if (confirm(t('Unsaved changes will be lost. Close now?'))) {
            window.location.href = `/${this.state.entityTypeId}s/${this.state.entityId}/edit`;
        }
    }

    componentDidMount() {
        const publicPath = '/public/mosaico';

        if (!Mosaico.isCompatible()) {
            alert('Update your browser!');
            return;
        }

        const plugins = window.mosaicoPlugins;

        plugins.push(viewModel => {
            this.viewModel = viewModel;
        });

        // (Custom) HTML postRenderers
        plugins.push(viewModel => {
            viewModel.originalExportHTML = viewModel.exportHTML;
            viewModel.exportHTML = () => {
                let html = viewModel.originalExportHTML();
                for (const portRender of window.mosaicoHTMLPostRenderers) {
                    html = postRender(html);
                }
                return html;
            };
        });

        plugins.unshift(vm => {
            // This is a fix for the use of hardcoded path in Mosaico
            vm.logoPath = publicPath + '/img/mosaico32.png'
        });

        const config = {
            imgProcessorBackend: `/mosaico/img/${this.state.entityTypeId}/${this.state.entityId}`,
            emailProcessorBackend: '/mosaico/dl/',
            titleToken: "MOSAICO Responsive Email Designer",
            fileuploadConfig: {
                url: `/mosaico/upload/${this.state.entityTypeId}/${this.state.entityId}`
            },
            strings: window.mosaicoLanguageStrings
        };

        const metadata = undefined;
        const model = undefined;
        const template = publicPath + '/templates/versafix-1/index.html';

        const allPlugins = plugins.concat(window.mosaicoPlugins);

        Mosaico.start(config, template, metadata, model, allPlugins);
    }

    componentDidUpdate() {
    }

    render() {
        const t = this.props.t;

        return (
            <div className={styles.navbar}>
                <img className={styles.logo} src="/public/mailtrain-header.png"/>
                <a className={styles.btn} onClick={::this.onClose}>{t('CLOSE')}</a>
                <a className={styles.btn}><span></span></a>
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


