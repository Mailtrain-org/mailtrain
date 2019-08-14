'use strict';

import React, {Component} from 'react';
import {withTranslation} from './i18n';
import PropTypes from "prop-types";
import styles from "./sandboxed-codeeditor.scss";

import {UntrustedContentHost} from './untrusted';
import {Icon} from "./bootstrap-components";
import {getTrustedUrl} from "./urls";
import {withComponentMixins} from "./decorator-helpers";
import {getTagLanguageFromEntity} from "./sandbox-common";

@withComponentMixins([
    withTranslation
], ['exportState'])
export class CodeEditorHost extends Component {
    constructor(props) {
        super(props);

        this.state = {
            fullscreen: false,
            preview: true,
            wrap: true
        };

        this.contentNodeRefHandler = node => this.contentNode = node;
    }

    static propTypes = {
        entityTypeId: PropTypes.string,
        entity: PropTypes.object,
        initialSource: PropTypes.string,
        sourceType: PropTypes.string,
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
    }

    async togglePreviewAsync() {
        const preview = !this.state.preview;
        this.setState({
            preview
        });

        await this.contentNode.ask('setPreview', preview);
    }

    async toggleWrapAsync() {
        const wrap = !this.state.wrap;
        this.setState({
            wrap
        });

        await this.contentNode.ask('setWrap', wrap);
    }

    async exportState() {
        return await this.contentNode.ask('exportState');
    }

    render() {
        const t = this.props.t;

        const editorData = {
            entityTypeId: this.props.entityTypeId,
            entityId: this.props.entity.id,
            tagLanguage: getTagLanguageFromEntity(this.props.entity, this.props.entityTypeId),
            initialSource: this.props.initialSource,
            sourceType: this.props.sourceType,
            initialPreview: this.state.preview,
            initialWrap: this.state.wrap
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
                        <a className={styles.btn} onClick={::this.toggleWrapAsync} title={this.state.wrap ? t('disableWordWrap') : t('enableWordWrap')}>{this.state.wrap ? 'WRAP': 'NOWRAP'}</a>
                        {this.props.canSave ? <a className={styles.btn} onClick={this.props.onSave} title={t('save')}><Icon icon="save"/></a> : <span className={styles.btnDisabled}><Icon icon="floppy-disk"/></span>}
                        <a className={styles.btn} onClick={this.props.onTestSend} title={t('sendTestEmail-1')}><Icon icon="at"/></a>
                        <a className={styles.btn} onClick={() => this.props.onShowExport('html', 'HTML')} title={t('showHtml')}><Icon icon="file-code"/></a>
                        <a className={styles.btn} onClick={::this.togglePreviewAsync} title={this.state.preview ? t('hidePreview'): t('showPreview')}><Icon icon={this.state.preview ? 'eye-slash': 'eye'}/></a>
                        <a className={styles.btn} onClick={::this.toggleFullscreenAsync} title={t('maximizeEditor')}><Icon icon="window-maximize"/></a>
                    </div>
                </div>
                <UntrustedContentHost ref={this.contentNodeRefHandler} className={styles.host} singleToken={true} contentProps={editorData} contentSrc="codeeditor/editor" tokenMethod="codeeditor" tokenParams={tokenData}/>
            </div>
        );
    }
}
