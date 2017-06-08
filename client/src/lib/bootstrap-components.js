'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { withErrorHandling, withAsyncErrorHandler } from './error-handling';

@translate()
@withErrorHandling
class DismissibleAlert extends Component {
    static propTypes = {
        severity: PropTypes.string.isRequired,
        onCloseAsync: PropTypes.func
    }

    @withAsyncErrorHandler
    onClose() {
        if (this.props.onCloseAsync) {
            this.props.onCloseAsync();
        }
    }

    render() {
        const t = this.props.t;

        return (
            <div className={`alert alert-${this.props.severity} alert-dismissible`} role="alert">
                <button type="button" className="close" aria-label={t('Close')} onClick={::this.onClose}><span aria-hidden="true">&times;</span></button>
                {this.props.children}
            </div>
        )
    }
}

@withErrorHandling
class Button extends Component {
    static propTypes = {
        onClickAsync: PropTypes.func,
        label: PropTypes.string,
        icon: PropTypes.string,
        className: PropTypes.string
    }

    @withAsyncErrorHandler
    async onClick(evt) {
        if (this.props.onClickAsync) {
            evt.preventDefault();
            await this.props.onClickAsync(evt);
        }
    }

    render() {
        const props = this.props;

        let className = 'btn';
        if (props.className) {
            className = className + ' ' + props.className;
        }

        let icon;
        if (props.icon) {
            icon = <span className={'glyphicon glyphicon-' + props.icon}></span>
        }

        let iconSpacer;
        if (props.icon && props.label) {
            iconSpacer = ' ';
        }

        return (
            <button type="button" className={className} onClick={::this.onClick}>{icon}{iconSpacer}{props.label}</button>
        );
    }
}


@translate()
@withErrorHandling
class ModalDialog extends Component {
    constructor(props) {
        super(props);

        const t = props.t;

        this.state = {
            buttons: this.props.buttons || [ { label: t('Close'), className: 'btn-default', onClickAsync: null } ]
        };

        this.buttonClicked = null;
    }

    static propTypes = {
        title: PropTypes.string,
        onCloseAsync: PropTypes.func,
        onButtonClickAsync: PropTypes.func,
        buttons: PropTypes.array
    }

    componentDidMount() {
        const jqModal = jQuery(this.domModal);

        jqModal.on('shown.bs.modal', () => jqModal.focus());
        jqModal.on('hidden.bs.modal', () => this.onHide());
        jqModal.modal();

    }

    close() {
        const jqModal = jQuery(this.domModal);
        jqModal.modal('hide');
    }

    @withAsyncErrorHandler
    async onHide() {
        if (this.buttonClicked === null) {
            if (this.props.onCloseAsync) {
                await this.props.onCloseAsync();
            }
        } else {
            const idx = this.buttonClicked;
            this.buttonClicked = null;

            const buttonSpec = this.state.buttons[idx];
            if (buttonSpec.onClickAsync) {
                await buttonSpec.onClickAsync(idx);
            }

        }
    }

    async onButtonClick(idx) {
        this.buttonClicked = idx;
        const jqModal = jQuery(this.domModal);
        jqModal.modal('hide');
    }

    render() {
        const props = this.props;
        const t = props.t;

        const buttons = [];
        for (let idx = 0; idx < this.state.buttons.length; idx++) {
            const buttonSpec = this.state.buttons[idx];
            const button = <Button key={idx} label={buttonSpec.label} className={buttonSpec.className} onClickAsync={() => this.onButtonClick(idx)} />
            buttons.push(button);
        }

        return (
            <div ref={(domElem) => { this.domModal = domElem; }} className="modal fade" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="close" aria-label={t('Close')} onClick={::this.close}><span aria-hidden="true">&times;</span></button>
                            <h4 className="modal-title">{this.props.title}</h4>
                        </div>
                        <div className="modal-body">{this.props.children}</div>
                        <div className="modal-footer">
                            {buttons}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}



export {
    Button,
    DismissibleAlert,
    ModalDialog
};