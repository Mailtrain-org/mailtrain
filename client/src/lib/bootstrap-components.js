'use strict';

import React, {Component} from 'react';
import {withTranslation} from './i18n';
import PropTypes
    from 'prop-types';
import {
    withAsyncErrorHandler,
    withErrorHandling
} from './error-handling';
import {withComponentMixins} from "./decorator-helpers";

@withComponentMixins([
    withTranslation,
    withErrorHandling
])
export class DismissibleAlert extends Component {
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

export class Icon extends Component {
    static propTypes = {
        icon: PropTypes.string.isRequired,
        family: PropTypes.string,
        title: PropTypes.string,
        className: PropTypes.string
    }

    static defaultProps = {
        family: 'fas'
    }

    render() {
        const props = this.props;

        if (props.family === 'fas' || props.family === 'far') {
            return <i className={`${props.family} fa-${props.icon} ${props.className || ''}`} title={props.title}></i>;
        } else {
            console.error(`Icon font family ${props.family} not supported. (icon: ${props.icon}, title: ${props.title})`)
            return null;
        }
    }
}

@withComponentMixins([
    withErrorHandling
])
export class Button extends Component {
    static propTypes = {
        onClickAsync: PropTypes.func,
        label: PropTypes.string,
        icon: PropTypes.string,
        iconTitle: PropTypes.string,
        className: PropTypes.string,
        title: PropTypes.string,
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
            icon = <Icon icon={props.icon} title={props.iconTitle}/>
        }

        let iconSpacer;
        if (props.icon && props.label) {
            iconSpacer = ' ';
        }

        return (
            <button type={type} className={className} onClick={::this.onClick} title={this.props.title}>{icon}{iconSpacer}{props.label}</button>
        );
    }
}

export class ButtonDropdown extends Component {
    static propTypes = {
        label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        className: PropTypes.string,
        buttonClassName: PropTypes.string,
        menuClassName: PropTypes.string
    }

    render() {
        const props = this.props;

        const className = 'dropdown' + (props.className ? ' ' + props.className : '');
        const buttonClassName = 'btn dropdown-toggle' + (props.buttonClassName ? ' ' + props.buttonClassName : '');
        const menuClassName = 'dropdown-menu' + (props.menuClassName ? ' ' + props.menuClassName : '');

        return (
            <div className="dropdown" className={className}>
                <button type="button" className={buttonClassName} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    {props.label}
                </button>
                <ul className={menuClassName}>
                    {props.children}
                </ul>

            </div>
        );
    }
}

@withComponentMixins([
    withErrorHandling
])
export class ActionLink extends Component {
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


export class DropdownActionLink extends Component {
    static propTypes = {
        onClickAsync: PropTypes.func,
        className: PropTypes.string,
        disabled: PropTypes.bool
    }

    render() {
        const props = this.props;

        let clsName = "dropdown-item ";
        if (props.disabled) {
            clsName += "disabled ";
        }

        clsName += props.className;

        return (
            <ActionLink className={clsName} onClickAsync={props.onClickAsync}>{props.children}</ActionLink>
        );
    }
}


export class DropdownDivider extends Component {
    static propTypes = {
        className: PropTypes.string
    }

    render() {
        const props = this.props;

        let className = 'dropdown-divider';
        if (props.className) {
            className = className + ' ' + props.className;
        }

        return (
            <div className={className}/>
        );
    }
}


@withComponentMixins([
    withTranslation,
    withErrorHandling
])
export class ModalDialog extends Component {
    constructor(props) {
        super(props);

        const t = props.t;

        this.state = {
            buttons: this.props.buttons || [ { label: t('close'), className: 'btn-secondary', onClickAsync: null } ]
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
                            <h4 className="modal-title">{this.props.title}</h4>
                            <button type="button" className="close" aria-label={t('close')} onClick={::this.onClose}><span aria-hidden="true">&times;</span></button>
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

