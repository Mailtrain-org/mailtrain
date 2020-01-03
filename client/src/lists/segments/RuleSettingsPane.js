'use strict';

import React, {PureComponent} from "react";
import PropTypes from "prop-types";
import {withTranslation} from '../../lib/i18n';
import {requiresAuthenticatedUser, withPageHelpers} from "../../lib/page";
import {Button, ButtonRow, Dropdown, Form, TableSelect, withForm} from "../../lib/form";
import {withErrorHandling} from "../../lib/error-handling";
import {getRuleHelpers} from "./helpers";
import {getFieldTypes} from "../fields/helpers";

import styles from "./CUD.scss";
import {withComponentMixins} from "../../lib/decorator-helpers";

@withComponentMixins([
    withTranslation,
    withForm,
    withErrorHandling,
    withPageHelpers,
    requiresAuthenticatedUser
])
export default class RuleSettingsPane extends PureComponent {
    constructor(props) {
        super(props);

        const t = props.t;
        this.ruleHelpers = getRuleHelpers(t, props.fields);
        this.fieldTypes = { ...getFieldTypes(t), ...this.ruleHelpers.extraFieldTypes };

        this.state = {};

        this.initForm({
            leaveConfirmation: false,
            onChangeBeforeValidation: ::this.populateRuleDefaults
        });
    }

    static propTypes = {
        rule: PropTypes.object.isRequired,
        fields: PropTypes.array.isRequired,
        onChange: PropTypes.func.isRequired,
        onClose: PropTypes.func.isRequired,
        onDelete: PropTypes.func.isRequired,
        forceShowValidation: PropTypes.bool.isRequired
    }

    updateStateFromProps(populateForm) {
        const props = this.props;
        if (populateForm) {
            const rule = props.rule;
            const ruleHelpers = this.ruleHelpers;

            let data;
            if (!ruleHelpers.isCompositeRuleType(rule.type)) { // rule.type === null signifies primitive rule where the type has not been determined yet
                data = ruleHelpers.primitiveRuleTypesFormDataDefaults;

                const colDef = ruleHelpers.getColumnDef(rule.column);
                if (colDef) {
                    const colType = colDef.type;
                    const settings = ruleHelpers.primitiveRuleTypes[colType][rule.type];
                    Object.assign(data, settings.getFormData(rule, colDef));
                }

                data.type = rule.type || ''; // On '', we display label "--SELECT--" in the type dropdown. Null would not be accepted by React.
                data.column = rule.column;

            } else {
                data = {
                    type: rule.type
                };
            }

            this.populateFormValues(data);
        }

        if (props.forceShowValidation) {
            this.showFormValidation();
        }
    }
    
    componentDidMount() {
        this.updateStateFromProps(true);
    }

    componentDidUpdate(prevProps) {
        this.updateStateFromProps(this.props.rule !== prevProps.rule);

        if (this.isFormWithoutErrors()) {
            const rule = this.props.rule;
            const ruleHelpers = this.ruleHelpers;

            rule.type = this.getFormValue('type');

            if (!ruleHelpers.isCompositeRuleType(rule.type)) {
                rule.column = this.getFormValue('column');

                const colDef = ruleHelpers.getColumnDef(rule.column);
                const colType = colDef.type;
                const settings = ruleHelpers.primitiveRuleTypes[colType][rule.type];
                settings.assignRuleSettings(rule, key => this.getFormValue(key), colDef);
            }

            this.props.onChange(false);
        } else {
            this.props.onChange(true);
        }
    }

    localValidateFormValues(state) {
        const t = this.props.t;
        const ruleHelpers = this.ruleHelpers;

        for (const key of state.keys()) {
            state.setIn([key, 'error'], null);
        }

        const ruleType = state.getIn(['type', 'value']);
        if (!ruleHelpers.isCompositeRuleType(ruleType)) {
            if (!ruleType) {
                state.setIn(['type', 'error'], t('typeMustBeSelected'));
            }

            const column = state.getIn(['column', 'value']);
            if (column) {
                const colDef = ruleHelpers.getColumnDef(column);

                if (ruleType) {
                    const colType = colDef.type;
                    const settings = ruleHelpers.primitiveRuleTypes[colType][ruleType];
                    settings.validate(state, colDef);
                }
            } else {
                state.setIn(['column', 'error'], t('fieldMustBeSelected'));
            }
        }
    }

    populateRuleDefaults(mutStateData) {
        const ruleHelpers = this.ruleHelpers;
        const type = mutStateData.getIn(['type','value']);

        if (!ruleHelpers.isCompositeRuleType(type)) {
            const column = mutStateData.getIn(['column', 'value']);

            if (column) {
                const colDef = ruleHelpers.getColumnDef(column);

                if (type) {
                    const colType = colDef.type;
                    const settings = ruleHelpers.primitiveRuleTypes[colType][type];
                    if (!settings) {
                        // The existing rule type does not fit the newly changed column. This resets the rule type chooser to "--- Select ---"
                        mutStateData.setIn(['type', 'value'], '');
                    }
                }
            }
        }
    }

    async closeForm() {
        if (this.isFormWithoutErrors()) {
            this.props.onClose();
        } else {
            this.showFormValidation();
        }
    }

    async deleteRule() {
        this.props.onDelete();
    }

    render() {
        const t = this.props.t;
        const rule = this.props.rule;
        const ruleHelpers = this.ruleHelpers;

        let ruleOptions = null;
        if (ruleHelpers.isCompositeRuleType(rule.type)) {
            ruleOptions = <Dropdown id="type" label={t('type')} options={ruleHelpers.getCompositeRuleTypeOptions()} />

        } else {
            const ruleColumnOptionsColumns = [
                { data: 1, title: t('name') },
                { data: 2, title: t('type') },
                { data: 3, title: t('mergeTag') }
            ];

            const ruleColumnOptions = ruleHelpers.fields.map(fld => [ fld.column, fld.name, this.fieldTypes[fld.type].label, fld.key || '' ]);

            const ruleColumnSelect = <TableSelect id="column" label={t('field')} data={ruleColumnOptions} columns={ruleColumnOptionsColumns} dropdown withHeader selectionLabelIndex={1} />;
            let ruleTypeSelect = null;
            let ruleSettings = null;

            const ruleColumn = this.getFormValue('column');
            if (ruleColumn) {
                const colDef = ruleHelpers.getColumnDef(ruleColumn);
                if (colDef) {
                    const colType = colDef.type;
                    const ruleTypeOptions = ruleHelpers.getPrimitiveRuleTypeOptions(colType);
                    ruleTypeOptions.unshift({ key: '', label: t('select-1')});

                    if (ruleTypeOptions) {
                        ruleTypeSelect = <Dropdown id="type" label={t('type')} options={ruleTypeOptions} />

                        const ruleType = this.getFormValue('type');
                        if (ruleType) {
                            ruleSettings = ruleHelpers.primitiveRuleTypes[colType][ruleType].getForm(colDef);
                        }
                    }
                }
            }

            ruleOptions =
                <div>
                    {ruleColumnSelect}
                    {ruleTypeSelect}
                    {ruleSettings}
                </div>;
        }

        return (
            <div className={styles.ruleOptions}>
                <h3>{t('ruleOptions')}</h3>

                <Form stateOwner={this} onSubmitAsync={::this.closeForm}>

                    {ruleOptions}

                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="chevron-left" label={t('ok')}/>
                        <Button className="btn-primary" icon="trash-alt" label={t('delete')} onClickAsync={::this.deleteRule}/>
                    </ButtonRow>
                </Form>

            </div>
        );
    }
}