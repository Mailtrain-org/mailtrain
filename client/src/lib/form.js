'use strict';

import React, {Component} from 'react';
import {withTranslation} from './i18n';
import axios, {HTTPMethod} from './axios';
import Immutable from 'immutable';
import PropTypes from 'prop-types';
import interoperableErrors from '../../../shared/interoperable-errors';
import {withPageHelpers} from './page'
import {withAsyncErrorHandler, withErrorHandling} from './error-handling';
import {TreeSelectMode, TreeTable} from './tree';
import {Table, TableSelectMode} from './table';
import {Button} from "./bootstrap-components";
import {SketchPicker} from 'react-color';

import ACEEditorRaw from 'react-ace';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-searchbox';

import DayPicker from 'react-day-picker';
import 'react-day-picker/lib/style.css';
import {
    birthdayYear,
    DateFormat,
    formatBirthday,
    formatDate,
    getBirthdayFormatString,
    getDateFormatString,
    parseBirthday,
    parseDate
} from '../../../shared/date';

import styles from "./styles.scss";
import moment from "moment";
import {getUrl} from "./urls";
import {createComponentMixin, withComponentMixins} from "./decorator-helpers";


const FormState = {
    Loading: 0,
    LoadingWithNotice: 1,
    Ready: 2
};

const FormSendMethod = HTTPMethod;

export const FormStateOwnerContext = React.createContext(null);

const withFormStateOwner = createComponentMixin({
    contexts: [{context: FormStateOwnerContext, propName: 'formStateOwner'}],
    decoratorFn: (TargetClass, InnerClass) => {
        InnerClass.prototype.getFormStateOwner = function () {
            return this.props.formStateOwner;
        };

        return {};
    }
});

export function withFormErrorHandlers(target, name, descriptor) {
    const asyncFn = descriptor.value;

    descriptor.value = async function(...args) {
        await this.formHandleErrors(async () => await asyncFn.apply(this, args));
    };

    return descriptor;
}

@withComponentMixins([
    withTranslation,
    withErrorHandling,
    withPageHelpers
])
class Form extends Component {
    constructor(props) {
        super(props);

        this.beforeUnloadHandlers = {
            handler: () => this.props.stateOwner.isFormChanged(),
            handlerAsync: async () => await this.props.stateOwner.isFormChangedAsync()
        };
    }

    static propTypes = {
        stateOwner: PropTypes.object.isRequired,
        onSubmitAsync: PropTypes.func,
        format: PropTypes.string,
        noStatus: PropTypes.bool
    }

    componentDidMount() {
        this.registerBeforeUnloadHandlers(this.beforeUnloadHandlers);
    }

    componentWillUnmount() {
        this.deregisterBeforeUnloadHandlers(this.beforeUnloadHandlers);
    }

    @withAsyncErrorHandler
    async onSubmit(evt) {
        const t = this.props.t;

        const owner = this.props.stateOwner;

        evt.preventDefault();

        if (this.props.onSubmitAsync) {
            await this.props.onSubmitAsync();
        }
    }

    render() {
        const t = this.props.t;
        const owner = this.props.stateOwner;
        const props = this.props;
        const statusMessageText = owner.getFormStatusMessageText();
        const statusMessageSeverity = owner.getFormStatusMessageSeverity();

        let formClass = styles.form;
        if (props.format === 'wide') {
            formClass = '';
        } else if (props.format === 'inline') {
            formClass = 'form-inline';
        }

        if (!owner.isFormReady()) {
            if (owner.isFormWithLoadingNotice()) {
                return <p className={`alert alert-info ${styles.formStatus}`} role="alert">{t('loading')}</p>
            } else {
                return <div></div>;
            }
        } else {
            return (
                <form className={formClass} onSubmit={::this.onSubmit}>
                    <FormStateOwnerContext.Provider value={owner}>
                        <fieldset disabled={owner.isFormDisabled()}>
                            {props.children}
                        </fieldset>
                        {!props.noStatus && statusMessageText &&
                        <AlignedRow format={props.format} htmlId="form-status-message">
                            <div className={`alert alert-${statusMessageSeverity} ${styles.formStatus}`} role="alert">{statusMessageText}</div>
                        </AlignedRow>
                        }
                    </FormStateOwnerContext.Provider>
                </form>
            );
        }
    }
}

@withComponentMixins([
    withFormStateOwner
])
class Fieldset extends Component {
    static propTypes = {
        id: PropTypes.string,
        label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        help: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        flat: PropTypes.bool,
        className: PropTypes.string
    }

    render() {
        const props = this.props;
        const owner = this.getFormStateOwner();
        const id = this.props.id;
        const htmlId = 'form_' + id;

        let className = id ? owner.addFormValidationClass('', id) : null;
        if (this.props.className) {
            className = (className || '') + ' ' + this.props.className;
        }

        let helpBlock = null;
        if (this.props.help) {
            helpBlock = <small className="form-text text-muted" id={htmlId + '_help'}>{this.props.help}</small>;
        }

        let validationBlock = null;
        if (id) {
            const validationMsg = id && owner.getFormValidationMessage(id);
            if (validationMsg) {
                validationBlock = <small className="form-text text-muted" id={htmlId + '_help_validation'}>{validationMsg}</small>;
            }
        }

        return (
            <fieldset className={className}>
                {props.label ? <legend>{props.label}</legend> : null}
                <div className={props.flat ? 'fieldset-content fieldset-content-flat' : 'fieldset-content'}>
                    {props.children}
                    {helpBlock}
                    {validationBlock}
                </div>
            </fieldset>
        );
    }
}

function wrapInput(id, htmlId, owner, format, rightContainerClass, label, help, input) {
    // wrapInput may be used also outside forms to make a kind of fake read-only forms
    let className;
    if (owner) {
        className = 'form-group';
    } else {
        className = styles.staticFormGroup;
    }

    let colLeft = '';
    let colRight = '';

    switch (format) {
        case 'wide':
            colLeft = '';
            colRight = '';
            break;
        case 'inline':
            colLeft = 'mr-3';
            colRight = '';
            break;
        default:
            className = className + ' row';
            colLeft = 'col-sm-2 col-form-label';
            colRight = 'col-sm-10';
            break;
    }

    let helpBlock = null;
    if (help) {
        helpBlock = <small className={`form-text text-muted`} id={htmlId + '_help'}>{help}</small>;
    }

    let validationBlock = null;
    if (id) {
        const validationMsg = id && owner.getFormValidationMessage(id);
        if (validationMsg) {
            validationBlock = <div className="invalid-feedback" id={htmlId + '_help_validation'}>{validationMsg}</div>;
        }
    }

    let labelBlock = null;
    if (label) {
        labelBlock = <label className={colLeft}>{label}</label>;
    } else {
        labelBlock = <div className={colLeft}/>
    }

    if (format === 'inline') {
        return (
            <div className={className} >
                {labelBlock}{input}
                {helpBlock}
                {validationBlock}
            </div>
        );
    } else {
        return (
            <div className={className} >
                {labelBlock}
                <div className={`${colRight} ${rightContainerClass}`}>
                    {input}
                    {helpBlock}
                    {validationBlock}
                </div>
            </div>
        );
    }
}

@withComponentMixins([
    withFormStateOwner
])
class StaticField extends Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        label: PropTypes.string,
        help: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        className: PropTypes.string,
        format: PropTypes.string,
        withValidation: PropTypes.bool
    }

    render() {
        const props = this.props;
        const owner = this.getFormStateOwner();
        const id = this.props.id;
        const htmlId = 'form_' + id;

        let className = 'form-control';

        if (props.withValidation) {
            className = owner.addFormValidationClass(className, id);
        }

        if (props.className) {
            className += ' ' + props.className;
        }

        return wrapInput(props.withValidation ? id : null, htmlId, owner, props.format, '', props.label, props.help,
            <div id={htmlId} className={className} aria-describedby={htmlId + '_help'}>{props.children}</div>
        );
    }
}

@withComponentMixins([
    withFormStateOwner
])
class InputField extends Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        label: PropTypes.string,
        placeholder: PropTypes.string,
        type: PropTypes.string,
        help: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        format: PropTypes.string
    }

    static defaultProps = {
        type: 'text'
    }

    render() {
        const props = this.props;
        const owner = this.getFormStateOwner();
        const id = this.props.id;
        const htmlId = 'form_' + id;

        let type = 'text';
        if (props.type === 'password') {
            type = 'password';
        } else if (props.type === 'hidden') {
            type = 'hidden';
        }

        const className = owner.addFormValidationClass('form-control', id);

        /* This is for debugging purposes when React reports that InputField is uncontrolled
        const value = owner.getFormValue(id);
        if (value === null || value === undefined) console.log(`Warning: InputField ${id} is ${value}`);
        */
        const value = owner.getFormValue(id);
        if (value === null || value === undefined) console.log(`Warning: InputField ${id} is ${value}`);

        return wrapInput(id, htmlId, owner, props.format, '', props.label, props.help,
            <input type={type} value={owner.getFormValue(id)} placeholder={props.placeholder} id={htmlId} className={className} aria-describedby={htmlId + '_help'} onChange={evt => owner.updateFormValue(id, evt.target.value)}/>
        );
    }
}

class CheckBox extends Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        text: PropTypes.string,
        label: PropTypes.string,
        help: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        format: PropTypes.string,
        className: PropTypes.string
    }

    render() {
        return (
            <FormStateOwnerContext.Consumer>
                {
                    owner => {
                        const props = this.props;
                        const id = this.props.id;
                        const htmlId = 'form_' + id;

                        const inputClassName = owner.addFormValidationClass('form-check-input', id);

                        return wrapInput(id, htmlId, owner, props.format, '', props.label, props.help,
                            <div className={`form-group form-check my-2 ${this.props.className}`}>
                                <input className={inputClassName} type="checkbox" checked={owner.getFormValue(id)} id={htmlId} aria-describedby={htmlId + '_help'} onChange={evt => owner.updateFormValue(id, !owner.getFormValue(id))}/>
                                <label className={styles.checkboxText} htmlFor={htmlId}>{props.text}</label>
                            </div>
                        );
                    }

                }
            </FormStateOwnerContext.Consumer>
        );

    }
}

@withComponentMixins([
    withFormStateOwner
])
class CheckBoxGroup extends Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        help: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        options: PropTypes.array,
        className: PropTypes.string,
        format: PropTypes.string
    }

    onChange(key) {
        const id = this.props.id;
        const owner = this.getFormStateOwner();
        const existingSelection = owner.getFormValue(id);

        let newSelection;
        if (existingSelection.includes(key)) {
            newSelection = existingSelection.filter(x => x !== key);
        } else {
            newSelection = [key, ...existingSelection];
        }
        owner.updateFormValue(id, newSelection.sort());
    }

    render() {
        const props = this.props;

        const owner = this.getFormStateOwner();
        const id = this.props.id;
        const htmlId = 'form_' + id;

        const selection = owner.getFormValue(id);

        const options = [];
        for (const option of props.options) {
            const optClassName = owner.addFormValidationClass('form-check-input', id);
            const optId = htmlId + '_' + option.key;

            let number = options.push(
                <div key={option.key} className="form-group form-check my-2">
                    <input id={optId} type="checkbox" className={optClassName} checked={selection.includes(option.key)} onChange={evt => this.onChange(option.key)}/>
                    <label className="form-check-label" htmlFor={optId}>{option.label}</label>
                </div>
            );
        }

        let className = 'form-control';
        if (props.className) {
            className += ' ' + props.className;
        }

        return wrapInput(id, htmlId, owner, props.format, '', props.label, props.help,
            <div>
                {options}
            </div>
        );
    }
}

@withComponentMixins([
    withFormStateOwner
])
class RadioGroup extends Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        help: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        options: PropTypes.array,
        className: PropTypes.string,
        format: PropTypes.string
    }

    render() {
        const props = this.props;

        const owner = this.getFormStateOwner();
        const id = this.props.id;
        const htmlId = 'form_' + id;

        const value = owner.getFormValue(id);

        const options = [];
        for (const option of props.options) {
            const optClassName = owner.addFormValidationClass('form-check-input', id);
            const optId = htmlId + '_' + option.key;

            let number = options.push(
                <div key={option.key} className="form-group form-check my-2">
                    <input id={optId} type="radio" className={optClassName} name={htmlId} checked={value === option.key} onChange={evt => owner.updateFormValue(id, option.key)}/>
                    <label className="form-check-label" htmlFor={optId}>{option.label}</label>
                </div>
            );
        }

        let className = 'form-control';
        if (props.className) {
            className += ' ' + props.className;
        }

        return wrapInput(id, htmlId, owner, props.format, '', props.label, props.help,
            <div>
                {options}
            </div>
        );
    }
}

@withComponentMixins([
    withFormStateOwner
])
class TextArea extends Component {
    constructor() {
        super();
        this.onChange = evt => {
            const id = this.props.id;
            const owner = this.getFormStateOwner();
            owner.updateFormValue(id, evt.target.value);
        }
    }

    static propTypes = {
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        placeholder: PropTypes.string,
        help: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        format: PropTypes.string,
        className: PropTypes.string
    }

    render() {
        const props = this.props;
        const owner = this.getFormStateOwner();
        const id = props.id;
        const htmlId = 'form_' + id;
        const className = owner.addFormValidationClass('form-control ' + (props.className || '') , id);

        return wrapInput(id, htmlId, owner, props.format, '', props.label, props.help,
            <textarea id={htmlId} placeholder={props.placeholder} value={owner.getFormValue(id) || ''} className={className} aria-describedby={htmlId + '_help'} onChange={this.onChange}></textarea>
        );
    }
}


@withComponentMixins([
    withFormStateOwner
])
class ColorPicker extends Component {
    constructor(props) {
        super(props);

        this.state = {
            opened: false
        };
    }

    static propTypes = {
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        help: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    }

    toggle() {
        this.setState({
            opened: !this.state.opened
        });
    }

    selected(value) {
        const owner = this.getFormStateOwner();
        const id = this.props.id;

        this.setState({
            opened: false
        });

        owner.updateFormValue(id, value.rgb);
    }

    render() {
        const props = this.props;
        const owner = this.getFormStateOwner();
        const id = this.props.id;
        const htmlId = 'form_' + id;
        const t = props.t;
        const color = owner.getFormValue(id);

        return wrapInput(id, htmlId, owner, props.format, '', props.label, props.help,
            <div>
                <div className="input-group">
                    <div className={styles.colorPickerSwatchWrapper} onClick={::this.toggle}>
                        <div className={styles.colorPickerSwatchColor} style={{background: `rgba(${ color.r }, ${ color.g }, ${ color.b }, ${ color.a })`}}/>
                    </div>
                </div>
                {this.state.opened &&
                <div className={styles.colorPickerWrapper}>
                    <SketchPicker color={color} onChange={::this.selected} />
                </div>
                }
            </div>
        );
    }
}

@withComponentMixins([
    withTranslation,
    withFormStateOwner
])
class DatePicker extends Component {
    constructor(props) {
        super(props);

        this.state = {
            opened: false
        };
    }

    static propTypes = {
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        help: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        format: PropTypes.string,
        birthday: PropTypes.bool,
        dateFormat: PropTypes.string,
        formatDate: PropTypes.func,
        parseDate: PropTypes.func
    }

    static defaultProps = {
        dateFormat: DateFormat.INTL
    }

    async toggleDayPicker() {
        this.setState({
            opened: !this.state.opened
        });
    }

    daySelected(date) {
        const owner = this.getFormStateOwner();
        const id = this.props.id;
        const props = this.props;

        if (props.formatDate) {
            owner.updateFormValue(id, props.formatDate(date));
        } else {
            owner.updateFormValue(id, props.birthday ? formatBirthday(props.dateFormat, date) : formatDate(props.dateFormat, date));
        }

        this.setState({
            opened: false
        });
    }

    render() {
        const props = this.props;
        const owner = this.getFormStateOwner();
        const id = this.props.id;
        const htmlId = 'form_' + id;
        const t = props.t;

        function BirthdayPickerCaption({ date, localeUtils, onChange }) {
            const months = localeUtils.getMonths();
            return (
                <div className="DayPicker-Caption">
                    {months[date.getMonth()]}
                </div>
            );
        }

        let selectedDate, captionElement, fromMonth, toMonth, placeholder;
        const selectedDateStr = owner.getFormValue(id) || '';
        if (props.birthday) {
            if (props.parseDate) {
                selectedDate = props.parseDate(selectedDateStr);
                if (selectedDate) {
                    selectedDate = moment(selectedDate).set('year', birthdayYear).toDate();
                }
            } else {
                selectedDate = parseBirthday(props.dateFormat, selectedDateStr);
            }

            if (!selectedDate) {
                selectedDate = moment().set('year', birthdayYear).toDate();
            }

            captionElement = <BirthdayPickerCaption/>;
            fromMonth = new Date(birthdayYear, 0, 1);
            toMonth = new Date(birthdayYear, 11, 31);
            placeholder = getBirthdayFormatString(props.dateFormat);

        } else {
            if (props.parseDate) {
                selectedDate = props.parseDate(selectedDateStr);
            } else {
                selectedDate = parseDate(props.dateFormat, selectedDateStr);
            }

            if (!selectedDate) {
                selectedDate = moment().toDate();
            }

            placeholder = getDateFormatString(props.dateFormat);
        }

        const className = owner.addFormValidationClass('form-control', id);

        return wrapInput(id, htmlId, owner, props.format, '', props.label, props.help,
            <>
                <div className="input-group">
                    <input type="text" value={selectedDateStr} placeholder={placeholder} id={htmlId} className={className} aria-describedby={htmlId + '_help'} onChange={evt => owner.updateFormValue(id, evt.target.value)}/>
                    <div className="input-group-append">
                        <Button iconTitle={t('openCalendar')} className="btn-secondary" icon="calendar-alt" onClickAsync={::this.toggleDayPicker}/>
                    </div>
                </div>
                {this.state.opened &&
                <div className={styles.dayPickerWrapper}>
                    <DayPicker
                        onDayClick={date => this.daySelected(date)}
                        selectedDays={selectedDate}
                        initialMonth={selectedDate}
                        fromMonth={fromMonth}
                        toMonth={toMonth}
                        captionElement={captionElement}
                    />
                </div>
                }
            </>
        );
    }
}


@withComponentMixins([
    withFormStateOwner
])
class Dropdown extends Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        help: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        options: PropTypes.array,
        className: PropTypes.string,
        format: PropTypes.string,
        disabled: PropTypes.bool
    }

    render() {
        const props = this.props;

        const owner = this.getFormStateOwner();
        const id = this.props.id;
        const htmlId = 'form_' + id;
        const options = [];

        if (this.props.options) {
            for (const optOrGrp of props.options) {
                if (optOrGrp.options) {
                    options.push(
                        <optgroup key={optOrGrp.key} label={optOrGrp.label}>
                            {optOrGrp.options.map(opt => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
                        </optgroup>
                    )
                } else {
                    options.push(<option key={optOrGrp.key} value={optOrGrp.key}>{optOrGrp.label}</option>)
                }
            }
        }

        const className = owner.addFormValidationClass('form-control ' + (props.className || '') , id);

        return wrapInput(id, htmlId, owner, props.format, '', props.label, props.help,
            <select id={htmlId} className={className} aria-describedby={htmlId + '_help'} value={owner.getFormValue(id)} onChange={evt => owner.updateFormValue(id, evt.target.value)} disabled={props.disabled}>
                {options}
            </select>
        );
    }
}

@withComponentMixins([
    withFormStateOwner
])
class AlignedRow extends Component {
    static propTypes = {
        className: PropTypes.string,
        label: PropTypes.string,
        htmlId: PropTypes.string,
        format: PropTypes.string
    }

    static defaultProps = {
        className: ''
    }

    render() {
        const props = this.props;
        const owner = this.getFormStateOwner();

        return wrapInput(null, props.htmlId, owner, props.format, props.className, props.label, null, this.props.children);
    }
}


class ButtonRow extends Component {
    static propTypes = {
        className: PropTypes.string,
        format: PropTypes.string
    }

    render() {
        let className = styles.buttonRow;
        if (this.props.className) {
            className += ' ' + this.props.className;
        }

        return (
            <AlignedRow className={className} format={this.props.format}>{this.props.children}</AlignedRow>
        );
    }
}


@withComponentMixins([
    withFormStateOwner
])
class TreeTableSelect extends Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        label: PropTypes.string,
        dataUrl: PropTypes.string,
        data: PropTypes.array,
        help: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        format: PropTypes.string
    }

    async onSelectionChangedAsync(sel) {
        const owner = this.getFormStateOwner();
        owner.updateFormValue(this.props.id, sel);
    }

    render() {
        const props = this.props;
        const owner = this.getFormStateOwner();
        const id = this.props.id;
        const htmlId = 'form_' + id;

        const className = owner.addFormValidationClass('' , id);

        return wrapInput(id, htmlId, owner, props.format, '', props.label, props.help,
            <TreeTable className={className} data={props.data} dataUrl={props.dataUrl} selectMode={TreeSelectMode.SINGLE} selection={owner.getFormValue(id)} onSelectionChangedAsync={::this.onSelectionChangedAsync} />
        );
    }
}

@withComponentMixins([
    withTranslation,
    withFormStateOwner
], ['refresh'])
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
        label: PropTypes.string,
        help: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        format: PropTypes.string,
        disabled: PropTypes.bool,

        pageLength: PropTypes.number
    }

    static defaultProps = {
        selectMode: TableSelectMode.SINGLE,
        selectionLabelIndex: 0,
        pageLength: 10
    }

    async onSelectionChangedAsync(sel, data) {
        if (this.props.selectMode === TableSelectMode.SINGLE && this.props.dropdown) {
            this.setState({
                open: false
            });
        }

        const owner = this.getFormStateOwner();
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
        const owner = this.getFormStateOwner();
        const id = this.props.id;
        const htmlId = 'form_' + id;
        const t = props.t;

        if (props.dropdown) {
            const className = owner.addFormValidationClass('form-control' , id);

            return wrapInput(id, htmlId, owner, props.format, '', props.label, props.help,
                <div>
                    <div className={(props.disabled ? '' : 'input-group ') + styles.tableSelectDropdown}>
                        <input type="text" className={className} value={this.state.selectedLabel} onClick={::this.toggleOpen} readOnly={!props.disabled} disabled={props.disabled}/>
                        {!props.disabled &&
                        <div className="input-group-append">
                            <Button label={t('select')} className="btn-secondary" onClickAsync={::this.toggleOpen}/>
                        </div>
                        }
                    </div>
                    <div className={styles.tableSelectTable + (this.state.open ? '' : ' ' + styles.tableSelectTableHidden)}>
                        <Table ref={node => this.table = node} data={props.data} dataUrl={props.dataUrl} columns={props.columns} selectMode={props.selectMode} selectionAsArray={this.props.selectionAsArray} withHeader={props.withHeader} selectionKeyIndex={props.selectionKeyIndex} selection={owner.getFormValue(id)} onSelectionDataAsync={::this.onSelectionDataAsync} onSelectionChangedAsync={::this.onSelectionChangedAsync}/>
                    </div>
                </div>
            );
        } else {
            return wrapInput(id, htmlId, owner, props.format, '', props.label, props.help,
                <div>
                    <div>
                        <Table ref={node => this.table = node} data={props.data} dataUrl={props.dataUrl} columns={props.columns} pageLength={props.pageLength} selectMode={props.selectMode} selectionAsArray={this.props.selectionAsArray} withHeader={props.withHeader} selectionKeyIndex={props.selectionKeyIndex} selection={owner.getFormValue(id)} onSelectionChangedAsync={::this.onSelectionChangedAsync}/>
                    </div>
                </div>
            );
        }
    }
}


@withComponentMixins([
    withFormStateOwner
])
class ACEEditor extends Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        label: PropTypes.string,
        help: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        height: PropTypes.string,
        mode: PropTypes.string,
        format: PropTypes.string
    }

    render() {
        const props = this.props;
        const owner = this.getFormStateOwner();
        const id = this.props.id;
        const htmlId = 'form_' + id;

        return wrapInput(id, htmlId, owner, props.format, '', props.label, props.help,
            <ACEEditorRaw
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


const withForm = createComponentMixin({
    decoratorFn: (TargetClass, InnerClass) => {
        const proto = InnerClass.prototype;

        const cleanFormState = Immutable.Map({
            state: FormState.Loading,
            isValidationShown: false,
            isDisabled: false,
            statusMessageText: '',
            data: Immutable.Map(),
            savedData: Immutable.Map(),
            isServerValidationRunning: false
        });

        const getSaveData = (self, formStateData) => {
            let data = formStateData.map(attr => attr.get('value')).toJS();

            if (self.submitFormValuesMutator) {
                const newData = self.submitFormValuesMutator(data, false);
                if (newData !== undefined) {
                    data = newData;
                }
            }

            return data;
        };

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
                    if (typeof attr === 'string') {
                        payload[attr] = mutState.getIn(['data', attr, 'value']);
                    } else {
                        const data = mutState.get('data').map(attr => attr.get('value')).toJS();
                        payload[attr.key] = attr.data(data);
                    }
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

                    axios.post(getUrl(settings.serverValidation.url), payload)
                        .then(response => {

                            if (self.isComponentMounted()) {
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
                            }
                        })
                        .catch(error => {
                            if (self.isComponentMounted()) {
                                console.log('Error in "validateFormState": ' + error);

                                self.setState(previousState => ({
                                    formState: previousState.formState.set('isServerValidationRunning', false)
                                }));

                                // TODO: It might be good not to give up immediatelly, but retry a couple of times
                                // scheduleValidateForm(self);
                            }
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

        const previousComponentDidMount = proto.componentDidMount;
        proto.componentDidMount = function () {
            this._isComponentMounted = true;
            if (previousComponentDidMount) {
                previousComponentDidMount.apply(this);
            }
        };

        const previousComponentWillUnmount = proto.componentWillUnmount;
        proto.componentWillUnmount = function () {
            this._isComponentMounted = false;
            if (previousComponentWillUnmount) {
                previousComponentDidMount.apply(this);
            }
        };

        proto.isComponentMounted = function () {
            return !!this._isComponentMounted;
        }

        proto.initForm = function (settings) {
            const state = this.state || {};
            state.formState = cleanFormState;
            state.formSettings = {
                leaveConfirmation: true,
                ...(settings || {})
            };
            this.state = state;
        };

        proto.resetFormState = function () {
            this.setState({
                formState: cleanFormState
            });
        };

        proto.getFormValuesFromEntity = function (entity) {
            const settings = this.state.formSettings;
            const data = Object.assign({}, entity);

            data.originalHash = data.hash;
            delete data.hash;

            if (this.getFormValuesMutator) {
                this.getFormValuesMutator(data, this.getFormValues());
            }

            this.populateFormValues(data);
        };

        proto.getFormValuesFromURL = async function (url) {
            const settings = this.state.formSettings;
            setTimeout(() => {
                this.setState(previousState => {
                    if (previousState.formState.get('state') === FormState.Loading) {
                        return {
                            formState: previousState.formState.set('state', FormState.LoadingWithNotice)
                        };
                    }
                });
            }, 500);

            const response = await axios.get(getUrl(url));

            let data = response.data;

            data.originalHash = data.hash;
            delete data.hash;

            if (this.getFormValuesMutator) {
                const newData = this.getFormValuesMutator(data, this.getFormValues());

                if (newData !== undefined) {
                    data = newData;
                }
            }

            this.populateFormValues(data);
        };

        proto.validateAndSendFormValuesToURL = async function (method, url) {
            const settings = this.state.formSettings;
            await this.waitForFormServerValidated();

            if (this.isFormWithoutErrors()) {
                if (settings.getPreSubmitUpdater) {
                    const preSubmitUpdater = await settings.getPreSubmitUpdater();

                    await new Promise((resolve, reject) => {
                        this.setState(previousState => ({
                            formState: previousState.formState.withMutations(mutState => {
                                mutState.update('data', stateData => stateData.withMutations(preSubmitUpdater));
                            })
                        }), resolve);
                    });
                }

                let data = this.getFormValues();

                if (this.submitFormValuesMutator) {
                    const newData = this.submitFormValuesMutator(data, true);
                    if (newData !== undefined) {
                        data = newData;
                    }
                }

                const response = await axios.method(method, getUrl(url), data);

                if (settings.leaveConfirmation) {
                    await new Promise((resolve, reject) => {
                        this.setState(previousState => ({
                            formState: previousState.formState.set('savedData', getSaveData(this, previousState.formState.get('data')))
                        }), resolve);
                    });
                }

                return response.data || true;

            } else {
                this.showFormValidation();
                return false;
            }
        };


        proto.populateFormValues = function (data) {
            const settings = this.state.formSettings;

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

                    if (settings.leaveConfirmation) {
                        mutState.set('savedData', getSaveData(this, mutState.get('data')));
                    }

                    validateFormState(this, mutState);
                })
            }));
        };

        proto.waitForFormServerValidated = async function () {
            if (!this.isFormServerValidated()) {
                await new Promise(resolve => {
                    formValidateResolve = resolve;
                });
            }
        };

        proto.scheduleFormRevalidate = function () {
            scheduleValidateForm(this);
        };

        proto.updateForm = function (mutator) {
            this.setState(previousState => {
                const onChangeBeforeValidationCallback = this.state.formSettings.onChangeBeforeValidation || {};

                const formState = previousState.formState.withMutations(mutState => {
                    mutState.update('data', stateData => stateData.withMutations(mutStateData => {
                        mutator(mutStateData);

                        if (typeof onChangeBeforeValidationCallback === 'object') {
                            for (const key in onChangeBeforeValidationCallback) {
                                const oldValue = previousState.formState.getIn(['data', key, 'value']);
                                const newValue = mutStateData.getIn([key, 'value']);
                                onChangeBeforeValidationCallback[key](mutStateData, key, oldValue, newValue);
                            }
                        } else {
                            onChangeBeforeValidationCallback(mutStateData);
                        }
                    }));

                    validateFormState(this, mutState);
                });

                let newState = {
                    formState
                };


                const onChangeCallback = this.state.formSettings.onChange || {};

                if (typeof onChangeCallback === 'object') {
                    for (const key in onChangeCallback) {
                        const oldValue = previousState.formState.getIn(['data', key, 'value']);
                        const newValue = formState.getIn(['data', key, 'value']);
                        onChangeCallback[key](newState, key, oldValue, newValue);
                    }
                } else {
                    onChangeCallback(newState);
                }

                return newState;
            });
        };

        proto.updateFormValue = function (key, value) {
            this.setState(previousState => {
                const oldValue = previousState.formState.getIn(['data', key, 'value']);

                const onChangeBeforeValidationCallback = this.state.formSettings.onChangeBeforeValidation || {};

                const formState = previousState.formState.withMutations(mutState => {
                    mutState.update('data', stateData => stateData.withMutations(mutStateData => {
                        mutStateData.setIn([key, 'value'], value);

                        if (typeof onChangeBeforeValidationCallback === 'object') {
                            if (onChangeBeforeValidationCallback[key]) {
                                onChangeBeforeValidationCallback[key](mutStateData, key, oldValue, value);
                            }
                        } else {
                            onChangeBeforeValidationCallback(mutStateData, key, oldValue, value);
                        }
                    }));

                    validateFormState(this, mutState);
                });

                let newState = {
                    formState
                };


                const onChangeCallback = this.state.formSettings.onChange || {};

                if (typeof onChangeCallback === 'object') {
                    if (onChangeCallback[key]) {
                        onChangeCallback[key](newState, key, oldValue, value);
                    }
                } else {
                    onChangeCallback(newState, key, oldValue, value);
                }

                return newState;
            });
        };

        proto.getFormValue = function (name) {
            return this.state.formState.getIn(['data', name, 'value']);
        };

        proto.getFormValues = function (name) {
            if (!this.state || !this.state.formState) return undefined;
            return this.state.formState.get('data').map(attr => attr.get('value')).toJS();
        };

        proto.getFormError = function (name) {
            return this.state.formState.getIn(['data', name, 'error']);
        };

        proto.isFormWithLoadingNotice = function () {
            return this.state.formState.get('state') === FormState.LoadingWithNotice;
        };

        proto.isFormLoading = function () {
            return this.state.formState.get('state') === FormState.Loading || this.state.formState.get('state') === FormState.LoadingWithNotice;
        };

        proto.isFormReady = function () {
            return this.state.formState.get('state') === FormState.Ready;
        };

        const _isFormChanged = self => {
            const currentData = getSaveData(self, self.state.formState.get('data'));
            const savedData = self.state.formState.get('savedData');

            function isDifferent(data1, data2, prefix) {
                if (typeof data1 === 'object' && typeof data2 === 'object' && data1 && data2) {
                    const keys = new Set([...Object.keys(data1), ...Object.keys(data2)]);
                    for (const key of keys) {
                        if (isDifferent(data1[key], data2[key], `${prefix}/${key}`)) {
                            return true;
                        }
                    }
                } else if (data1 !== data2) {
                    // console.log(prefix);
                    return true;
                }
                return false;
            }

            const result = isDifferent(currentData, savedData, '');

            return result;
        };

        proto.isFormChanged = function () {
            const settings = this.state.formSettings;

            if (!settings.leaveConfirmation) return false;

            if (settings.getPreSubmitUpdater) {
                // getPreSubmitUpdater is an async function. We cannot do anything async here. So to be on the safe side,
                // we simply assume that the form has been changed.
                return true;
            }

            return _isFormChanged(this);
        };

        proto.isFormChangedAsync = async function () {
            const settings = this.state.formSettings;

            if (!settings.leaveConfirmation) return false;

            if (settings.getPreSubmitUpdater) {
                const preSubmitUpdater = await settings.getPreSubmitUpdater();

                await new Promise((resolve, reject) => {
                    this.setState(previousState => ({
                        formState: previousState.formState.withMutations(mutState => {
                            mutState.update('data', stateData => stateData.withMutations(preSubmitUpdater));
                        })
                    }), resolve);
                });
            }

            return _isFormChanged(this);

        };

        proto.isFormValidationShown = function () {
            return this.state.formState.get('isValidationShown');
        };

        proto.addFormValidationClass = function (className, name) {
            if (this.isFormValidationShown()) {
                const error = this.getFormError(name);
                if (error) {
                    return className + ' is-invalid';
                } else {
                    return className + ' is-valid';
                }
            } else {
                return className;
            }
        };

        proto.getFormValidationMessage = function (name) {
            if (this.isFormValidationShown()) {
                return this.getFormError(name);
            } else {
                return '';
            }
        };

        proto.showFormValidation = function () {
            this.setState(previousState => ({formState: previousState.formState.set('isValidationShown', true)}));
        };

        proto.hideFormValidation = function () {
            this.setState(previousState => ({formState: previousState.formState.set('isValidationShown', false)}));
        };

        proto.isFormWithoutErrors = function () {
            return !this.state.formState.get('data').find(attr => attr.get('error'));
        };

        proto.isFormServerValidated = function () {
            return !this.state.formSettings.serverValidation || this.state.formSettings.serverValidation.changed.every(attr => this.state.formState.getIn(['data', attr, 'serverValidated']));
        };

        proto.getFormStatusMessageText = function () {
            return this.state.formState.get('statusMessageText');
        };

        proto.getFormStatusMessageSeverity = function () {
            return this.state.formState.get('statusMessageSeverity');
        };

        proto.setFormStatusMessage = function (severity, text) {
            this.setState(previousState => ({
                formState: previousState.formState.withMutations(map => {
                    map.set('statusMessageText', text);
                    map.set('statusMessageSeverity', severity);
                })
            }));
        };

        proto.clearFormStatusMessage = function () {
            this.setState(previousState => ({
                formState: previousState.formState.withMutations(map => {
                    map.set('statusMessageText', '');
                })
            }));
        };

        proto.enableForm = function () {
            this.setState(previousState => ({formState: previousState.formState.set('isDisabled', false)}));
        };

        proto.disableForm = function () {
            this.setState(previousState => ({formState: previousState.formState.set('isDisabled', true)}));
        };

        proto.isFormDisabled = function () {
            return this.state.formState.get('isDisabled');
        };

        proto.formHandleErrors = async function (fn) {
            const t = this.props.t;
            try {
                await fn();
            } catch (error) {
                if (error instanceof interoperableErrors.ChangedError) {
                    this.disableForm();
                    this.setFormStatusMessage('danger',
                        <span>
                            <strong>{t('yourUpdatesCannotBeSaved')}</strong>{' '}
                            {t('someoneElseHasIntroducedModificationIn')}
                        </span>
                    );
                    return;
                }

                if (error instanceof interoperableErrors.NamespaceNotFoundError) {
                    this.disableForm();
                    this.setFormStatusMessage('danger',
                        <span>
                            <strong>{t('yourUpdatesCannotBeSaved')}</strong>{' '}
                            {t('itSeemsThatSomeoneElseHasDeletedThe')}
                        </span>
                    );
                    return;
                }

                if (error instanceof interoperableErrors.NotFoundError) {
                    this.disableForm();
                    this.setFormStatusMessage('danger',
                        <span>
                            <strong>{t('yourUpdatesCannotBeSaved')}</strong>{' '}
                            {t('itSeemsThatSomeoneElseHasDeletedThe-1')}
                        </span>
                    );
                    return;
                }

                throw error;
            }
        };

        return {};
    }
});

function filterData(obj, allowedKeys) {
    const result = {};
    for (const key in obj) {
        if (key === 'originalHash') {
            result[key] = obj[key];
        } else {
            for (const allowedKey of allowedKeys) {
                if ((typeof allowedKey === 'function' && allowedKey(key)) || allowedKey === key) {
                    result[key] = obj[key];
                    break;
                }
            }
        }
    }

    return result;
}

export {
    withForm,
    Form,
    Fieldset,
    StaticField,
    InputField,
    CheckBox,
    CheckBoxGroup,
    RadioGroup,
    TextArea,
    ColorPicker,
    DatePicker,
    Dropdown,
    AlignedRow,
    ButtonRow,
    Button,
    TreeTableSelect,
    TableSelect,
    TableSelectMode,
    ACEEditor,
    FormSendMethod,
    filterData
}
