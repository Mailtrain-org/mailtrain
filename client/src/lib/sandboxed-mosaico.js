'use strict';

import React, {Component} from 'react';
import {withTranslation} from './i18n';
import PropTypes
    from "prop-types";
import styles
    from "./sandboxed-mosaico.scss";

import {UntrustedContentHost} from './untrusted';
import {Icon} from "./bootstrap-components";
import {getTrustedUrl} from "./urls";
import {withComponentMixins} from "./decorator-helpers";


@withComponentMixins([
    withTranslation
], ['exportState'])
export class MosaicoHost extends Component {
    constructor(props) {
        super(props);

        this.state = {
            fullscreen: false
        }
    }

    static propTypes = {
        entityTypeId: PropTypes.string,
        entity: PropTypes.object,
        title: PropTypes.string,
        onSave: PropTypes.func,
        canSave: PropTypes.bool,
        onTestSend: PropTypes.func,
        onFullscreenAsync: PropTypes.func,
        templateId: PropTypes.number,
        templatePath: PropTypes.string,
        initialModel: PropTypes.string,
        initialMetadata: PropTypes.string
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
            templateId: this.props.templateId,
            templatePath: this.props.templatePath,
            initialModel: this.props.initialModel,
            initialMetadata: this.props.initialMetadata
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
                <UntrustedContentHost ref={node => this.contentNode = node} className={styles.host} singleToken={true} contentProps={editorData} contentSrc="mosaico/editor" tokenMethod="mosaico" tokenParams={tokenData}/>
            </div>
        );
    }
}
