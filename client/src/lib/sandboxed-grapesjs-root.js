'use strict';

import './public-path';

import React, {Component} from 'react';
import ReactDOM
    from 'react-dom';
import {
    I18nextProvider,
    translate,
} from 'react-i18next';
import i18n
    from './i18n';
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

import 'grapesjs/dist/css/grapes.min.css';
import grapesjs from 'grapesjs';
import "grapesjs-mjml";

import "./sandboxed-grapesjs.scss";

grapesjs.plugins.add('mailtrain', (editor, opts = {}) => {
    const panelManager = editor.Panels;
    panelManager.removeButton('options','fullscreen')
});


@translate(null, { withRef: true })
export class GrapesJSSandbox extends Component {
    constructor(props) {
        super(props);

        this.state = {
        };
    }

    static propTypes = {
        entityTypeId: PropTypes.string,
        entityId: PropTypes.number,
        initialModel: PropTypes.object
    }

    async exportState(method, params) {
        const editor = this.editor;

        const trustedUrlBase = getTrustedUrl();
        const sandboxUrlBase = getSandboxUrl();
        const publicUrlBase = getPublicUrl();

        let html;
        html = unbase(editor.getHtml(), trustedUrlBase, sandboxUrlBase, publicUrlBase, true);

        const model = {
            css: editor.getCss(),
            source: editor.getHtml(),
        };

        console.log(model.css);
        console.log(model.source);

        return {
            html,
            model
        };
    }

    componentDidMount() {
        parentRPC.setMethodHandler('exportState', ::this.exportState);

        const trustedUrlBase = getTrustedUrl();
        const sandboxUrlBase = getSandboxUrl();
        const publicUrlBase = getPublicUrl();

        const model = this.props.initialModel || {}

        const source = model.source && base(model.source, trustedUrlBase, sandboxUrlBase, publicUrlBase);
        const css = model.css && base(model.css, trustedUrlBase, sandboxUrlBase, publicUrlBase);

        /*
        '  <mj-container>\n' +
        '        <mj-section>\n' +
        '          <mj-column>\n' +
        '            <mj-text>My Company</mj-text>\n' +
        '          </mj-column>\n' +
        '        </mj-section>\n' +
        '  <mj-container>',
        */

        this.editor = grapesjs.init({
            container: this.canvasNode,
            height: '100%',
            width: '100%',
            storageManager:{
                type: 'none'
            },
            assetManager: {
                assets: [],
                upload: '/editorapi/upload?type={{type}}&id={{resource.id}}&editor={{editor.name}}',
                uploadText: 'Drop images here or click to upload',
                headers: {
                    'X-CSRF-TOKEN': '{{csrfToken}}',
                },
            },
            styleManager: {
                clearProperties: true,
            },
            fromElement: false,
            components: source,
            style: css,
            plugins: [
                'mailtrain',
                'gjs-mjml'
            ],
            pluginsOpts: {
                'gjs-mjml': {}
            }
        });

    }

    render() {
        return (
            <div>
                <div ref={node => this.canvasNode = node}/>
            </div>
        );
    }
}



export default function() {
    parentRPC.init();

    ReactDOM.render(
        <I18nextProvider i18n={ i18n }>
            <UntrustedContentRoot render={props => <GrapesJSSandbox {...props} />} />
        </I18nextProvider>,
        document.getElementById('root')
    );
};


