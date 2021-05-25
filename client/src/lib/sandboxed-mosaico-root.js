'use strict';

import './public-path';

import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {TranslationRoot, withTranslation} from './i18n';
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
        tagLanguage: PropTypes.string,
        templateId: PropTypes.number,
        templatePath: PropTypes.string,
        initialModel: PropTypes.string,
        initialMetadata: PropTypes.string
    }

    async exportState(method, params) {
        if (!this.viewModel) {
            // If something fails (e.g. the mosaico template does not exists, the viewModel is not defined
            return null;
        }

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
        let html = this.viewModel.export();
        html = juice(html);

        return {
            html: unbase(html, this.props.tagLanguage, trustedUrlBase, sandboxUrlBase, publicUrlBase, true),
            model: unbase(this.viewModel.exportJSON(), this.props.tagLanguage, trustedUrlBase, sandboxUrlBase, publicUrlBase),
            metadata: unbase(this.viewModel.exportMetadata(), this.props.tagLanguage, trustedUrlBase, sandboxUrlBase, publicUrlBase)
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

                // Chrome workaround begin -----------------------------------------------------------------------------------
                // Chrome v. 74 (and likely other versions too) has problem with how KO sets data during export.
                // As the result, the images that have been in the template from previous editing (i.e. before page refresh)
                // get lost. The code below refreshes the KO binding, thus effectively reloading the images.
                const isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
                if (isChrome) {
                    ko.cleanNode(document.body);
                    ko.applyBindings(viewModel, document.body);
                }
                // Chrome workaround end -------------------------------------------------------------------------------------

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

            ko.bindingHandlers.wysiwyg.standardOptions = {
                toolbar1: 'bold italic underline subscript superscript forecolor backcolor removeformat',
                toolbar2: 'link unlink | nonbreaking charmap emoticons | code',
                plugins: ["link textcolor code nonbreaking emoticons charmap"]
            };

            // Adapted form https://github.com/voidlabs/mosaico/blob/7b7406b16d209389af88ab8b94e0b0afde0dcbab/src/js/bindings/wysiwygs.js#L242
            ko.bindingHandlers.wysiwyg.fullOptions = {
                toolbar1: 'bold italic underline subscript superscript styleselect forecolor backcolor removeformat | alignleft alignright aligncenter alignjustify alignnone | link unlink',
                toolbar2: 'copy cut paste pastetext undo redo searchreplace | bullist numlist outdent indent | hr nonbreaking charmap emoticons | visualblocks code',
                plugins: ["link hr paste lists textcolor code nonbreaking visualblocks emoticons searchreplace charmap"],
                style_formats: [
                    {
                        title: 'Headings', items: [
                            { title: 'Heading 1', format: 'h1' },
                            { title: 'Heading 2', format: 'h2' },
                            { title: 'Heading 3', format: 'h3' },
                            { title: 'Heading 4', format: 'h4' },
                            { title: 'Heading 5', format: 'h5' },
                            { title: 'Heading 6', format: 'h6' }
                        ]
                    },
                    {
                        title: 'Inline', items: [
                            { title: 'Bold', format: 'bold' },
                            { title: 'Italic', format: 'italic' },
                            { title: 'Underline', format: 'underline' },
                            { title: 'Strikethrough', format: 'strikethrough' },
                            { title: 'Superscript', format: 'superscript' },
                            { title: 'Subscript', format: 'subscript' },
                            { title: 'Code', format: 'code' }
                        ]
                    },
                    {
                        title: 'Blocks', items: [
                            { title: 'Paragraph', format: 'p' },
                            { title: 'Blockquote', format: 'blockquote' },
                            { title: 'Div', format: 'div' },
                            { title: 'Pre', format: 'pre' }
                        ]
                    },
                    {
                        title: 'Align', items: [
                            { title: 'Left', format: 'alignleft' },
                            { title: 'Center', format: 'aligncenter' },
                            { title: 'Right', format: 'alignright' },
                            { title: 'Justify', format: 'alignjustify' }
                        ]
                    },
                    /* Here an example of custom styling:
                    {
                        title: 'Line Height',
                        items: [
                            { title: 'Normal Line Height', inline: 'span', styles: { "line-height": '100%' } },
                            { title: 'Line Height + 10%', inline: 'span', styles: { "line-height": '110%' } },
                            { title: 'Line Height + 50%', inline: 'span', styles: { "line-height": '150%' } },
                            { title: 'Line Height + 100%', inline: 'span', styles: { "line-height": '200%' } }
                        ]
                    }
                    */
                ]
            };
        });

        plugins.unshift(vm => {
            // This is an override of the default paths in Mosaico
            vm.logoPath = getTrustedUrl('static/mosaico/rs/img/mosaico32.png');
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
        const metadata = this.props.initialMetadata && JSON.parse(base(this.props.initialMetadata, this.props.tagLanguage, trustedUrlBase, sandboxUrlBase, publicUrlBase));
        const model = this.props.initialModel && JSON.parse(base(this.props.initialModel, this.props.tagLanguage, trustedUrlBase, sandboxUrlBase, publicUrlBase));
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
        <TranslationRoot>
            <UntrustedContentRoot render={props => <MosaicoSandbox {...props} />} />
        </TranslationRoot>,
        document.getElementById('root')
    );
};


