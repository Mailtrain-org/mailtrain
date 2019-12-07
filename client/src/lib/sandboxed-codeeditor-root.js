'use strict';

import './public-path';

import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {TranslationRoot, withTranslation} from './i18n';
import {parentRPC, UntrustedContentRoot} from './untrusted';
import PropTypes from "prop-types";
import styles from "./sandboxed-codeeditor.scss";
import {getPublicUrl, getSandboxUrl, getTrustedUrl} from "./urls";
import {base, unbase} from "../../../shared/templates";
import ACEEditorRaw from 'react-ace';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-searchbox';
import 'ace-builds/src-noconflict/mode-html';
import {CodeEditorSourceType} from "./sandboxed-codeeditor-shared";

import mjml2html from "./mjml";

import juice from "juice";

import {withComponentMixins} from "./decorator-helpers";

const refreshTimeout = 1000;

@withComponentMixins([
    withTranslation
])
class CodeEditorSandbox extends Component {
    constructor(props) {
        super(props);

        let defaultSource;

        if (props.sourceType === CodeEditorSourceType.MJML) {
            defaultSource =
                '<mjml>\n' +
                '  <mj-body>\n' +
                '    <mj-section>\n' +
                '      <mj-column>\n' +
                '        <!-- First column content -->\n' +
                '      </mj-column>\n' +
                '      <mj-column>\n' +
                '        <!-- Second column content -->\n' +
                '      </mj-column>\n' +
                '    </mj-section>\n' +
                '  </mj-body>\n' +
                '</mjml>';

        } else if (props.sourceType === CodeEditorSourceType.HTML) {
            defaultSource =
                '<!DOCTYPE html>\n' +
                '<html>\n' +
                '<head>\n' +
                '  <meta charset="UTF-8">\n' +
                '  <title>Title of the document</title>\n' +
                '</head>\n' +
                '<body>\n' +
                '  Content of the document......\n' +
                '</body>\n' +
                '</html>';
        }


        const trustedUrlBase = getTrustedUrl();
        const sandboxUrlBase = getSandboxUrl();
        const publicUrlBase = getPublicUrl();
        const source = this.props.initialSource ? base(this.props.initialSource, this.props.tagLanguage, trustedUrlBase, sandboxUrlBase, publicUrlBase) : defaultSource;

        this.state = {
            source,
            preview: props.initialPreview,
            wrapEnabled: props.initialWrap
        };
        this.state.previewContents = this.getHtml();

        this.onCodeChangedHandler = ::this.onCodeChanged;

        this.refreshHandler = ::this.refresh;
        this.refreshTimeoutId = null;

        this.onMessageFromPreviewHandler = ::this.onMessageFromPreview;
        this.previewScroll = {x: 0, y: 0};
    }

    static propTypes = {
        entityTypeId: PropTypes.string,
        entityId: PropTypes.number,
        tagLanguage: PropTypes.string,
        initialSource: PropTypes.string,
        sourceType: PropTypes.string,
        initialPreview: PropTypes.bool,
        initialWrap: PropTypes.bool
    }

    async exportState(method, params) {
        const trustedUrlBase = getTrustedUrl();
        const sandboxUrlBase = getSandboxUrl();
        const publicUrlBase = getPublicUrl();
        return {
            html: unbase(this.getHtml(), this.props.tagLanguage, trustedUrlBase, sandboxUrlBase, publicUrlBase, true),
            source: unbase(this.state.source, this.props.tagLanguage, trustedUrlBase, sandboxUrlBase, publicUrlBase, true)
        };
    }

    async setPreview(method, preview) {
        this.setState({
            preview
        });
    }

    async setWrap(method, wrap) {
        this.setState({
            wrapEnabled: wrap
        });
    }

    componentDidMount() {
        parentRPC.setMethodHandler('exportState', ::this.exportState);
        parentRPC.setMethodHandler('setPreview', ::this.setPreview);
        parentRPC.setMethodHandler('setWrap', ::this.setWrap);

        window.addEventListener('message', this.onMessageFromPreviewHandler, false);
    }

    componentWillUnmount() {
        clearTimeout(this.refreshTimeoutId);
    }

    getHtml() {
        let contents;
        if (this.props.sourceType === CodeEditorSourceType.MJML) {
            try {
                const res = mjml2html(this.state.source);
                contents = res.html;
            } catch (err) {
                contents = '';
            }
        } else if (this.props.sourceType === CodeEditorSourceType.HTML) {
            contents = juice(this.state.source);
        }

        return contents;
    }

    onCodeChanged(data) {
        this.setState({
            source: data
        });

        if (!this.refreshTimeoutId) {
            this.refreshTimeoutId = setTimeout(this.refreshHandler, refreshTimeout);
        }
    }

    onMessageFromPreview(evt) {
        if (evt.data.type === 'scroll') {
            this.previewScroll = evt.data.data;
        }
    }

    refresh() {
        this.refreshTimeoutId = null;

        this.setState({
            previewContents: this.getHtml()
        });
    }

    render() {
        const previewScript =
            '(function() {\n' +
            '    function reportScroll() { window.parent.postMessage({type: \'scroll\', data: {x: window.scrollX, y: window.scrollY}}, \'*\'); }\n' +
            '    reportScroll();\n' +
            '    window.addEventListener(\'scroll\', reportScroll);\n' +
            '    window.addEventListener(\'load\', function(evt) { window.scrollTo(' + this.previewScroll.x + ',' + this.previewScroll.y +'); });\n' +
            '})();\n';

        const previewContents = this.state.previewContents.replace(/<\s*head\s*>/i, `<head><script>${previewScript}</script>`);

        return (
            <div className={styles.sandbox}>
                <div className={this.state.preview ? styles.aceEditorWithPreview : styles.aceEditorWithoutPreview}>
                    <ACEEditorRaw
                        mode="html"
                        theme="github"
                        width="100%"
                        height="100%"
                        onChange={this.onCodeChangedHandler}
                        fontSize={12}
                        showPrintMargin={false}
                        value={this.state.source}
                        tabSize={2}
                        wrapEnabled={this.state.wrapEnabled}
                        setOptions={{useWorker: false}} // This disables syntax check because it does not always work well (e.g. in case of JS code in report templates)
                    />
                </div>
                {
                    this.state.preview &&
                    <div className={styles.preview}>
                        <iframe ref={node => this.previewNode = node} src={"data:text/html;charset=utf-8," + encodeURIComponent(previewContents)}></iframe>
                    </div>
                }
            </div>
        );
    }
}

export default function() {
    parentRPC.init();

    ReactDOM.render(
        <TranslationRoot>
            <UntrustedContentRoot render={props => <CodeEditorSandbox {...props} />} />
        </TranslationRoot>,
        document.getElementById('root')
    );
};


