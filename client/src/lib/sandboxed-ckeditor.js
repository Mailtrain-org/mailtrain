'use strict';

import React, {Component} from 'react';
import { withTranslation } from './i18n';
import PropTypes
    from "prop-types";
import styles
    from "./sandboxed-ckeditor.scss";

import {UntrustedContentHost} from './untrusted';
import {Icon} from "./bootstrap-components";
import {getTrustedUrl} from "./urls";

import { initialHeight } from "./sandboxed-ckeditor-shared";
const navbarHeight = 34; // Sync this with navbarheight in sandboxed-ckeditor.scss

@withTranslation({delegateFuns: ['exportState']})
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
        initialSource: PropTypes.string,
        title: PropTypes.string,
        onSave: PropTypes.func,
        canSave: PropTypes.bool,
        onTestSend: PropTypes.func,
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
            initialSource: this.props.initialSource
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
                    {this.props.canSave ? <a className={styles.btn} onClick={this.props.onSave}><Icon icon="floppy-disk"/></a> : <span className={styles.btnDisabled}><Icon icon="floppy-disk"/></span>}
                </div>
                <UntrustedContentHost ref={node => this.contentNode = node} className={styles.host} singleToken={true} contentProps={editorData} contentSrc="ckeditor/editor" tokenMethod="ckeditor" tokenParams={editorData}/>
            </div>
        );
    }
}
