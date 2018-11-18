'use strict';

import React, {Component} from 'react';
import { withTranslation } from './i18n';
import PropTypes
    from "prop-types";
import styles
    from "./sandboxed-codeeditor.scss";

import {UntrustedContentHost} from './untrusted';
import {Icon} from "./bootstrap-components";
import {getTrustedUrl} from "./urls";

@withTranslation({delegateFuns: ['exportState']})
export class CodeEditorHost extends Component {
    constructor(props) {
        super(props);

        this.state = {
            fullscreen: false,
            preview: true
        }
    }

    static propTypes = {
        entityTypeId: PropTypes.string,
        entity: PropTypes.object,
        initialSource: PropTypes.string,
        sourceType: PropTypes.string,
        title: PropTypes.string,
        onTestSend: PropTypes.func,
        onFullscreenAsync: PropTypes.func
    }

    async toggleFullscreenAsync() {
        const fullscreen = !this.state.fullscreen;
        this.setState({
            fullscreen
        });
        await this.props.onFullscreenAsync(fullscreen);
    }

    async togglePreviewAsync() {
        const preview = !this.state.preview;
        this.setState({
            preview
        });

        await this.contentNode.ask('setPreview', preview);
    }

    async exportState() {
        return await this.contentNode.ask('exportState');
    }

    render() {
        const t = this.props.t;

        const editorData = {
            entityTypeId: this.props.entityTypeId,
            entityId: this.props.entity.id,
            initialSource: this.props.initialSource,
            sourceType: this.props.sourceType,
            initialPreview: this.state.preview
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
                    <a className={styles.btn} onClick={this.props.onTestSend}><Icon icon="send"/></a>
                    <a className={styles.btn} onClick={::this.togglePreviewAsync}><Icon icon={this.state.preview ? 'eye-close': 'eye-open'}/></a>
                </div>
                <UntrustedContentHost ref={node => this.contentNode = node} className={styles.host} singleToken={true} contentProps={editorData} contentSrc="codeeditor/editor" tokenMethod="codeeditor" tokenParams={tokenData}/>
            </div>
        );
    }
}
