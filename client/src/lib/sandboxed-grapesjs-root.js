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
import mjml2html from "../../mjml/dist/mjml";
console.log(mjml2html);

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
        initialSource: PropTypes.string,
        initialStyle: PropTypes.string
    }

    async exportState(method, params) {
        const editor = this.editor;

        // If exportState comes during text editing (via RichTextEditor), we need to cancel the editing, so that the
        // text being edited is stored in the model
        const sel = editor.getSelected();
        if (sel) {
            sel.view.disableEditing();
        }

        editor.select(null);

        const trustedUrlBase = getTrustedUrl();
        const sandboxUrlBase = getSandboxUrl();
        const publicUrlBase = getPublicUrl();

        const source = unbase(editor.getHtml(), trustedUrlBase, sandboxUrlBase, publicUrlBase, true);
        const style = unbase(editor.getCss(), trustedUrlBase, sandboxUrlBase, publicUrlBase, true);

        let html;

        const preMjml = '<mjml><mj-head></mj-head><mj-body>';
        const postMjml = '</mj-body></mjml>';
        const mjml = preMjml + source + postMjml;
        console.log(mjml);

        const mjmlRes = mjml2html(mjml);
        console.log(mjmlRes);
        console.log(mjmlRes.html);
        console.log(mjmlRes.errors);
        console.log(mjmlRes.errors[0]);

        return {
            html,
            style: style,
            source: source
        };
    }

    componentDidMount() {
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


