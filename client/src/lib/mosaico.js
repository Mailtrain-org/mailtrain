'use strict';

import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {
    I18nextProvider,
    translate
} from 'react-i18next';
import i18n from './i18n';
import PropTypes from "prop-types";
import styles from "./mosaico.scss";
import mailtrainConfig from 'mailtrainConfig';

import { UntrustedContentHost } from './untrusted';
import {
    Button,
    Icon
} from "./bootstrap-components";

export const ResourceType = {
    TEMPLATE: 'template',
    CAMPAIGN: 'campaign'
}

@translate(null, { withRef: true })
export class MosaicoEditor extends Component {
    constructor(props) {
        super(props);

        this.state = {
            fullscreen: false
        }
    }

    static propTypes = {
        entityTypeId: PropTypes.string,
        entity: PropTypes.object,
        title: PropTypes.string,
        onFullscreenAsync: PropTypes.func
    }

    async toggleFullscreenAsync() {
        const fullscreen = !this.state.fullscreen;
        this.setState({
            fullscreen
        });
        await this.props.onFullscreenAsync(fullscreen);
    }

    async exportState() {
        return await this.contentNode.ask('exportState');
    }

    render() {
        const t = this.props.t;

        const mosaicoData = {
            entityTypeId: this.props.entityTypeId,
            entityId: this.props.entity.id,
            model: this.props.entity.data.model,
            metadata: this.props.entity.data.metadata
        };

        return (
            <div className={this.state.fullscreen ? styles.editorFullscreen : styles.editor}>
                <div className={styles.navbar}>
                    {this.state.fullscreen && <img className={styles.logo} src="/public/mailtrain-notext.png"/>}
                    <div className={styles.title}>{this.props.title}</div>
                    <a className={styles.btn} onClick={::this.toggleFullscreenAsync}><Icon icon="fullscreen"/></a>
                </div>
                <UntrustedContentHost ref={node => this.contentNode = node} className={styles.host} contentProps={mosaicoData} contentSrc="mosaico/editor" tokenMethod="mosaico" tokenParams={mosaicoData}/>
            </div>
        );
    }
}

MosaicoEditor.prototype.exportState = async function() {
    return await this.getWrappedInstance().exportState();
};



@translate(null, { withRef: true })
export class MosaicoSandbox extends Component {
    constructor(props) {
        super(props);
        this.viewModel = null;
        this.state = {
        };
    }

    static propTypes = {
        entityTypeId: PropTypes.string,
        entityId: PropTypes.number,
        model: PropTypes.object,
        metadata: PropTypes.object
    }

    componentDidMount() {
        const publicPath = '/public/mosaico';

        if (!Mosaico.isCompatible()) {
            alert('Update your browser!');
            return;
        }

        const plugins = [...window.mosaicoPlugins];

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
            // This is an override of the default paths in Mosaico
            vm.logoPath = publicPath + '/img/mosaico32.png';
            vm.logoUrl = '#';
        });

        const config = {
            imgProcessorBackend: `/mosaico/img/${this.props.entityTypeId}/${this.props.entityId}`,
            emailProcessorBackend: '/mosaico/dl/',
            fileuploadConfig: {
                url: `/mosaico/upload/${this.props.entityTypeId}/${this.props.entityId}`
            },
            strings: window.mosaicoLanguageStrings
        };

        const metadata = this.props.metadata;
        const model = this.props.model;
        const template = publicPath + '/templates/versafix-1/index.html';

        const allPlugins = plugins.concat(window.mosaicoPlugins);

        Mosaico.start(config, template, metadata, model, allPlugins);
    }

    async onMethodAsync(method, params) {
        if (method === 'exportState') {
            return {
                html: this.viewModel.exportHTML(),
                model: this.viewModel.exportJS(),
                metadata: this.viewModel.metadata
            };
        }
    }

    render() {
        return <div/>;
    }
}

MosaicoSandbox.prototype.onMethodAsync = async function(method, params) {
    return await this.getWrappedInstance().onMethodAsync(method, params);
};
