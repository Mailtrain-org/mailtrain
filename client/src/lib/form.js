'use strict';

import React, { Component } from 'react';
import axios from './axios';
import Immutable from 'immutable';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import interoperableErrors from '../../../shared/interoperable-errors';
import { withPageHelpers } from './page'
import { withErrorHandling, withAsyncErrorHandler } from './error-handling';
import { TreeTable, TreeSelectMode } from './tree';
import { Table, TableSelectMode } from './table';
import { Button as ActionButton } from "./bootstrap-components";

import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/javascript';
import 'brace/mode/json';
import 'brace/mode/handlebars';
import 'brace/theme/github';

const FormState = {
    Loading: 0,
    LoadingWithNotice: 1,
    Ready: 2
};

const FormSendMethod = {
    PUT: 0,
    POST: 1
};

@translate()
@withPageHelpers
@withErrorHandling
class Form extends Component {
    static propTypes = {
        stateOwner: PropTypes.object.isRequired,
        onSubmitAsync: PropTypes.func,
        format: PropTypes.string
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

        const owner = this.props.stateOwner;
        
        evt.preventDefault();

        if (this.props.onSubmitAsync) {
            await owner.formHandleChangedError(async () => await this.props.onSubmitAsync(evt));
        }
    }

    render() {
        const t = this.props.t;
        const owner = this.props.stateOwner;
        const props = this.props;
        const statusMessageText = owner.getFormStatusMessageText();
        const statusMessageSeverity = owner.getFormStatusMessageSeverity();

        let formClass = 'form-horizontal';
        if (props.format === 'wide') {
            formClass = '';
        } else if (props.format === 'inline') {
            formClass = 'form-inline';
        }

        if (!owner.isFormReady()) {
            if (owner.isFormWithLoadingNotice()) {
                return <p className={`alert alert-info mt-form-status`} role="alert">{t('Loading ...')}</p>
            } else {
                return <div></div>;
            }
        } else {
            return (
                <form className={formClass} onSubmit={::this.onSubmit}>
                    <fieldset disabled={owner.isFormDisabled()}>
                        {props.children}
                    </fieldset>
                    {statusMessageText &&
                        <AlignedRow htmlId="form-status-message">
                            <p className={`alert alert-${statusMessageSeverity} mt-form-status`} role="alert">{statusMessageText}</p>
                        </AlignedRow>
                    }
                </form>
            );
        }
    }
}

class Fieldset extends Component {
    static propTypes = {
        label: PropTypes.string
    }

    render() {
        const props = this.props;

        return (
            <fieldset>
                {props.label ? <legend>{props.label}</legend> : null}
                {props.children}
            </fieldset>
            );
    }
}

function wrapInput(id, htmlId, owner, format, rightContainerClass, label, help, input) {
    const className = id ? owner.addFormValidationClass('form-group', id) : 'form-group';

    let colLeft = '';
    let colRight = '';
    let offsetRight = '';

    switch (format) {
        case 'wide':
            colLeft = '';
            colRight = '';
            offsetRight = '';
            break;
        default:
            colLeft = 'col-sm-2';
            colRight = 'col-sm-10';
            offsetRight = 'col-sm-offset-2';
            break;
    }

    if (format === 'inline') {
    }

    let helpBlock = null;
    if (help) {
        helpBlock = <div className={`help-block ${colRight} ${offsetRight}`} id={htmlId + '_help'}>{help}</div>;
    }

    let validationBlock = null;
    if (id) {
        const validationMsg = id && owner.getFormValidationMessage(id);
        if (validationMsg) {
            validationBlock = <div className={`help-block ${colRight} ${offsetRight}`} id={htmlId + '_help_validation'}>{validationMsg}</div>;
        }
    }

    let labelBlock = null;
    if (label) {
        labelBlock = <label htmlFor={htmlId} className="control-label">{label}</label>;
    }

    if (format === 'inline') {
        return (
            <div className={className} >
                {labelBlock} &nbsp; {input}
                {helpBlock}
                {validationBlock}
            </div>
        );
    } else {
        return (
            <div className={className} >
                <div className={colLeft}>
                    {labelBlock}
                </div>
                <div className={`${colRight} ${rightContainerClass}`}>
                    {input}
                </div>
                {helpBlock}
                {validationBlock}
            </div>
        );
    }
}

class StaticField extends Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        help: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        className: PropTypes.string,
        format: PropTypes.string
    }

    render() {
        const props = this.props;
        const owner = this.context.formStateOwner;
        const id = this.props.id;
        const htmlId = 'form_' + id;

        let className = 'form-control';
        if (props.className) {
            className += ' ' + props.className;
        }

        return wrapInput(null, htmlId, owner, props.format, '', props.label, props.help,
            <div id={htmlId} className={className} aria-describedby={htmlId + '_help'}>{props.children}</div>
        );
    }
}

class InputField extends Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        placeholder: PropTypes.string,
        type: PropTypes.string,
        help: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        format: PropTypes.string
    }

    static defaultProps = {
        type: 'text'
    }

    static contextTypes = {
        formStateOwner: PropTypes.object.isRequired
    }

    render() {
        const props = this.props;
        const owner = this.context.formStateOwner;
        const id = this.props.id;
        const htmlId = 'form_' + id;

        let type = 'text';
        if (props.type === 'password') {
            type = 'password';
        }

        return wrapInput(id, htmlId, owner, props.format, '', props.label, props.help,
            <input type={type} value={owner.getFormValue(id)} placeholder={props.placeholder} id={htmlId} className="form-control" aria-describedby={htmlId + '_help'} onChange={evt => owner.updateFormValue(id, evt.target.value)}/>
        );
    }
}

class CheckBox extends Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
        label: PropTypes.string,
        help: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        format: PropTypes.string
    }

    static contextTypes = {
        formStateOwner: PropTypes.object.isRequired
    }

    render() {
        const props = this.props;
        const owner = this.context.formStateOwner;
        const id = this.props.id;
        const htmlId = 'form_' + id;

        return wrapInput(id, htmlId, owner, props.format, 'checkbox', props.label, props.help,
            <label>
                <input type="checkbox" checked={owner.getFormValue(id)} id={htmlId} aria-describedby={htmlId + '_help'} onChange={evt => owner.updateFormValue(id, !owner.getFormValue(id))}/>
                {props.text}
            </label>
        );
    }
}

class TextArea extends Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        help: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        format: PropTypes.string
    }

    static contextTypes = {
        formStateOwner: PropTypes.object.isRequired
    }

    render() {
        const props = this.props;
        const owner = this.context.formStateOwner;
        const id = this.props.id;
        const htmlId = 'form_' + id;

        return wrapInput(id, htmlId, owner, props.format, '', props.label, props.help,
            <textarea id={htmlId} value={owner.getFormValue(id)} className="form-control" aria-describedby={htmlId + '_help'} onChange={evt => owner.updateFormValue(id, evt.target.value)}></textarea>
        );
    }
}

class Dropdown extends Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        help: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        options: PropTypes.array,
        optGroups: PropTypes.array,
        className: PropTypes.string,
        format: PropTypes.string
    }

    static contextTypes = {
        formStateOwner: PropTypes.object.isRequired
    }

    render() {
        const props = this.props;

        const owner = this.context.formStateOwner;
        const id = this.props.id;
        const htmlId = 'form_' + id;
        let options = [];

        if (this.props.options) {
            options = props.options.map(option => <option key={option.key} value={option.key}>{option.label}</option>);
        } else if (this.props.optGroups) {
            options = props.optGroups.map(optGroup =>
                <optgroup key={optGroup.key} label={optGroup.label}>
                    {optGroup.options.map(option => <option key={option.key} value={option.key}>{option.label}</option>)}
                </optgroup>
            );
        }

        let className = 'form-control';
        if (props.className) {
            className += ' ' + props.className;
        }

        return wrapInput(id, htmlId, owner, props.format, '', props.label, props.help,
            <select id={htmlId} className={className} aria-describedby={htmlId + '_help'} value={owner.getFormValue(id)} onChange={evt => owner.updateFormValue(id, evt.target.value)}>
                {options}
            </select>
        );
    }
}


class AlignedRow extends Component {
    static propTypes = {
        className: PropTypes.string,
        label: PropTypes.string,
        htmlId: PropTypes.string,
        format: PropTypes.string
    }

    static contextTypes = {
        formStateOwner: PropTypes.object.isRequired
    }

    static defaultProps = {
        className: ''
    }

    render() {
        const props = this.props;
        const owner = this.context.formStateOwner;

        return wrapInput(null, props.htmlId, owner, props.format, props.className, props.label, null, this.props.children);
    }
}


class ButtonRow extends Component {
    static propTypes = {
        className: PropTypes.string,
        format: PropTypes.string
    }

    render() {
        let className = 'mt-button-row';
        if (this.props.className) {
            className += ' ' + this.props.className;
        }

        return (
            <AlignedRow className={className} format={this.props.format}>{this.props.children}</AlignedRow>
        );
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

    static contextTypes = {
        formStateOwner: PropTypes.object.isRequired
    }

    @withAsyncErrorHandler
    async onClick(evt) {
        if (this.props.onClickAsync) {
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
        dataUrl: PropTypes.string,
        data: PropTypes.array,
        help: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        format: PropTypes.string
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

        return wrapInput(id, htmlId, owner, props.format, '', props.label, props.help,
            <TreeTable data={props.data} dataUrl={props.dataUrl} selectMode={TreeSelectMode.SINGLE} selection={owner.getFormValue(id)} onSelectionChangedAsync={::this.onSelectionChangedAsync}/>
        );
    }
}

@translate(null, { withRef: true })
class TableSelect extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedLabel: '',
            open: false
        };
    }

    static propTypes = {
        dataUrl: PropTypes.string,
        data: PropTypes.array,
        columns: PropTypes.array,
        selectionKeyIndex: PropTypes.number,
        selectionLabelIndex: PropTypes.number,
        selectionAsArray: PropTypes.bool,
        selectMode: PropTypes.number,
        withHeader: PropTypes.bool,
        dropdown: PropTypes.bool,

        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        help: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        format: PropTypes.string
    }

    static defaultProps = {
        selectMode: TableSelectMode.SINGLE,
        selectionLabelIndex: 0
    }

    static contextTypes = {
        formStateOwner: PropTypes.object.isRequired
    }

    async onSelectionChangedAsync(sel, data) {
        if (this.props.selectMode === TableSelectMode.SINGLE && this.props.dropdown) {
            this.setState({
                open: false
            });
        }

        const owner = this.context.formStateOwner;
        owner.updateFormValue(this.props.id, sel);
    }

    async onSelectionDataAsync(sel, data) {
        if (this.props.dropdown) {
            let label;

            if (!data) {
                label = '';
            } else if (this.props.selectMode === TableSelectMode.SINGLE && !this.props.selectionAsArray) {
                label = data[this.props.selectionLabelIndex];
            } else {
                label = data.map(entry => entry[this.props.selectionLabelIndex]).join('; ');
            }

            this.setState({
                selectedLabel: label
            });
        }
    }

    async toggleOpen() {
        this.setState({
            open: !this.state.open
        });
    }

    refresh() {
        this.table.refresh();
    }

    render() {
        const props = this.props;
        const owner = this.context.formStateOwner;
        const id = this.props.id;
        const htmlId = 'form_' + id;
        const t = props.t;

        if (props.dropdown) {
            return wrapInput(id, htmlId, owner, props.format, '', props.label, props.help,
                <div>
                    <div className="input-group mt-tableselect-dropdown">
                        <input type="text" className="form-control" value={this.state.selectedLabel} readOnly onClick={::this.toggleOpen}/>
                        <span className="input-group-btn">
                            <ActionButton label={t('Select')} className="btn-default" onClickAsync={::this.toggleOpen}/>
                        </span>
                    </div>
                    <div className={'mt-tableselect-table' + (this.state.open ? '' : ' mt-tableselect-table-hidden')}>
                        <Table ref={node => this.table = node} data={props.data} dataUrl={props.dataUrl} columns={props.columns} selectMode={props.selectMode} selectionAsArray={this.props.selectionAsArray} withHeader={props.withHeader} selection={owner.getFormValue(id)} onSelectionDataAsync={::this.onSelectionDataAsync} onSelectionChangedAsync={::this.onSelectionChangedAsync}/>
                    </div>
                </div>
            );
        } else {
            return wrapInput(id, htmlId, owner, props.format, '', props.label, props.help,
                <div>
                    <div>
                        <Table ref={node => this.table = node} data={props.data} dataUrl={props.dataUrl} columns={props.columns} selectMode={props.selectMode} selectionAsArray={this.props.selectionAsArray} withHeader={props.withHeader} selection={owner.getFormValue(id)} onSelectionChangedAsync={::this.onSelectionChangedAsync}/>
                    </div>
                </div>
            );
        }
    }
}

/*
 Refreshes the table. This method is provided to allow programmatic refresh from a handler outside the table.
 The reference to the table can be obtained by ref.
 */
TableSelect.prototype.refresh = function() {
    this.getWrappedInstance().refresh()
};


class ACEEditor extends Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        label: PropTypes.string,
        help: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        height: PropTypes.string,
        mode: PropTypes.string,
        format: PropTypes.string
    }

    static contextTypes = {
        formStateOwner: PropTypes.object.isRequired
    }

    render() {
        const props = this.props;
        const owner = this.context.formStateOwner;
        const id = this.props.id;
        const htmlId = 'form_' + id;

        return wrapInput(id, htmlId, owner, props.format, '', props.label, props.help,
            <AceEditor
                id={htmlId}
                mode={props.mode}
                theme="github"
                onChange={data => owner.updateFormValue(id, data)}
                fontSize={12}
                width="100%"
                height={props.height}
                showPrintMargin={false}
                value={owner.getFormValue(id)}
                tabSize={2}
                setOptions={{useWorker: false}} // This disables syntax check because it does not always work well (e.g. in case of JS code in report templates)
            />
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
        data: Immutable.Map(),
        isServerValidationRunning: false
    });

    // formValidateResolve is called by "validateForm" once client receives validation response from server that does not
    // trigger another server validation
    let formValidateResolve = null;

    function scheduleValidateForm(self) {
        setTimeout(() => {
            self.setState(previousState => ({
                formState: previousState.formState.withMutations(mutState => {
                    validateFormState(self, mutState);
                })
            }));
        }, 0);
    }

    function validateFormState(self, mutState) {
        const settings = self.state.formSettings;

        if (!mutState.get('isServerValidationRunning') && settings.serverValidation) {
            const payload = {};
            let payloadNotEmpty = false;

            for (const attr of settings.serverValidation.extra || []) {
                payload[attr] = mutState.getIn(['data', attr, 'value']);
            }

            for (const attr of settings.serverValidation.changed) {
                const currValue = mutState.getIn(['data', attr, 'value']);
                const serverValue = mutState.getIn(['data', attr, 'serverValue']);

                // This really assumes that all form values are preinitialized (i.e. not undef)
                if (currValue !== serverValue) {
                    mutState.setIn(['data', attr, 'serverValidated'], false);
                    payload[attr] = currValue;
                    payloadNotEmpty = true;
                }
            }

            if (payloadNotEmpty) {
                mutState.set('isServerValidationRunning', true);

                axios.post(settings.serverValidation.url, payload)
                    .then(response => {

                        self.setState(previousState => ({
                            formState: previousState.formState.withMutations(mutState => {
                                mutState.set('isServerValidationRunning', false);

                                mutState.update('data', stateData => stateData.withMutations(mutStateData => {
                                    for (const attr in payload) {
                                        mutStateData.setIn([attr, 'serverValue'], payload[attr]);

                                        if (payload[attr] === mutState.getIn(['data', attr, 'value'])) {
                                            mutStateData.setIn([attr, 'serverValidated'], true);
                                            mutStateData.setIn([attr, 'serverValidation'], response.data[attr] || true);
                                        }
                                    }
                                }));
                            })
                        }));

                        scheduleValidateForm(self);
                    })
                    .catch(error => {
                        console.log('Error in "validateFormState": ' + error);

                        self.setState(previousState => ({
                            formState: previousState.formState.set('isServerValidationRunning', false)
                        }));

                        // TODO: It might be good not to give up immediatelly, but retry a couple of times
                        // scheduleValidateForm(self);
                    });
            } else {
                if (formValidateResolve) {
                    const resolve = formValidateResolve;
                    formValidateResolve = null;
                    resolve();
                }
            }
        }

        if (self.localValidateFormValues) {
            mutState.update('data', stateData => stateData.withMutations(mutStateData => {
                self.localValidateFormValues(mutStateData);
            }));
        }
    }

    inst.initForm = function(settings) {
        const state = this.state || {};
        state.formState = cleanFormState;
        state.formSettings = settings || {};
        this.state = state;
    };

    inst.resetFormState = function() {
        this.setState({
            formState: cleanFormState
        });
    };

    inst.getFormValuesFromEntity = function(entity, mutator) {
        const data = Object.assign({}, entity);

        data.originalHash = data.hash;
        delete data.hash;

        if (mutator) {
            mutator(data);
        }

        this.populateFormValues(data);
    };

    inst.getFormValuesFromURL = async function(url, mutator) {
        setTimeout(() => {
            this.setState(previousState => {
                if (previousState.formState.get('state') === FormState.Loading) {
                    return {
                        formState: previousState.formState.set('state', FormState.LoadingWithNotice)
                    };
                }
            });
        }, 500);

        const response = await axios.get(url);

        const data = response.data;

        data.originalHash = data.hash;
        delete data.hash;

        if (mutator) {
            mutator(data);
        }

        this.populateFormValues(data);
    };

    inst.validateAndSendFormValuesToURL = async function(method, url, mutator) {
        await this.waitForFormServerValidated();

        if (this.isFormWithoutErrors()) {
            const data = this.getFormValues();

            if (mutator) {
                mutator(data);
            }

            let response;
            if (method === FormSendMethod.PUT) {
                response = await axios.put(url, data);
            } else if (method === FormSendMethod.POST) {
                response = await axios.post(url, data);
            }

            return response.data || true;

        } else {
            this.showFormValidation();
            return false;
        }
    };


    inst.populateFormValues = function(data) {
        this.setState(previousState => ({
            formState: previousState.formState.withMutations(mutState => {
                mutState.set('state', FormState.Ready);

                mutState.update('data', stateData => stateData.withMutations(mutStateData => {
                    for (const key in data) {
                        mutStateData.set(key, Immutable.Map({
                            value: data[key]
                        }));
                    }
                }));

                validateFormState(this, mutState);
            })
        }));
    };

    inst.waitForFormServerValidated = async function() {
        if (!this.isFormServerValidated()) {
            await new Promise(resolve => { formValidateResolve = resolve; });
        }
    };

    inst.scheduleFormRevalidate = function() {
        scheduleValidateForm(this);
    };

    inst.updateFormValue = function(key, value) {
        this.setState(previousState => {
            const oldValue = previousState.formState.getIn(['data', key, 'value']);

            let newState = {
                formState: previousState.formState.withMutations(mutState => {
                    mutState.setIn(['data', key, 'value'], value);
                    validateFormState(this, mutState);
                })
            };

            const onChangeCallbacks = this.state.formSettings.onChange || {};

            if (onChangeCallbacks[key]) {
                onChangeCallbacks[key](newState, key, oldValue, value);
            }

            return newState;
        });
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

    inst.isFormServerValidated = function() {
        return !this.state.formSettings.serverValidation || this.state.formSettings.serverValidation.changed.every(attr => this.state.formState.getIn(['data', attr, 'serverValidated']));
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

    inst.clearFormStatusMessage = function() {
        this.setState(previousState => ({
            formState: previousState.formState.withMutations(map => {
                map.set('statusMessageText', '');
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

    inst.formHandleChangedError = async function(fn) {
        const t = this.props.t;
        try {
            await fn();
        } catch (error) {
            if (error instanceof interoperableErrors.ChangedError) {
                this.disableForm();
                this.setFormStatusMessage('danger',
                    <span>
                        <strong>{t('Your updates cannot be saved.')}</strong>{' '}
                        {t('Someone else has introduced modification in the meantime. Refresh your page to start anew with fresh data. Please note that your changes will be lost.')}
                    </span>
                );
                return;
            }

            if (error instanceof interoperableErrors.NotFoundError) {
                this.disableForm();
                this.setFormStatusMessage('danger',
                    <span>
                        <strong>{t('Your updates cannot be saved.')}</strong>{' '}
                        {t('It seems that someone else has deleted the entity in the meantime.')}
                    </span>
                );
                return;
            }

            throw error;
        }
    };

    return target;
}


export {
    withForm,
    Form,
    Fieldset,
    StaticField,
    InputField,
    CheckBox,
    TextArea,
    Dropdown,
    AlignedRow,
    ButtonRow,
    Button,
    TreeTableSelect,
    TableSelect,
    TableSelectMode,
    ACEEditor,
    FormSendMethod
}
