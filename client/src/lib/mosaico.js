'use strict';

import React, {Component} from 'react';
import {translate} from 'react-i18next';
import PropTypes from "prop-types";
import styles from "./mosaico.scss";

import {UntrustedContentHost} from './untrusted';
import {Icon} from "./bootstrap-components";
import {getUrl} from "./urls";
import {base, unbase} from "../../../shared/templates";


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
        onFullscreenAsync: PropTypes.func,
        templateId: PropTypes.number,
        initialModel: PropTypes.string,
        initialMetadata: PropTypes.string
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
            templateId: this.props.templateId,
            initialModel: this.props.initialModel,
            initialMetadata: this.props.initialMetadata
        };

        return (
            <div className={this.state.fullscreen ? styles.editorFullscreen : styles.editor}>
                <div className={styles.navbar}>
                    {this.state.fullscreen && <img className={styles.logo} src={getUrl('public/mailtrain-notext.png')}/>}
                    <div className={styles.title}>{this.props.title}</div>
                    <a className={styles.btn} onClick={::this.toggleFullscreenAsync}><Icon icon="fullscreen"/></a>
                </div>
                <UntrustedContentHost ref={node => this.contentNode = node} className={styles.host} singleToken={true} contentProps={mosaicoData} contentSrc="mosaico/editor" tokenMethod="mosaico" tokenParams={mosaicoData}/>
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
        templateId: PropTypes.number,
        initialModel: PropTypes.string,
        initialMetadata: PropTypes.string
    }

    componentDidMount() {
        const publicPath = 'public/mosaico';

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
            vm.logoPath = getUrl(publicPath + '/img/mosaico32.png');
            vm.logoUrl = '#';
        });

        const config = {
            imgProcessorBackend: getUrl(`mosaico/img/${this.props.entityTypeId}/${this.props.entityId}`),
            emailProcessorBackend: getUrl('mosaico/dl/'),
            fileuploadConfig: {
                url: getUrl(`mosaico/upload/${this.props.entityTypeId}/${this.props.entityId}`)
            },
            strings: window.mosaicoLanguageStrings
        };

        const urlBase = getUrl();
        const metadata = this.props.initialMetadata && JSON.parse(base(this.props.initialMetadata, urlBase));
        const model = this.props.initialModel && JSON.parse(base(this.props.initialModel, urlBase));
        const template = getUrl(`mosaico/templates/${this.props.templateId}/index.html`);

        const allPlugins = plugins.concat(window.mosaicoPlugins);

        Mosaico.start(config, template, metadata, model, allPlugins);
    }

    async onMethodAsync(method, params) {
        if (method === 'exportState') {
            const urlBase = getUrl();
            return {
                html: unbase(this.viewModel.exportHTML(), urlBase),
                model: unbase(this.viewModel.exportJSON(), urlBase),
                metadata: unbase(this.viewModel.exportMetadata(), urlBase)
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
