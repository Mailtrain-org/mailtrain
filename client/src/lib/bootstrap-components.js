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
                <button type="button" className="close" aria-label={t('close')} onClick={::this.onClose}><span aria-hidden="true">&times;</span></button>
                {this.props.children}
            </div>
        )
    }
}

class Icon extends Component {
    static propTypes = {
        icon: PropTypes.string.isRequired,
        family: PropTypes.string,
        title: PropTypes.string,
        className: PropTypes.string
    }

    static defaultProps = {
        family: 'glyphicon'
    }

    render() {
        const props = this.props;

        return <span className={`${props.family} ${props.family}-${props.icon}` + (props.className ? ' ' + props.className : '')} title={props.title}></span>;
    }
}

@withErrorHandling
class Button extends Component {
    static propTypes = {
        onClickAsync: PropTypes.func,
        label: PropTypes.string,
        icon: PropTypes.string,
        className: PropTypes.string,
        type: PropTypes.string
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

        let type = props.type || 'button';

        let icon;
        if (props.icon) {
            icon = <Icon icon={props.icon}/>
        }

        let iconSpacer;
        if (props.icon && props.label) {
            iconSpacer = ' ';
        }

        return (
            <button type={type} className={className} onClick={::this.onClick}>{icon}{iconSpacer}{props.label}</button>
        );
    }
}

class DropdownMenu extends Component {
    static propTypes = {
        label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        noCaret: PropTypes.bool,
        className: PropTypes.string
    }

    render() {
        const props = this.props;

        let className = 'btn dropdown-toggle';
        if (props.className) {
            className = className + ' ' + props.className;
        }

        let label;
        if (this.props.noCaret) {
            label = props.label;
        } else {
            label = <span>{props.label}{' '}<span className="caret"></span></span>;
        }

        return (
            <div className="btn-group">
                <button type="button" className={className} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    {label}
                </button>
                <ul className="dropdown-menu">
                    {props.children}
                </ul>

            </div>
        );
    }
}

class DropdownMenuItem extends Component {
    static propTypes = {
        label: PropTypes.string,
        icon: PropTypes.string,
        className: PropTypes.string
    }

    render() {
        const props = this.props;

        let className = 'dropdown';
        if (props.className) {
            className = className + ' ' + props.className;
        }

        return (
            <li className={className}>
                {props.icon ?
                    <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                        <Icon icon={props.icon}/>{' '}{props.label}{' '}<span className="caret"></span>
                    </a>
                    :
                    <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                        {props.label}{' '}<span className="caret"></span>
                    </a>
                }
                <ul className="dropdown-menu">
                    {props.children}
                </ul>
            </li>
        );
    }
}

@withErrorHandling
class ActionLink extends Component {
    static propTypes = {
        onClickAsync: PropTypes.func,
        className: PropTypes.string
    }

    @withAsyncErrorHandler
    async onClick(evt) {
        if (this.props.onClickAsync) {
            evt.preventDefault();
            evt.stopPropagation();

            await this.props.onClickAsync(evt);
        }
    }

    render() {
        const props = this.props;

        return (
            <a href="" className={props.className} onClick={::this.onClick}>{props.children}</a>
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
            buttons: this.props.buttons || [ { label: t('close'), className: 'btn-default', onClickAsync: null } ]
        };
    }

    static propTypes = {
        title: PropTypes.string,
        onCloseAsync: PropTypes.func,
        onButtonClickAsync: PropTypes.func,
        buttons: PropTypes.array,
        hidden: PropTypes.bool,
        className: PropTypes.string
    }

    /*
      this.props.hidden - this is the desired state of the modal
      this.hidden - this is the actual state of the modal - this is because there is no public API on Bootstrap modal to know whether the modal is shown or not
     */

    componentDidMount() {
        const jqModal = jQuery(this.domModal);

        jqModal.on('shown.bs.modal', () => jqModal.focus());
        jqModal.on('hide.bs.modal', ::this.onHide);

        this.hidden = this.props.hidden;
        jqModal.modal({
            show: !this.props.hidden
        });
    }

    componentDidUpdate() {
        if (this.props.hidden != this.hidden) {
            const jqModal = jQuery(this.domModal);
            this.hidden = this.props.hidden;
            jqModal.modal(this.props.hidden ? 'hide' : 'show');
        }
    }

    componentWillUnmount() {
        // We discard the modal in a hard way (without hiding it). Thus we have to take care of the backgrop too.
        jQuery('.modal-backdrop').remove();
    }

    onHide(evt) {
        // Hide event is emited is both when hidden through user action or through API. We have to let the API
        // calls through, otherwise the modal would never hide. The user actions, which change the desired state,
        // are capture, converted to onClose callback and prevented. It's up to the parent to decide whether to
        // hide the modal or not.
        if (!this.props.hidden) {
            // noinspection JSIgnoredPromiseFromCall
            this.onClose();
            evt.preventDefault();
        }
    }

    @withAsyncErrorHandler
    async onClose() {
        if (this.props.onCloseAsync) {
            await this.props.onCloseAsync();
        }
    }

    async onButtonClick(idx) {
        const buttonSpec = this.state.buttons[idx];
        if (buttonSpec.onClickAsync) {
            await buttonSpec.onClickAsync(idx);
        }
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
            <div
                ref={(domElem) => { this.domModal = domElem; }}
                className={'modal fade' + (props.className ? ' ' + props.className : '')}
                tabIndex="-1" role="dialog" aria-labelledby="myModalLabel">

                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="close" aria-label={t('close')} onClick={::this.onClose}><span aria-hidden="true">&times;</span></button>
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
    DropdownMenu,
    DropdownMenuItem,
    ActionLink,
    DismissibleAlert,
    ModalDialog,
    Icon
};