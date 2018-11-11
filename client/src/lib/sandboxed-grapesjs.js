'use strict';

import React, {Component} from 'react';
import {translate} from 'react-i18next';
import PropTypes
    from "prop-types";
import styles
    from "./sandboxed-grapesjs.scss";

import {UntrustedContentHost} from './untrusted';
import {Icon} from "./bootstrap-components";
import {getTrustedUrl} from "./urls";
import {GrapesJSSourceType} from "./sandboxed-grapesjs-shared";

@translate(null, { withRef: true })
export class GrapesJSHost extends Component {
    constructor(props) {
        super(props);

        this.state = {
            fullscreen: false
        }
    }

    static propTypes = {
        entityTypeId: PropTypes.string,
        entity: PropTypes.object,
        initialSource: PropTypes.string,
        initialStyle: PropTypes.string,
        sourceType: PropTypes.string,
        title: PropTypes.string,
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
                    {this.state.fullscreen && <img className={styles.logo} src={getTrustedUrl('static/mailtrain-notext.png')}/>}
                    <div className={styles.title}>{this.props.title}</div>
                    <a className={styles.btn} onClick={::this.toggleFullscreenAsync}><Icon icon="fullscreen"/></a>
                </div>
                <UntrustedContentHost ref={node => this.contentNode = node} className={styles.host} singleToken={true} contentProps={editorData} contentSrc="grapesjs/editor" tokenMethod="grapesjs" tokenParams={tokenData}/>
            </div>
        );
    }
}

GrapesJSHost.prototype.exportState = async function() {
    return await this.getWrappedInstance().exportState();
};
