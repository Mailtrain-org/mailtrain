'use strict';

import React, {Component} from "react";
import PropTypes from "prop-types";
import {translate} from "react-i18next";
import {requiresAuthenticatedUser, withPageHelpers} from "./page";
import {withAsyncErrorHandler, withErrorHandling} from "./error-handling";
import axios from "./axios";
import styles from "./styles.scss";
import {getTrustedUrl, getSandboxUrl} from "./urls";
import {Table} from "./table";

@translate(null, { withRef: true })
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export class UntrustedContentHost extends Component {
    constructor(props) {
        super(props);

        this.refreshAccessTokenTimeout = null;
        this.accessToken = null;
        this.contentNodeIsLoaded = false;

        this.state = {
            hasAccessToken: false,
        };

        this.receiveMessageHandler = ::this.receiveMessage;

        this.rpcCounter = 0;
        this.rpcResolves = new Map();
    }

    static propTypes = {
        contentSrc: PropTypes.string,
        contentProps: PropTypes.object,
        tokenMethod: PropTypes.string,
        tokenParams: PropTypes.object,
        className: PropTypes.string
    }

    isInitialized() {
        return !!this.accessToken && !!this.props.contentProps;
    }

    receiveMessage(evt) {
        const msg = evt.data;
        console.log(msg);

        if (msg.type === 'initNeeded') {
            if (this.isInitialized()) {
                this.sendMessage('init', {
                    accessToken: this.accessToken,
                    contentProps: this.props.contentProps
                });
            }
        } else if (msg.type === 'rpcResponse') {
            const resolve = this.rpcResolves.get(msg.data.msgId);
            resolve(msg.data.ret);
        }
    }

    sendMessage(type, data) {
        if (this.contentNodeIsLoaded) { // This is to avoid errors "common.js:45744 Failed to execute 'postMessage' on 'DOMWindow': The target origin provided ('http://localhost:8081') does not match the recipient window's origin ('http://localhost:3000')"
            this.contentNode.contentWindow.postMessage({type, data}, getSandboxUrl(''));
        }
    }

    async ask(method, params) {
        if (this.contentNodeIsLoaded) {
            this.rpcCounter += 1;
            const msgId = this.rpcCounter;

            this.sendMessage('rpcRequest', {
                params,
                msgId
            });

            return await (new Promise((resolve, reject) => {
                this.rpcResolves.set(msgId, resolve);
            }));
        }
    }

    @withAsyncErrorHandler
    async refreshAccessToken() {
        const result = await axios.post(getTrustedUrl('rest/restricted-access-token'), {
            method: this.props.tokenMethod,
            params: this.props.tokenParams
        });

        this.accessToken = result.data;

        if (!this.state.hasAccessToken) {
            this.setState({
                hasAccessToken: true
            })
        }

        this.sendMessage('accessToken', this.accessToken);
    }

    scheduleRefreshAccessToken() {
        this.refreshAccessTokenTimeout = setTimeout(() => {
            this.refreshAccessToken();
            this.scheduleRefreshAccessToken();
        }, 60 * 1000);
    }

    handleUpdate() {
        if (this.isInitialized()) {
            this.sendMessage('initAvailable');
        }

        if (!this.state.hasAccessToken) {
            this.refreshAccessToken();
        }
    }

    componentDidMount() {
        this.scheduleRefreshAccessToken();
        window.addEventListener('message', this.receiveMessageHandler, false);

        this.handleUpdate();
    }

    componentDidUpdate() {
        this.handleUpdate();
    }

    componentWillUnmount() {
        clearTimeout(this.refreshAccessTokenTimeout);
        window.removeEventListener('message', this.receiveMessageHandler, false);
    }

    contentNodeLoaded() {
        this.contentNodeIsLoaded = true;
    }

    render() {
        const t = this.props.t;

        return (
            <iframe className={styles.untrustedContent + ' ' + this.props.className} ref={node => this.contentNode = node} src={getSandboxUrl(this.props.contentSrc)} onLoad={::this.contentNodeLoaded}> </iframe>
        );
    }
}

UntrustedContentHost.prototype.ask = async function(method, params) {
    return await this.getWrappedInstance().ask(method, params);
};


@translate()
export class UntrustedContentRoot extends Component {
    constructor(props) {
        super(props);

        this.state = {
            initialized: false,
        };

        this.receiveMessageHandler = ::this.receiveMessage;
    }

    static propTypes = {
        render: PropTypes.func
    }


    setAccessTokenCookie(token) {
        document.cookie = 'restricted_access_token=' + token + '; expires=' + (new Date(Date.now()+60000)).toUTCString();
        console.log(document.cookie);
    }

    async receiveMessage(evt) {
        const msg = evt.data;
        console.log(msg);

        if (msg.type === 'initAvailable' && !this.state.initialized) {
            this.sendMessage('initNeeded');

        } else if (msg.type === 'init' && !this.state.initialized) {
            this.setAccessTokenCookie(msg.data.accessToken);
            this.setState({
                initialized: true,
                contentProps: msg.data.contentProps
            });

        } else if (msg.type === 'accessToken') {
            this.setAccessTokenCookie(msg.data);
        } else if (msg.type === 'rpcRequest') {
            const ret = await this.contentNode.onMethodAsync(msg.data.method, msg.data.params);
            this.sendMessage('rpcResponse', {msgId: msg.data.msgId, ret});
        }
    }

    sendMessage(type, data) {
        window.parent.postMessage({type, data}, getTrustedUrl(''));
    }

    componentDidMount() {
        window.addEventListener('message', this.receiveMessageHandler, false);
        this.sendMessage('initNeeded');
    }

    componentWillUnmount() {
        window.removeEventListener('message', this.receiveMessageHandler, false);
    }

    render() {
        const t = this.props.t;

        const props = {
            ...this.state.contentProps,
            ref: node => this.contentNode = node
        };

        if (this.state.initialized) {
            return this.props.render(props);
        } else {
            return (
                <div>
                    {t('Loading...')}
                </div>
            );
        }
    }
}