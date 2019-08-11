'use strict';

import React, {Component} from 'react';
import {withTranslation} from './i18n';
import PropTypes from "prop-types";
import styles from "./sandboxed-ckeditor.scss";

import {UntrustedContentHost} from './untrusted';
import {Icon} from "./bootstrap-components";
import {getTrustedUrl} from "./urls";

import {initialHeight} from "./sandboxed-ckeditor-shared";
import {withComponentMixins} from "./decorator-helpers";
import {getTagLanguageFromEntity} from "./sandbox-common";

const navbarHeight = 34; // Sync this with navbarheight in sandboxed-ckeditor.scss

@withComponentMixins([
    withTranslation
], ['exportState'])
export class CKEditorHost extends Component {
    constructor(props) {
        super(props);

        this.state = {
            fullscreen: false
        };

        this.onWindowResizeHandler = ::this.onWindowResize;
        this.contentNodeRefHandler = node => this.contentNode = node;
    }

    static propTypes = {
        entityTypeId: PropTypes.string,
        entity: PropTypes.object,
        initialSource: PropTypes.string,
        title: PropTypes.string,
        onSave: PropTypes.func,
        canSave: PropTypes.bool,
        onTestSend: PropTypes.func,
        onShowExport: PropTypes.func,
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
            // noinspection JSIgnoredPromiseFromCall
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
            tagLanguage: getTagLanguageFromEntity(this.props.entity, this.props.entityTypeId),
            initialSource: this.props.initialSource
        };

        const tokenData = {
            entityTypeId: this.props.entityTypeId,
            entityId: this.props.entity.id
        };

        return (
            <div className={this.state.fullscreen ? styles.editorFullscreen : styles.editor}>
                <div className={styles.navbar}>
                    <div className={styles.navbarLeft}>
                        {this.state.fullscreen && <img className={styles.logo} src={getTrustedUrl('static/mailtrain-notext.png')}/>}
                        <div className={styles.title}>{this.props.title}</div>
                    </div>
                    <div className={styles.navbarRight}>
                        {this.props.canSave ? <a className={styles.btn} onClick={this.props.onSave} title={t('save')}><Icon icon="save"/></a> : <span className={styles.btnDisabled}><Icon icon="save"/></span>}
                        <a className={styles.btn} onClick={this.props.onTestSend} title={t('sendTestEmail-1')}><Icon icon="at"/></a>
                        <a className={styles.btn} onClick={() => this.props.onShowExport('html', 'HTML')} title={t('showHtml')}><Icon icon="file-code"/></a>
                        <a className={styles.btn} onClick={::this.toggleFullscreenAsync} title={t('maximizeEditor')}><Icon icon="window-maximize"/></a>
                    </div>
                </div>
                <UntrustedContentHost ref={this.contentNodeRefHandler} className={styles.host} singleToken={true} contentProps={editorData} contentSrc="ckeditor/editor" tokenMethod="ckeditor" tokenParams={editorData}/>
            </div>
        );
    }
}
