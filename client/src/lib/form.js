'use strict';

import React, { Component } from 'react';
import axios from './axios';
import Immutable from 'immutable';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import interoperableErrors from '../../../shared/interoperable-errors';
import { withSectionHelpers } from './page'
import { withErrorHandling, withAsyncErrorHandler } from './error-handling';
import { TreeTable } from './tree';

const FormState = {
    Loading: 0,
    LoadingWithNotice: 1,
    Ready: 2
};


@translate()
@withSectionHelpers
@withErrorHandling
class Form extends Component {
    static propTypes = {
        stateOwner: PropTypes.object.isRequired,
        onSubmitAsync: PropTypes.func
    }

    static childContextTypes = {
        formStateOwner: PropTypes.object
    }

    getChildContext() {
        return {
            formStateOwner: this.props.stateOwner
        };
    }

    @withAsyncErrorHandler
    async onSubmit(evt) {
        const t = this.props.t;

        try {
            evt.preventDefault();

            if (this.props.onSubmitAsync) {
                this.props.stateOwner.disableForm();
                this.props.stateOwner.setFormStatusMessage('info', t('Submitting...'));

                await this.props.onSubmitAsync(evt);

                this.props.stateOwner.setFormStatusMessage();
                this.props.stateOwner.enableForm();
            }
        } catch (error) {
            if (error instanceof interoperableErrors.ChangedError) {
                this.props.stateOwner.disableForm();
                this.props.stateOwner.setFormStatusMessage('danger',
                    <span>
                        <strong>{t('Your updates cannot be saved.')}</strong>{' '}
                        {t('Someone else has introduced modification in the meantime. Refresh your page to start anew with fresh data. Please note that your changes will be lost.')}
                    </span>
                );
                return;
            }

            throw error;
        }
    }

    render() {
        const t = this.props.t;
        const owner = this.props.stateOwner;
        const props = this.props;
        const statusMessageText = owner.getFormStatusMessageText();
        const statusMessageSeverity = owner.getFormStatusMessageSeverity();

        if (!owner.isFormReady()) {
            if (owner.isFormWithLoadingNotice()) {
                return <p className={`alert alert-info mt-form-status`} role="alert">{t('Loading ...')}</p>
            } else {
                return <div></div>;
            }
        } else {
            return (
                <form className="form-horizontal" onSubmit={::this.onSubmit}>
                    <fieldset disabled={owner.isFormDisabled()}>
                        {props.children}
                    </fieldset>
                    {statusMessageText && <p className={`col-sm-10 col-sm-offset-2 alert alert-${statusMessageSeverity} mt-form-status`} role="alert">{statusMessageText}</p>}
                </form>
            );
        }
    }
}

function wrapInput(id, htmlId, owner, label, input) {
    return (
        <div className={owner.addFormValidationClass('form-group', id)} >
            <div className="col-sm-2">
                <label htmlFor={htmlId} className="control-label">{label}</label>
            </div>
            <div className="col-sm-10">
                {input}
            </div>
            <div className="help-block col-sm-offset-2 col-sm-10" id={htmlId + '_help'}>{owner.getFormValidationMessage(id)}</div>
        </div>
    );
}

class InputField extends Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        placeholder: PropTypes.string
    }

    static contextTypes = {
        formStateOwner: PropTypes.object.isRequired
    }

    render() {
        const props = this.props;
        const owner = this.context.formStateOwner;
        const id = this.props.id;
        const htmlId = 'form_' + id;

        return wrapInput(id, htmlId, owner, props.label,
            <input type="text" value={owner.getFormValue(id)} placeholder={props.placeholder} id={htmlId} className="form-control" aria-describedby={htmlId + '_help'} onChange={owner.bindChangeEventToFormValue(id)}/>
        );
    }
}

class TextArea extends Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        placeholder: PropTypes.string
    }

    static contextTypes = {
        formStateOwner: PropTypes.object.isRequired
    }

    render() {
        const props = this.props;
        const owner = this.context.formStateOwner;
        const id = this.props.id;
        const htmlId = 'form_' + id;

        return wrapInput(id, htmlId, owner, props.label,
            <textarea id={htmlId} value={owner.getFormValue(id)} className="form-control" aria-describedby={htmlId + '_help'} onChange={owner.bindChangeEventToFormValue(id)}></textarea>
        );
    }
}

class ButtonRow extends Component {
    render() {
        return (
            <div className="form-group">
                <div className="col-sm-10 col-sm-offset-2 mt-button-row">
                    {this.props.children}
                </div>
            </div>
        );
    }
}

@withErrorHandling
class Button extends Component {
    static propTypes = {
        onClickAsync: PropTypes.func,
        onClick: PropTypes.func,
        label: PropTypes.string,
        icon: PropTypes.string,
        className: PropTypes.string,
        type: PropTypes.string
    }

    static contextTypes = {
        formStateOwner: PropTypes.object.isRequired
    }

    @withAsyncErrorHandler
    async onClick(evt) {
        if (this.props.onClick) {
            evt.preventDefault();

            onClick(evt);

        } else if (this.props.onClickAsync) {
            evt.preventDefault();

            this.context.formStateOwner.disableForm();
            await this.props.onClickAsync(evt);
            this.context.formStateOwner.enableForm();
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
            icon = <span className={'glyphicon glyphicon-' + props.icon}></span>
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

class TreeTableSelect extends Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        dataUrl: PropTypes.string.isRequired
    }

    static contextTypes = {
        formStateOwner: PropTypes.object.isRequired
    }

    async onSelectionChangedAsync(sel) {
        const owner = this.context.formStateOwner;
        owner.updateFormValue(this.props.id, sel);
    }

    render() {
        const props = this.props;
        const owner = this.context.formStateOwner;
        const id = this.props.id;
        const htmlId = 'form_' + id;

        return (
            <div className={owner.addFormValidationClass('form-group', id)} >
                <div className="col-sm-2">
                    <label htmlFor={htmlId} className="control-label">{props.label}</label>
                </div>
                <div className="col-sm-10">
                    <TreeTable dataUrl={this.props.dataUrl} selectMode={TreeTable.SelectMode.SINGLE} selection={owner.getFormValue(id)} onSelectionChangedAsync={::this.onSelectionChangedAsync}/>
                </div>
                <div className="help-block col-sm-offset-2 col-sm-10" id={htmlId + '_help'}>{owner.getFormValidationMessage(id)}</div>
            </div>
        );
    }
}

function withForm(target) {
    const inst = target.prototype;

    const cleanFormState = Immutable.Map({
        state: FormState.Loading,
        isValidationShown: false,
        isDisabled: false,
        statusMessageText: '',
        data: Immutable.Map()
    });

    inst.initFormState = function() {
        const state = this.state || {};
        state.formState = cleanFormState;
        this.state = state;
    };

    inst.resetFormState = function() {
        this.setState({
            formState: cleanFormState
        });
    };

    inst.populateFormValuesFromURL = function(url) {
        setTimeout(() => {
            this.setState(previousState => {
                if (previousState.formState.get('state') === FormState.Loading) {
                    return {
                        formState: previousState.formState.set('state', FormState.LoadingWithNotice)
                    };
                }
            });
        }, 500);

        axios.get(url).then(response => {
            const data = response.data;

            data.originalHash = data.hash;
            delete data.hash;

            this.populateFormValues(data);
        });
    };

    inst.populateFormValues = function(data) {
        this.setState(previousState => ({
            formState: previousState.formState.withMutations(state => {
                state.set('state', FormState.Ready);

                state.update('data', stateData => stateData.withMutations(mutableStateData => {
                    for (const key in data) {
                        mutableStateData.set(key, Immutable.Map({
                            value: data[key]
                        }));
                    }

                    this.validateFormValues(mutableStateData);
                }));
            })
        }));
    };

    inst.updateFormValue = function(key, value) {
        this.setState(previousState => ({
            formState: previousState.formState.update('data', stateData => stateData.withMutations(mutableStateData => {
                mutableStateData.setIn([key, 'value'], value);
                this.validateFormValues(mutableStateData);
            }))
        }));
    };

    inst.bindChangeEventToFormValue = function(name) {
        return evt => this.updateFormValue(name, evt.target.value);
    };

    inst.getFormValue = function(name) {
        return this.state.formState.getIn(['data', name, 'value']);
    };

    inst.getFormValues = function(name) {
        return this.state.formState.get('data').map(attr => attr.get('value')).toJS();
    };

    inst.getFormError = function(name) {
        return this.state.formState.getIn(['data', name, 'error']);
    };

    inst.isFormWithLoadingNotice = function() {
        return this.state.formState.get('state') === FormState.LoadingWithNotice;
    };

    inst.isFormLoading = function() {
        return this.state.formState.get('state') === FormState.Loading || this.state.formState.get('state') === FormState.LoadingWithNotice;
    };

    inst.isFormReady = function() {
        return this.state.formState.get('state') === FormState.Ready;
    };

    inst.isFormValidationShown = function() {
        return this.state.formState.get('isValidationShown');
    };

    inst.addFormValidationClass = function(className, name) {
        if (this.isFormValidationShown()) {
            const error = this.getFormError(name);
            if (error) {
                return className + ' has-error';
            } else {
                return className + ' has-success';
            }
        } else {
            return className;
        }
    };

    inst.getFormValidationMessage = function(name) {
        if (this.isFormValidationShown()) {
            return this.getFormError(name);
        } else {
            return '';
        }
    };

    inst.showFormValidation = function() {
        this.setState(previousState => ({formState: previousState.formState.set('isValidationShown', true)}));
    };

    inst.hideFormValidation = function() {
        this.setState(previousState => ({formState: previousState.formState.set('isValidationShown', false)}));
    };

    inst.isFormWithoutErrors = function() {
        return !this.state.formState.get('data').find(attr => attr.get('error'));
    };

    inst.getFormStatusMessageText = function() {
        return this.state.formState.get('statusMessageText');
    };

    inst.getFormStatusMessageSeverity = function() {
        return this.state.formState.get('statusMessageSeverity');
    };

    inst.setFormStatusMessage = function(severity, text) {
        this.setState(previousState => ({
            formState: previousState.formState.withMutations(map => {
                map.set('statusMessageText', text);
                map.set('statusMessageSeverity', severity);
            })
        }));
    };

    inst.enableForm = function() {
        this.setState(previousState => ({formState: previousState.formState.set('isDisabled', false)}));
    };

    inst.disableForm = function() {
        this.setState(previousState => ({formState: previousState.formState.set('isDisabled', true)}));
    };

    inst.isFormDisabled = function() {
        return this.state.formState.get('isDisabled');
    };

    return target;
}


export {
    withForm,
    Form,
    InputField,
    TextArea,
    ButtonRow,
    Button,
    TreeTableSelect
}
