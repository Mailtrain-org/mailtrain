'use strict';

import React, { Component } from 'react';
import axios from 'axios';
import Immutable from 'immutable';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';

const FormState = {
    Loading: 0,
    LoadingWithNotice: 1,
    Ready: 2
};

@translate()
class Form extends Component {
    static propTypes = {
        stateOwner: PropTypes.object.isRequired,
        onSubmitAsync: PropTypes.func
    }

    static childContextTypes = {
        stateOwner: PropTypes.object
    }

    getChildContext() {
        return {
            stateOwner: this.props.stateOwner
        };
    }

    async onSubmit(evt) {
        evt.preventDefault();

        const t = this.props.t;

        if (this.props.onSubmitAsync) {
            this.props.stateOwner.disableForm();
            this.props.stateOwner.setFormStatusMessage(t('Submitting...'));

            await this.props.onSubmitAsync(evt);

            this.props.stateOwner.setFormStatusMessage();
            this.props.stateOwner.enableForm();
        }
    }

    render() {
        const t = this.props.t;
        const owner = this.props.stateOwner;
        const props = this.props;
        const statusMessage = owner.getFormStatusMessage();

        if (!owner.isFormReady()) {
            if (owner.isFormWithLoadingNotice()) {
                return <div>{t('Loading ...')}</div>
            } else {
                return <div></div>;
            }
        } else {
            return (
                <form className="form-horizontal" onSubmit={::this.onSubmit}>
                    <fieldset disabled={owner.isFormDisabled()}>
                        {props.children}
                    </fieldset>
                    {statusMessage && <p className="col-sm-10 col-sm-offset-2 alert alert-info mt-form-status" role="alert">{owner.getFormStatusMessage()}</p>}
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
        stateOwner: PropTypes.object.isRequired
    }

    render() {
        const props = this.props;
        const owner = this.context.stateOwner;
        const id = this.props.id;
        const htmlId = 'form_' + id;

        return wrapInput(id, htmlId, owner, props.label,
            <input type="text" value={owner.getFormValue(id)} placeholder={props.placeholder} id={htmlId} className="form-control" aria-describedby={htmlId + '_help'} onChange={owner.bindToFormValue(id)}/>
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
        stateOwner: PropTypes.object.isRequired
    }

    render() {
        const props = this.props;
        const owner = this.context.stateOwner;
        const id = this.props.id;
        const htmlId = 'form_' + id;

        return wrapInput(id, htmlId, owner, props.label,
            <textarea id={htmlId} value={owner.getFormValue(id)} className="form-control" aria-describedby={htmlId + '_help'} onChange={owner.bindToFormValue(id)}></textarea>
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
        stateOwner: PropTypes.object.isRequired
    }

    async onClick(evt) {
        if (this.props.onClick) {
            evt.preventDefault();

            onClick(evt);

        } else if (this.props.onClickAsync) {
            evt.preventDefault();

            this.context.stateOwner.disableForm();
            await this.props.onClickAsync(evt);
            this.context.stateOwner.enableForm();
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

function withForm(target) {
    const inst = target.prototype;

    inst.initFormState = function() {
        const state = this.state || {};

        state.formState = Immutable.Map({
            state: FormState.Loading,
            isValidationShown: false,
            isDisabled: false,
            statusMessage: '',
            data: Immutable.Map()
        });

        this.state = state;
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
            this.populateFormValues(response.data);
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

    inst.bindToFormValue = function(name) {
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

    inst.getFormStatusMessage = function() {
        return this.state.formState.get('statusMessage');
    };

    inst.setFormStatusMessage = function(message) {
        this.setState(previousState => ({formState: previousState.formState.set('statusMessage', message)}));
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

}


export {
    withForm,
    Form,
    InputField,
    TextArea,
    ButtonRow,
    Button
}
