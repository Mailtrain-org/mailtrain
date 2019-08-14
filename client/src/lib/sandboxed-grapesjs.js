'use strict';

import React, {Component} from 'react';
import {withTranslation} from './i18n';
import PropTypes from "prop-types";
import styles from "./sandboxed-grapesjs.scss";

import {UntrustedContentHost} from './untrusted';
import {Icon} from "./bootstrap-components";
import {getTrustedUrl} from "./urls";
import {withComponentMixins} from "./decorator-helpers";
import {GrapesJSSourceType} from "./sandboxed-grapesjs-shared";
import {getTagLanguageFromEntity} from "./sandbox-common";

@withComponentMixins([
    withTranslation
], ['exportState'])
export class GrapesJSHost extends Component {
    constructor(props) {
        super(props);

        this.state = {
            fullscreen: false
        };

        this.contentNodeRefHandler = node => this.contentNode = node;
    }

    static propTypes = {
        entityTypeId: PropTypes.string,
        entity: PropTypes.object,
        initialSource: PropTypes.string,
        initialStyle: PropTypes.string,
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
            initialStyle: this.props.initialStyle,
            sourceType: this.props.sourceType
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
                        {this.props.sourceType === GrapesJSSourceType.MJML && <a className={styles.btn} onClick={() => this.props.onShowExport('mjml', 'MJML')} title={t('showMjml')}>MJML</a>}
                        <a className={styles.btn} onClick={::this.toggleFullscreenAsync} title={t('maximizeEditor')}><Icon icon="window-maximize"/></a>
                    </div>
                </div>
                <UntrustedContentHost ref={this.contentNodeRefHandler} className={styles.host} singleToken={true} contentProps={editorData} contentSrc="grapesjs/editor" tokenMethod="grapesjs" tokenParams={tokenData}/>
            </div>
        );
    }
}
