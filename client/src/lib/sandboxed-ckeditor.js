'use strict';

import React, {Component} from 'react';
import {translate} from 'react-i18next';
import PropTypes from "prop-types";
import styles from "./sandboxed-ckeditor.scss";

import {UntrustedContentHost, parentRPC} from './untrusted';
import {Icon} from "./bootstrap-components";
import {
    getPublicUrl,
    getSandboxUrl,
    getTrustedUrl
} from "./urls";
import {
    base,
    unbase
} from "../../../shared/templates";
import CKEditor from "react-ckeditor-component";

const initialHeight = 600;
const navbarHeight = 34; // Sync this with navbarheight in sandboxed-ckeditor.scss

@translate(null, { withRef: true })
export class CKEditorHost extends Component {
    constructor(props) {
        super(props);

        this.state = {
            fullscreen: false
        }

        this.onWindowResizeHandler = ::this.onWindowResize;
    }

    static propTypes = {
        entityTypeId: PropTypes.string,
        entity: PropTypes.object,
        initialHtml: PropTypes.string,
        title: PropTypes.string,
        onFullscreenAsync: PropTypes.func
    }

    async toggleFullscreenAsync() {
        const fullscreen = !this.state.fullscreen;
        this.setState({
            fullscreen
        });
        await this.props.onFullscreenAsync(fullscreen);

        let newHeight;
        if (fullscreen) {
            newHeight = window.innerHeight - navbarHeight;
        } else {
            newHeight = initialHeight;
        }
        await this.contentNode.ask('setHeight', newHeight);
    }

    async exportState() {
        return await this.contentNode.ask('exportState');
    }

    onWindowResize() {
        if (this.state.fullscreen) {
            const newHeight = window.innerHeight - navbarHeight;
            this.contentNode.ask('setHeight', newHeight);
        }
    }

    componentDidMount() {
        window.addEventListener('resize', this.onWindowResizeHandler, false);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onWindowResizeHandler, false);
    }

    render() {
        const t = this.props.t;

        const editorData = {
            entityTypeId: this.props.entityTypeId,
            entityId: this.props.entity.id,
            initialHtml: this.props.initialHtml
        };

        const tokenData = {
            entityTypeId: this.props.entityTypeId,
            entityId: this.props.entity.id
        };

        return (
            <div className={this.state.fullscreen ? styles.editorFullscreen : styles.editor}>
                <div className={styles.navbar}>
                    {this.state.fullscreen && <img className={styles.logo} src={getTrustedUrl('static/mailtrain-notext.png')}/>}
                    <div className={styles.title}>{this.props.title}</div>
                    <a className={styles.btn} onClick={::this.toggleFullscreenAsync}><Icon icon="fullscreen"/></a>
                </div>
                <UntrustedContentHost ref={node => this.contentNode = node} className={styles.host} singleToken={true} contentProps={editorData} contentSrc="ckeditor/editor" tokenMethod="ckeditor" tokenParams={editorData}/>
            </div>
        );
    }
}

CKEditorHost.prototype.exportState = async function() {
    return await this.getWrappedInstance().exportState();
};


@translate(null, { withRef: true })
export class CKEditorSandbox extends Component {
    constructor(props) {
        super(props);

        const trustedUrlBase = getTrustedUrl();
        const sandboxUrlBase = getSandboxUrl();
        const publicUrlBase = getPublicUrl();
        const html = this.props.initialHtml && base(this.props.initialHtml, trustedUrlBase, sandboxUrlBase, publicUrlBase);

        this.state = {
            html
        };
    }

    static propTypes = {
        entityTypeId: PropTypes.string,
        entityId: PropTypes.number,
        initialHtml: PropTypes.string
    }

    async exportState(method, params) {
        const trustedUrlBase = getTrustedUrl();
        const sandboxUrlBase = getSandboxUrl();
        const publicUrlBase = getPublicUrl();
        return {
            html: unbase(this.state.html, trustedUrlBase, sandboxUrlBase, publicUrlBase, true)
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
            removeButtons: 'Underline,Subscript,Superscript,Maximize',
            resize_enabled: false,
            height: initialHeight
        };

        return (
            <div className={styles.sandbox}>
                <CKEditor ref={node => this.node = node}
                    content={this.state.html}
                    events={{
                        change: evt => this.setState({html: evt.editor.getData()}),
                    }}
                    config={config}
                />
            </div>
        );
    }
}
