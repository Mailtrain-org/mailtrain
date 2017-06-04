'use strict';

import React, { Component } from 'react';
import axios from 'axios';
import Immutable from 'immutable';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { Button } from './page.js';

const FormState = {
    Loading: 0,
    LoadingWithNotice: 1,
    Ready: 2
};


@translate()
class Form extends Component {
    static propTypes = {
        stateOwner: PropTypes.object.isRequired,
        onSubmit: PropTypes.func
    }

    static childContextTypes = {
        stateOwner: PropTypes.object
    }

    getChildContext() {
        return {
            stateOwner: this.props.stateOwner
        };
    }

    render() {
        const t = this.props.t;
        const owner = this.props.stateOwner;
        const props = this.props;

        if (!owner.isFormReady()) {
            if (owner.isFormWithLoadingNotice()) {
                return <div>{t('Loading ...')}</div>
            } else {
                return <div></div>;
            }
        } else {
            return (
                <form className="form-horizontal" onSubmit={props.onSubmit}>
                    {props.children}
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
            <input type="text" value={owner.getFormState(id)} placeholder={props.placeholder} id={htmlId} className="form-control" aria-describedby={htmlId + '_help'} onChange={owner.bindToFormState(id)}/>
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
            <textarea id={htmlId} value={owner.getFormState(id)} className="form-control" aria-describedby={htmlId + '_help'} onChange={owner.bindToFormState(id)}></textarea>
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




function withForm(target) {
    const inst = target.prototype;

    inst.initFormState = function() {
        const state = this.state || {};

        state.formState = Immutable.Map({
            _state: FormState.Loading,
            _isValidationShown: false
        });

        this.state = state;
    };

    inst.populateFormStateFromURL = function(url) {
        setTimeout(() => {
            this.setState(previousState => {
                if (previousState.formState.get('_state') === FormState.Loading) {
                    return {
                        formState: previousState.formState.set('_state', FormState.LoadingWithNotice)
                    };
                }
            });
        }, 500);

        axios.get(url).then(response => {
            this.populateFormState(response.data);
        });
    };

    inst.populateFormState = function(data) {
        this.setState(previousState => ({
            formState: previousState.formState.withMutations(state => {
                state.set('_state', FormState.Ready);

                for (const key in data) {
                    state.set(key, Immutable.Map({
                        value: data[key]
                    }));
                }

                this.validateFormState(state);
            })
        }));
    };

    inst.updateFormState = function(key, value) {
        this.setState(previousState => ({
            formState: previousState.formState.withMutations(state => {
                state.setIn([key, 'value'], value);
                this.validateFormState(state);
            })
        }));
    };

    inst.bindToFormState = function(name) {
        return evt => this.updateFormState(name, evt.target.value);
    };

    inst.getFormState = function(name) {
        return this.state.formState.getIn([name, 'value']);
    };

    inst.getFormError = function(name) {
        return this.state.formState.getIn([name, 'error']);
    };

    inst.isFormWithLoadingNotice = function() {
        return this.state.formState.get('_state') === FormState.LoadingWithNotice;
    };

    inst.isFormReady = function() {
        return this.state.formState.get('_state') === FormState.Ready;
    };

    inst.isFormValidationShown = function() {
        return this.state.formState.get('_isValidationShown');
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
        this.setState(previousState => ({formState: previousState.formState.set('_isValidationShown', true)}));
    };

    inst.hideFormValidation = function() {
        this.setState(previousState => ({formState: previousState.formState.set('_isValidationShown', false)}));
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
