'use strict';

import './public-path';

import React, {Component} from 'react';
import ReactDOM
    from 'react-dom';
import {I18nextProvider} from 'react-i18next';
import i18n, {withTranslation} from './i18n';
import {
    parentRPC,
    UntrustedContentRoot
} from './untrusted';
import PropTypes
    from "prop-types";
import {
    getPublicUrl,
    getSandboxUrl,
    getTrustedUrl
} from "./urls";
import {
    base,
    unbase
} from "../../../shared/templates";
import {withComponentMixins} from "./decorator-helpers";


@withComponentMixins([
    withTranslation
])
class MosaicoSandbox extends Component {
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
        templatePath: PropTypes.string,
        initialModel: PropTypes.string,
        initialMetadata: PropTypes.string
    }

    async exportState(method, params) {
        const trustedUrlBase = getTrustedUrl();
        const sandboxUrlBase = getSandboxUrl();
        const publicUrlBase = getPublicUrl();
        return {
            html: unbase(this.viewModel.exportHTML(), trustedUrlBase, sandboxUrlBase, publicUrlBase, true),
            model: unbase(this.viewModel.exportJSON(), trustedUrlBase, sandboxUrlBase, publicUrlBase),
            metadata: unbase(this.viewModel.exportMetadata(), trustedUrlBase, sandboxUrlBase, publicUrlBase)
        };
    }

    componentDidMount() {
        parentRPC.setMethodHandler('exportState', ::this.exportState);

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

        // Custom convertedUrl (https://github.com/voidlabs/mosaico/blob/a359e263f1af5cf05e2c2d56c771732f2ef6c8c6/src/js/app.js#L42)
        // which does not complain about mismatch of domains between TRUSTED and PUBLIC
        plugins.push(viewModel => {
            ko.bindingHandlers.wysiwygSrc.convertedUrl = (src, method, width, height) => getTrustedUrl(`mosaico/img?src=${encodeURIComponent(src)}&method=${encodeURIComponent(method)}&params=${width},${height}`);
        });

        plugins.unshift(vm => {
            // This is an override of the default paths in Mosaico
            vm.logoPath = getTrustedUrl('static/mosaico/img/mosaico32.png');
            vm.logoUrl = '#';
        });

        const config = {
            imgProcessorBackend: getTrustedUrl('mosaico/img'),
            emailProcessorBackend: getSandboxUrl('mosaico/dl'),
            fileuploadConfig: {
                url: getSandboxUrl(`mosaico/upload/${this.props.entityTypeId}/${this.props.entityId}`)
            },
            strings: window.mosaicoLanguageStrings
        };

        const trustedUrlBase = getTrustedUrl();
        const sandboxUrlBase = getSandboxUrl();
        const publicUrlBase = getPublicUrl();
        const metadata = this.props.initialMetadata && JSON.parse(base(this.props.initialMetadata, trustedUrlBase, sandboxUrlBase, publicUrlBase));
        const model = this.props.initialModel && JSON.parse(base(this.props.initialModel, trustedUrlBase, sandboxUrlBase, publicUrlBase));
        const template = this.props.templateId ? getSandboxUrl(`mosaico/templates/${this.props.templateId}/index.html`) : this.props.templatePath;

        const allPlugins = plugins.concat(window.mosaicoPlugins);

        Mosaico.start(config, template, metadata, model, allPlugins);
    }

    render() {
        return <div/>;
    }
}



export default function() {
    parentRPC.init();

    ReactDOM.render(
        <I18nextProvider i18n={ i18n }>
            <UntrustedContentRoot render={props => <MosaicoSandbox {...props} />} />
        </I18nextProvider>,
        document.getElementById('root')
    );
};


