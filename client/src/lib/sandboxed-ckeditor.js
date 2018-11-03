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
import CKEditor from './ckeditor';

@translate(null, { withRef: true })
export class CKEditorHost extends Component {
    constructor(props) {
        super(props);

        this.state = {}
    }

    static propTypes = {
        entityTypeId: PropTypes.string,
        entity: PropTypes.object,
        initialHtml: PropTypes.string
    }

    async exportState() {
        return await this.contentNode.ask('exportState');
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
            <div className={styles.editor}>
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

    componentDidMount() {
        parentRPC.setMethodHandler('exportState', ::this.exportState);
    }

    render() {
        return (
            <div className={styles.sandbox}>
                <CKEditor
                    onChange={(event, editor) => this.setState({html: editor.getData()})}
                    data={this.state.html}
                />
            </div>
        );
    }
}
