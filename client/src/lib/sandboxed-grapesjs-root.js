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
    getTrustedUrl,
    getUrl
} from "./urls";
import {
    base,
    unbase
} from "../../../shared/templates";
import mjml2html from "mjml4-in-browser";

import 'grapesjs/dist/css/grapes.min.css';
import grapesjs from 'grapesjs';
import "grapesjs-mjml";

import "./sandboxed-grapesjs.scss";

import axios from './axios';

grapesjs.plugins.add('mailtrain', (editor, opts = {}) => {
    const panelManager = editor.Panels;
    panelManager.removeButton('options','fullscreen');
    panelManager.removeButton('options','export-template');
});


@translate(null, { withRef: true })
export class GrapesJSSandbox extends Component {
    constructor(props) {
        super(props);

        this.initialized = false;

        this.state = {
            assets: null
        };
    }

    static propTypes = {
        entityTypeId: PropTypes.string,
        entityId: PropTypes.number,
        initialSource: PropTypes.string,
        initialStyle: PropTypes.string
    }

    async exportState(method, params) {
        const editor = this.editor;

        // If exportState comes during text editing (via RichTextEditor), we need to cancel the editing, so that the
        // text being edited is stored in the model
        const sel = editor.getSelected();
        if (sel && sel.view && sel.disableEditing) {
            sel.view.disableEditing();
        }

        const trustedUrlBase = getTrustedUrl();
        const sandboxUrlBase = getSandboxUrl();
        const publicUrlBase = getPublicUrl();

        const source = unbase(editor.getHtml(), trustedUrlBase, sandboxUrlBase, publicUrlBase, true);
        const style = unbase(editor.getCss(), trustedUrlBase, sandboxUrlBase, publicUrlBase, true);

        let html;

        const preMjml = '<mjml><mj-head></mj-head><mj-body>';
        const postMjml = '</mj-body></mjml>';
        const mjml = preMjml + source + postMjml;

        const mjmlRes = mjml2html(mjml);

        return {
            html,
            style: style,
            source: source
        };
    }

    async fetchAssets() {
        const props = this.props;
        const resp = await axios.get(getSandboxUrl(`rest/files-list/${props.entityTypeId}/file/${props.entityId}`));
        this.setState({
            assets: resp.data.map( f => ({type: 'image', src: getPublicUrl(`files/${props.entityTypeId}/file/${props.entityId}/${f.filename}`)}) )
        });
    }

    componentDidMount() {
        // noinspection JSIgnoredPromiseFromCall
        this.fetchAssets();
    }

    componentDidUpdate() {
        if (!this.initialized && this.state.assets !== null) {
            this.initGrapesJs();
            this.initialized = true;
        }
    }

    initGrapesJs() {
        const props = this.props;

        parentRPC.setMethodHandler('exportState', ::this.exportState);

        const trustedUrlBase = getTrustedUrl();
        const sandboxUrlBase = getSandboxUrl();
        const publicUrlBase = getPublicUrl();

        const source = props.initialSource ?
            base(props.initialSource, trustedUrlBase, sandboxUrlBase, publicUrlBase) :
            '      <mj-container>\n' +
            '        <mj-section>\n' +
            '          <mj-column>\n' +
            '            <mj-text>My Company</mj-text>\n' +
            '          </mj-column>\n' +
            '        </mj-section>\n' +
            '      </mj-container>';

        const css = props.initialStyle && base(props.initialStyle, trustedUrlBase, sandboxUrlBase, publicUrlBase);

        this.editor = grapesjs.init({
            noticeOnUnload: false,
            container: this.canvasNode,
            height: '100%',
            width: '100%',
            storageManager:{
                type: 'none'
            },
            assetManager: {
                assets: this.state.assets,
                upload: getSandboxUrl(`grapesjs/upload/${this.props.entityTypeId}/${this.props.entityId}`),
                uploadText: 'Drop images here or click to upload',
                headers: {
                    'X-CSRF-TOKEN': '{{csrfToken}}',
                },
                autoAdd: true
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
                'gjs-mjml': {
                    preMjml: '<mjml><mj-head></mj-head><mj-body>',
                    postMjml: '</mj-body></mjml>'
                }
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


