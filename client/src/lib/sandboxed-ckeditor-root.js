'use strict';

import './public-path';

import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {TranslationRoot, withTranslation} from './i18n';
import {parentRPC, UntrustedContentRoot} from './untrusted';
import PropTypes from "prop-types";
import styles from "./sandboxed-ckeditor.scss";
import {getPublicUrl, getSandboxUrl, getTrustedUrl} from "./urls";
import {base, unbase} from "../../../shared/templates";

import CKEditor from "react-ckeditor-component";

import {initialHeight} from "./sandboxed-ckeditor-shared";
import {withComponentMixins} from "./decorator-helpers";


@withComponentMixins([
    withTranslation
])
class CKEditorSandbox extends Component {
    constructor(props) {
        super(props);

        const trustedUrlBase = getTrustedUrl();
        const sandboxUrlBase = getSandboxUrl();
        const publicUrlBase = getPublicUrl();
        const source = this.props.initialSource && base(this.props.initialSource, this.props.tagLanguage, trustedUrlBase, sandboxUrlBase, publicUrlBase);

        this.state = {
            source
        };
    }

    static propTypes = {
        entityTypeId: PropTypes.string,
        entityId: PropTypes.number,
        tagLanguage: PropTypes.string,
        initialSource: PropTypes.string
    }

    async exportState(method, params) {
        const trustedUrlBase = getTrustedUrl();
        const sandboxUrlBase = getSandboxUrl();
        const publicUrlBase = getPublicUrl();

        const preHtml = '<!doctype html><html><head><meta charset="utf-8"><title></title></head><body>';
        const postHtml = '</body></html>';

        const unbasedSource = unbase(this.state.source, this.props.tagLanguage, trustedUrlBase, sandboxUrlBase, publicUrlBase, true);

        return {
            source: unbasedSource,
            html: preHtml + unbasedSource + postHtml
        };
    }

    async setHeight(methods, params) {
        this.node.editorInstance.resize('100%', params);
    }

    componentDidMount() {
        parentRPC.setMethodHandler('exportState', ::this.exportState);
        parentRPC.setMethodHandler('setHeight', ::this.setHeight);
    }

    render() {
        const config = {
            toolbarGroups: [
                {
                    name: "document",
                    groups: ["document", "doctools"]
                },
                {
                    name: "clipboard",
                    groups: ["clipboard", "undo"]
                },
                {name: "styles"},
                {
                    name: "basicstyles",
                    groups: ["basicstyles", "cleanup"]
                },
                {
                    name: "editing",
                    groups: ["find", "selection", "spellchecker"]
                },
                {name: "forms"},
                {
                    name: "paragraph",
                    groups: ["list",
                        "indent", "blocks", "align", "bidi"]
                },
                {name: "links"},
                {name: "insert"},
                {name: "colors"},
                {name: "tools"},
                {name: "others"},
                {
                    name: "document-mode",
                    groups: ["mode"]
                }
            ],

            removeButtons: 'Underline,Subscript,Superscript,Maximize',
            resize_enabled: false,
            height: initialHeight
        };

        return (
            <div className={styles.sandbox}>
                <CKEditor ref={node => this.node = node}
                          content={this.state.source}
                          events={{
                              change: evt => this.setState({source: evt.editor.getData()}),
                          }}
                          config={config}
                />
            </div>
        );
    }
}

export default function() {
    parentRPC.init();

    ReactDOM.render(
        <TranslationRoot>
            <UntrustedContentRoot render={props => <CKEditorSandbox {...props} />} />
        </TranslationRoot>,
        document.getElementById('root')
    );
};


