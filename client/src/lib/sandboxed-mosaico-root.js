'use strict';

import './public-path';

import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {I18nextProvider} from 'react-i18next';
import i18n, {withTranslation} from './i18n';
import {parentRPC, UntrustedContentRoot} from './untrusted';
import PropTypes from "prop-types";
import {getPublicUrl, getSandboxUrl, getTrustedUrl} from "./urls";
import {base, unbase} from "../../../shared/templates";
import {withComponentMixins} from "./decorator-helpers";
import juice from "juice";

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


        /* juice is called to inline css styles of situations like this
            <style type="text/css" data-inline="true">
                [data-ko-block=introBlock] .text p {
                    font-family: merriweather,georgia,times new roman,serif; font-size: 14px; text-align: justify; line-height: 150%; color: #3A3A3A; margin-top: 8px;
                }
            </style>

            ...

            <div style="Margin:0px auto;max-width:600px;" data-ko-block="introBlock">
                ...
                <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;line-height:1;text-align:left;color:#000000;" data-ko-editable="text" class="text">
                    <p>XXX</p>
                </div>
                ...
            </div>
         */
        const html = juice(this.viewModel.exportHTML());

        return {
            html: unbase(html, trustedUrlBase, sandboxUrlBase, publicUrlBase, true),
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


