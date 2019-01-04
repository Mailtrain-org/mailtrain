'use strict';

import React, {Component} from "react";
import PropTypes
    from "prop-types";
import {withTranslation} from './i18n';
import {
    requiresAuthenticatedUser,
    withPageHelpers
} from "./page";
import {
    withAsyncErrorHandler,
    withErrorHandling
} from "./error-handling";
import axios
    from "./axios";
import styles
    from "./styles.scss";
import {
    getSandboxUrl,
    getTrustedUrl,
    getUrl,
    setRestrictedAccessToken
} from "./urls";
import {withComponentMixins} from "./decorator-helpers";

@withComponentMixins([
    withErrorHandling,
    withPageHelpers,
    requiresAuthenticatedUser
], ['ask'])
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
        className: PropTypes.string,
        singleToken: PropTypes.bool,
        onMethodAsync: PropTypes.func
    }

    isInitialized() {
        return !!this.accessToken && !!this.props.contentProps;
    }

    async receiveMessage(evt) {
        const msg = evt.data;

        if (msg.type === 'initNeeded') {
            // It seems that sometime the message that the content node does not arrive. However if the content root notifies us, we just proceed
            this.contentNodeIsLoaded = true;

            if (this.isInitialized()) {
                this.sendMessage('init', {
                    accessToken: this.accessToken,
                    contentProps: this.props.contentProps
                });
            }
        } else if (msg.type === 'rpcResponse') {
            const resolve = this.rpcResolves.get(msg.data.msgId);
            resolve(msg.data.ret);
        } else if (msg.type === 'rpcRequest') {
            const ret = await this.props.onMethodAsync(msg.data.method, msg.data.params);
            this.sendMessage('rpcResponse', {msgId: msg.data.msgId, ret});
        } else if (msg.type === 'clientHeight') {
            const newHeight = msg.data;
            this.contentNode.height = newHeight;
        }
    }

    sendMessage(type, data) {
        if (this.contentNodeIsLoaded) { // This is to avoid errors: Failed to execute 'postMessage' on 'DOMWindow': The target origin provided ('http://localhost:8081') does not match the recipient window's origin ('http://localhost:3000')"
            this.contentNode.contentWindow.postMessage({type, data}, getSandboxUrl());
        }
    }

    async ask(method, params) {
        if (this.contentNodeIsLoaded) {
            this.rpcCounter += 1;
            const msgId = this.rpcCounter;

            this.sendMessage('rpcRequest', {
                method,
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
        if (this.props.singleToken && this.accessToken) {
            await axios.put(getUrl('rest/restricted-access-token'), {
                token: this.accessToken
            });
        } else {
            const result = await axios.post(getUrl('rest/restricted-access-token'), {
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
    }

    scheduleRefreshAccessToken() {
        this.refreshAccessTokenTimeout = setTimeout(() => {
            // noinspection JSIgnoredPromiseFromCall
            this.refreshAccessToken();
            this.scheduleRefreshAccessToken();
        }, 30 * 1000);
    }

    handleUpdate() {
        if (this.isInitialized()) {
            this.sendMessage('initAvailable');
        }

        if (!this.state.hasAccessToken) {
            // noinspection JSIgnoredPromiseFromCall
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
        return (
            <iframe className={styles.untrustedContent + ' ' + this.props.className} ref={node => this.contentNode = node} src={getSandboxUrl(this.props.contentSrc)} onLoad={::this.contentNodeLoaded}> </iframe>
        );
    }
}


@withComponentMixins([
    withTranslation
])
export class UntrustedContentRoot extends Component {
    constructor(props) {
        super(props);

        this.state = {
            initialized: false,
        };

        this.receiveMessageHandler = ::this.receiveMessage;

        this.periodicTimeoutHandler = ::this.onPeriodicTimeout;
        this.periodicTimeoutId = 0;

        this.clientHeight = 0;
    }

    static propTypes = {
        render: PropTypes.func
    }


    onPeriodicTimeout() {
        const newHeight = document.body.clientHeight;
        if (this.clientHeight !== newHeight) {
            this.clientHeight = newHeight;
            this.sendMessage('clientHeight', newHeight);
        }
        this.periodicTimeoutId = setTimeout(this.periodicTimeoutHandler, 250);
    }


    async receiveMessage(evt) {
        const msg = evt.data;

        if (msg.type === 'initAvailable' && !this.state.initialized) {
            this.sendMessage('initNeeded');

        } else if (msg.type === 'init' && !this.state.initialized) {
            setRestrictedAccessToken(msg.data.accessToken);
            this.setState({
                initialized: true,
                contentProps: msg.data.contentProps
            });

        } else if (msg.type === 'accessToken') {
            setRestrictedAccessToken(msg.data);
        }
    }

    sendMessage(type, data) {
        window.parent.postMessage({type, data}, '*');
    }

    componentDidMount() {
        window.addEventListener('message', this.receiveMessageHandler, false);
        this.periodicTimeoutId = setTimeout(this.periodicTimeoutHandler, 0);
        this.sendMessage('initNeeded');
    }

    componentWillUnmount() {
        window.removeEventListener('message', this.receiveMessageHandler, false);
        clearTimeout(this.periodicTimeoutId);
    }

    render() {
        const t = this.props.t;

        if (this.state.initialized) {
            return this.props.render(this.state.contentProps);
        } else {
            return (
                <div>
                    {t('loading-1')}
                </div>
            );
        }
    }
}

class ParentRPC {
    constructor(props) {
        this.receiveMessageHandler = ::this.receiveMessage;

        this.rpcCounter = 0;
        this.rpcResolves = new Map();
        this.methodHandlers = new Map();

        this.initialized = false;
    }

    init() {
        window.addEventListener('message', this.receiveMessageHandler, false);
        this.initialized = true;
    }

    setMethodHandler(method, handler) {
        this.enforceInitialized();
        this.methodHandlers.set(method, handler);
    }

    clearMethodHandler(method) {
        this.enforceInitialized();
        this.methodHandlers.delete(method);
    }

    async ask(method, params) {
        this.enforceInitialized();
        this.rpcCounter += 1;
        const msgId = this.rpcCounter;

        this.sendMessage('rpcRequest', {
            method,
            params,
            msgId
        });

        return await (new Promise((resolve, reject) => {
            this.rpcResolves.set(msgId, resolve);
        }));
    }


    // ---------------------------------------------------------------------------
    // Private methods

    enforceInitialized() {
        if (!this.initialized) {
            throw new Error('ParentRPC not initialized');
        }
    }

    async receiveMessage(evt) {
        const msg = evt.data;

        if (msg.type === 'rpcResponse') {
            const resolve = this.rpcResolves.get(msg.data.msgId);
            resolve(msg.data.ret);

        } else if (msg.type === 'rpcRequest') {
            let ret;

            const method = msg.data.method;
            if (this.methodHandlers.has(method)) {
                const handler = this.methodHandlers.get(method);
                ret = await handler(method, msg.data.params);
            }

            this.sendMessage('rpcResponse', {msgId: msg.data.msgId, ret});
        }
    }

    sendMessage(type, data) {
        window.parent.postMessage({type, data}, '*');
    }
}

export const parentRPC = new ParentRPC();