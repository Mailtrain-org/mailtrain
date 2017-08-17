'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate, Trans } from 'react-i18next';
import {requiresAuthenticatedUser, withPageHelpers, Title, NavButton, Toolbar} from '../../lib/page';
import {
    withForm, Form, FormSendMethod, InputField, ButtonRow, Button, Fieldset, Dropdown, TreeTableSelect
} from '../../lib/form';
import { withErrorHandling, withAsyncErrorHandler } from '../../lib/error-handling';
import {DeleteModalDialog} from "../../lib/delete";
import interoperableErrors from '../../../../shared/interoperable-errors';

import styles from './CUD.scss';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import TouchBackend from 'react-dnd-touch-backend';
import SortableTree from 'react-sortable-tree';
import {ActionLink, Icon} from "../../lib/bootstrap-components";
import { getFieldTypes } from '../fields/field-types';

// https://stackoverflow.com/a/4819886/1601953
const isTouchDevice = !!('ontouchstart' in window || navigator.maxTouchPoints);

@DragDropContext(isTouchDevice ? TouchBackend : HTML5Backend)
@translate()
@withForm
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class CUD extends Component {
    constructor(props) {
        super(props);

        const t = props.t;

        this.fieldTypes = getFieldTypes(t);

        this.predefColumns = [
            {
                column: 'email',
                name: t('Email address'),
                type: 'text',
                tag: 'EMAIL'
            },
            {
                column: 'opt_in_country',
                name: t('Signup country'),
                type: 'text'
            },
            {
                column: 'created',
                name: t('Sign up date'),
                type: 'date'
            },
            {
                column: 'latest_open',
                name: t('Latest open'),
                type: 'date'
            },
            {
                column: 'latest_click',
                name: t('Latest click'),
                type: 'date'
            }
        ];

        this.compositeRuleTypeOptions = [
            { key: 'all', label: t('All rules must match')},
            { key: 'some', label: t('At least one rule must match')},
            { key: 'none', label: t('No rule may match')}
        ];

        this.compositeRuleTypes = {
            all: true,
            some: true,
            none: true
        };

        this.primitiveRuleTypeOptions = {
            text: [
                { key: 'eq', label: t('Equal to')},
                { key: 'like', label: t('Match (with SQL LIKE)')},
                { key: 're', label: t('Match (with regular expressions)')},
                { key: 'lt', label: t('Alphabetically before')},
                { key: 'le', label: t('Alphabetically before or equal to')},
                { key: 'gt', label: t('Alphabetically after')},
                { key: 'ge', label: t('Alphabetically after or equal to')}
            ],
            website: [
                { key: 'eq', label: t('Equal to')},
                { key: 'like', label: t('Match (with SQL LIKE)')},
                { key: 're', label: t('Match (with regular expressions)')}
            ],
            number: [
                { key: 'eq', label: t('Equal to')},
                { key: 'lt', label: t('Less than')},
                { key: 'le', label: t('Less than or equal to')},
                { key: 'gt', label: t('Greater than')},
                { key: 'ge', label: t('Greater than or equal to')}
            ],
            birthday: [
                { key: 'eq', label: t('On')},
                { key: 'lt', label: t('Before')},
                { key: 'le', label: t('Before or on')},
                { key: 'gt', label: t('After')},
                { key: 'ge', label: t('After or on')},
                { key: 'eqNowPlusDays', label: t('On x-th day before/after now')},
                { key: 'ltNowPlusDays', label: t('Before x-th day before/after now')},
                { key: 'leNowPlusDays', label: t('Before or on x-th day before/after now')},
                { key: 'gtNowPlusDays', label: t('After x-th day before/after now')},
                { key: 'geNowPlusDays', label: t('After or on x-th day before/after now')},
            ],
            date: [
                { key: 'eq', label: t('On')},
                { key: 'lt', label: t('Before')},
                { key: 'le', label: t('Before or on')},
                { key: 'gt', label: t('After')},
                { key: 'ge', label: t('After or on')},
                { key: 'eqNowPlusDays', label: t('On x-th day before/after now')},
                { key: 'ltNowPlusDays', label: t('Before x-th day before/after now')},
                { key: 'leNowPlusDays', label: t('Before or on x-th day before/after now')},
                { key: 'gtNowPlusDays', label: t('After x-th day before/after now')},
                { key: 'geNowPlusDays', label: t('After or on x-th day before/after now')},
            ],
            option: [
                { key: 'isTrue', label: t('Is selected')},
                { key: 'isFalse', label: t('Is not selected')}
            ],
            'radio-enum': [
                { key: 'eq', label: t('Key equal to')},
                { key: 'like', label: t('Key match (with SQL LIKE)')},
                { key: 're', label: t('Key match (with regular expressions)')},
                { key: 'lt', label: t('Key alphabetically before')},
                { key: 'le', label: t('Key alphabetically before or equal to')},
                { key: 'gt', label: t('Key alphabetically after')},
                { key: 'ge', label: t('Key alphabetically after or equal to')}
            ],
            'dropdown-enum': [
                { key: 'eq', label: t('Key equal to')},
                { key: 'like', label: t('Key match (with SQL LIKE)')},
                { key: 're', label: t('Key match (with regular expressions)')},
                { key: 'lt', label: t('Key alphabetically before')},
                { key: 'le', label: t('Key alphabetically before or equal to')},
                { key: 'gt', label: t('Key alphabetically after')},
                { key: 'ge', label: t('Key alphabetically after or equal to')}
            ]
        };
        
        const stringValueSettings = {
            form: <InputField id="ruleValue" label={t('Value')} />,
            getFormData: rule => ({
                ruleValue: rule.value
            }),
            assignRuleSettings: rule => {
                rule.value = this.getFormValue('ruleValue');
            },
            localValidateForm: state => {
                if (!state.getIn(['ruleValue', 'value'])) {
                    state.setIn(['ruleValue', 'error'], t('Value must not be empty'));
                } else {
                    state.setIn(['ruleValue', 'error'], null);
                }
            }
        };

        const numberValueSettings = {
            form: <InputField id="value" label={t('Value')} />
        };

        const birthdayValueSettings = {
            form: <InputField id="value" label={t('Value')} /> // FIXME
        };

        const birthdayRelativeValueSettings = {
            form: <InputField id="value" label={t('Value')} /> // FIXME
        };

        const dateValueSettings = {
            form: <InputField id="value" label={t('Value')} /> // FIXME
        };

        const dateRelativeValueSettings = {
            form: <InputField id="value" label={t('Value')} /> // FIXME
        };

        const optionValueSettings = {
            form: null
        };


        this.primitiveRuleTypes = {
            text: {
                eq: stringValueSettings,
                like: stringValueSettings,
                re: stringValueSettings,
                lt: stringValueSettings,
                le: stringValueSettings,
                gt: stringValueSettings,
                ge: stringValueSettings
            },
            website: {
                eq: stringValueSettings,
                like: stringValueSettings,
                re: stringValueSettings,
            },
            number: {
                eq: numberValueSettings,
                lt: numberValueSettings,
                le: numberValueSettings,
                gt: numberValueSettings,
                ge: numberValueSettings
            },
            birthday: {
                eq: birthdayValueSettings,
                lt: birthdayValueSettings,
                le: birthdayValueSettings,
                gt: birthdayValueSettings,
                ge: birthdayValueSettings,
                eqNowPlusDays: birthdayRelativeValueSettings,
                ltNowPlusDays: birthdayRelativeValueSettings,
                leNowPlusDays: birthdayRelativeValueSettings,
                gtNowPlusDays: birthdayRelativeValueSettings,
                geNowPlusDays: birthdayRelativeValueSettings
            },
            date: {
                eq: dateValueSettings,
                lt: dateValueSettings,
                le: dateValueSettings,
                gt: dateValueSettings,
                ge: dateValueSettings,
                eqNowPlusDays: dateRelativeValueSettings,
                ltNowPlusDays: dateRelativeValueSettings,
                leNowPlusDays: dateRelativeValueSettings,
                gtNowPlusDays: dateRelativeValueSettings,
                geNowPlusDays: dateRelativeValueSettings
            },
            option: {
                isTrue: optionValueSettings,
                isFale: optionValueSettings
            },
            'radio-enum': {
                eq: stringValueSettings,
                like: stringValueSettings,
                re: stringValueSettings,
                lt: stringValueSettings,
                le: stringValueSettings,
                gt: stringValueSettings,
                ge: stringValueSettings
            },
            'dropdown-enum': {
                eq: stringValueSettings,
                like: stringValueSettings,
                re: stringValueSettings,
                lt: stringValueSettings,
                le: stringValueSettings,
                gt: stringValueSettings,
                ge: stringValueSettings
            }
        };


        this.state = {
            rulesTree: this.getTreeFromRules([])
            // There is no ruleOptionsVisible here. We have 3 state logic for the visibility:
            //   Undef - not shown, True - shown with entry animation, False - hidden with exit animation
        };

        this.initForm();
    }

    static propTypes = {
        action: PropTypes.string.isRequired,
        list: PropTypes.object,
        fields: PropTypes.array,
        entity: PropTypes.object
    }

    getColumnType(column) {
        const field = this.props.fields.find(fld => x.column === column);
        if (field) {
            return field.type;
        }
    }

    getRulesFromTree(tree) {
        const rules = [];
        for (const node of tree) {
            const rule = node.rule;
            rule.rules = this.getRulesFromTree(node.children);
            rules.push(rule);
        }

        return rules;
    }

    getTreeFromRules(rules) {
        const tree = [];
        for (const rule of rules) {
            let title, subtitle;

            title = rule.type; // FIXME
            subtitle = null;

            tree.push({
                rule,
                title,
                subtitle,
                expanded: true,
                children: this.getTreeFromRules(rule.rules || [])
            });
        }

        return tree;
    }

    assignRuleSettings(rule) {
        // This assumes that the rule form has successfully passed validation

        rule.type = this.getFormValue('ruleType');

        if (rule.type in !this.compositeRuleTypes) {
            rule.column = this.getFormValue('ruleColumn');

            const colType = this.getColumnType(rule.column);
            if (colType) {
                this.primitiveRuleTypes[colType][rule.type].assignRuleSettings(rule);
            }
        }
    }

    getFormData(rule) {
        if (rule.type in !this.compositeRuleTypes) {
            let data;
            const colType = this.getColumnType(rule.column);
            if (colType) { // getFormData is called also from addRule, which means the rule may not have a column selected
                data = this.primitiveRuleTypes[colType][rule.type].getFormData(rule);
            } else {
                data = {};
            }

            data.ruleType = rule.type;
            data.ruleColumn = rule.column;

        } else {
            return {
                ruleType: rule.type
            };
        }
    }

    componentDidMount() {
        if (this.props.entity) {
            this.setState({
                rulesTree: this.getTreeFromRules(this.props.entity.settings.rootRule.rules)
            });

            this.getFormValuesFromEntity(this.props.entity, data => {
                data.rootRuleType = data.settings.rootRule.type;
            });

        } else {
            this.populateFormValues({
                name: '',
                settings: {
                    rootRule: {
                        type: 'all',
                        rules: []
                    }
                },
                rootRuleType: 'all'
            });
        }
    }

    localValidateFormValues(state) {
        const t = this.props.t;

        if (!state.getIn(['name', 'value'])) {
            state.setIn(['name', 'error'], t('Name must not be empty'));
        } else {
            state.setIn(['name', 'error'], null);
        }

        // FIXME - validate rule
    }

    localValidateSelectedRule() {

    }

    async doSubmit(stay) {
        const t = this.props.t;

        if (!this.localValidateSelectedRule()) {
            // FIXME
        }

        let sendMethod, url;
        if (this.props.entity) {
            sendMethod = FormSendMethod.PUT;
            url = `/rest/segments/${this.props.list.id}/${this.props.entity.id}`
        } else {
            sendMethod = FormSendMethod.POST;
            url = `/rest/segments/${this.props.list.id}`
        }

        try {
            this.disableForm();
            this.setFormStatusMessage('info', t('Saving ...'));

            const submitSuccessful = await this.validateAndSendFormValuesToURL(sendMethod, url, data => {
                const keep = ['name', 'settings', 'originalHash'];

                if (this.state.selectedRule) {
                    this.assignRuleSettings(this.state.selectedRule);
                }

                data.settings.rootRule.type = data.rootRuleType;

                for (const key in data) {
                    if (!keep.includes(key)) {
                        delete data[key];
                    }
                }
            });

            if (submitSuccessful) {
                if (stay) {
                    await this.loadFormValues();
                    this.enableForm();
                    this.setFormStatusMessage('success', t('Segment saved'));
                } else {
                    this.navigateToWithFlashMessage(`/lists/${this.props.list.id}/segments`, 'success', t('Segment saved'));
                }
            } else {
                this.enableForm();
                this.setFormStatusMessage('warning', t('There are errors in the form. Please fix them and submit again.'));
            }
        } catch (error) {
            if (error instanceof interoperableErrors.DependencyNotFoundError) {
                this.setFormStatusMessage('danger',
                    <span>
                        <strong>{t('Your updates cannot be saved.')}</strong>{' '}
                        {t('It seems that another field upon which sort field order was established has been deleted in the meantime. Refresh your page to start anew. Please note that your changes will be lost.')}
                    </span>
                );
                return;
            }

            throw error;
        }
    }

    async submitAndStay() {
        await this.formHandleChangedError(async () => await this.doSubmit(true));
    }

    async submitAndLeave() {
        await this.formHandleChangedError(async () => await this.doSubmit(false));
    }

    async onRuleDelete(data) {
        let finishedSearching = false;

        function childrenWithoutRule(rules) {
            const newRules = [];

            for (const rule of rules) {
                if (finishedSearching) {
                    newRules.push(rule);

                } else if (rule !== data.node.rule) {
                    const newRule = Object.assign({}, rule);

                    if (rule.rules) {
                        newRule.rules = childrenWithoutRule(rule.rules);
                    }

                    newRules.push(newRule);

                } else {
                    finishedSearching = true;
                }
            }

            return newRules;
        }

        if (!this.state.ruleOptionsVisible) {
            const rules = childrenWithoutRule(this.state.rules);

            this.setState({
                rules,
                rulesTree: this.getTreeFromRules(rules)
            });
        }
    }

    async showRuleOptions(data) {
        const rule = data.node.rule;

        this.populateFormValues(this.getFormData(rule));

        this.setState({
            ruleOptionsVisible: true,
            selectedRule: rule
        });
    }

    async hideRuleOptions() {
        const rule = this.state.selectedRule;

        // FIXME validate rule settings and if it is valid, do the rest

        this.assignRuleSettings(rule); // This changes the rule in the state without notifying. Although this is an anti-pattern for React, this behavior is OK here because we don't want to notify anyone.

        this.setState({
            ruleOptionsVisible: false,
            selectedRule: null,
            rulesTree: this.getTreeFromRules(this.state.rules)
        });
    }

    async onRulesChanged(rulesTree) {
        // This assumes that !this.state.ruleOptionsVisible
        this.getFormValue('settings').rootRule.rules = this.getRulesFromTree(rulesTree);

        this.setState({
            rulesTree
        })
    }

    async addCompositeRule() {
        if (!this.state.ruleOptionsVisible) {
            const rule = {
                type: 'all',
                rules: []
            };

            const rules = this.getFormValue('settings').rootRule.rules;
            rules.push(rule);

            this.setState({
                rulesTree: this.getTreeFromRules(rules)
            });
        }
    }

    async addRule() {
        if (!this.state.ruleOptionsVisible) {
            const rule = {
                type: null  // Null type means a primitive rule where the type has to be chosen based on the chosen column
            };

            const rules = this.getFormValue('settings').rootRule.rules;
            rules.push(rule);

            this.populateFormValues(this.getFormData(rule));

            this.setState({
                ruleOptionsVisible: true,
                selectedRule: rule,
                rulesTree: this.getTreeFromRules(rules)
            });
        }
    }

    render() {
        const t = this.props.t;
        const isEdit = !!this.props.entity;
        const selectedRule = this.state.selectedRule;

        let ruleOptionsVisibilityClass = '';
        if ('ruleOptionsVisible' in this.state) {
            if (this.state.ruleOptionsVisible) {
                ruleOptionsVisibilityClass = ' ' + styles.ruleOptionsVisible;
            } else {
                ruleOptionsVisibilityClass = ' ' + styles.ruleOptionsHidden;
            }
        }

        let ruleOptions = null;
        if (selectedRule) {
            if (selectedRule.type in this.compositeRuleTypes) {
                ruleOptions = <Dropdown id="ruleType" label={t('Type')} options={this.compositeRuleTypeOptions} />
            }
            else {

                const ruleColumnOptionsColumns = [
                    { data: 1, title: t('Name') },
                    { data: 2, title: t('Type') },
                    { data: 3, title: t('Merge Tag') }
                ];

                const ruleColumnOptions = [
                    ...this.predefColumns.map(fld => [ fld.column, fld.name, this.fieldTypes[fld.type], fld.tag || '' ]),
                    ...this.props.fields.filter(fld => fld.type in this.primitiveRuleTypes).map(fld => [ fld.column, fld.name, this.fieldTypes[fld.type], fld.tag || '' ])
                ];

                const ruleColumnSelect = <TableSelect id="ruleColumn" label={t('Field')} data={ruleColumnOptions} columns={ruleColumnOptionsColumns} dropdown withHeader />;
                let ruleTypeSelect = null;
                let ruleSettings = null;

                const ruleColumn = this.getFormValue('ruleColumn');
                if (ruleColumn) {
                    const colType = this.getColumnType(ruleColumn);
                    if (colType) {
                        const ruleTypeOptions = this.primitiveRuleTypeOptions[colType];

                        if (ruleTypeOptions) {
                            ruleTypeSelect = <Dropdown id="ruleType" label={t('Type')} options={ruleTypeOptions} />

                            const ruleType = this.getFormValue('ruleType');
                            if (ruleType) {
                                ruleSettings = this.state.primitiveRuleTypes[colType][ruleType].form;
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
        }

        return (

            <div>
                {isEdit &&
                    <DeleteModalDialog
                        stateOwner={this}
                        visible={this.props.action === 'delete'}
                        deleteUrl={`/rest/segments/${this.props.list.id}/${this.props.entity.id}`}
                        cudUrl={`/lists/segments/${this.props.list.id}/${this.props.entity.id}/edit`}
                        listUrl={`/lists/segments/${this.props.list.id}`}
                        deletingMsg={t('Deleting segment ...')}
                        deletedMsg={t('Segment deleted')}/>
                }

                <Title>{isEdit ? t('Edit Segment') : t('Create Segment')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitAndLeave}>
                    <ButtonRow format="wide" className={`col-xs-12 ${styles.toolbar}`}>
                        <Button type="submit" className="btn-primary" icon="ok" label={t('Save and Stay')} onClickAsync={::this.submitAndStay}/>
                        <Button type="submit" className="btn-primary" icon="ok" label={t('Save and Leave')}/>

                        {isEdit && <NavButton className="btn-danger" icon="remove" label={t('Delete')} linkTo={`/lists/fields/${this.props.list.id}/${this.props.entity.id}/delete`}/>}
                    </ButtonRow>

                    <h3>{t('Segment Options')}</h3>

                    <InputField id="name" label={t('Name')} />
                    <Dropdown id="rootRuleType" label={t('Toplevel match type')} options={this.compositeRuleTypeOptions} />

                    <hr />

                    <div className={styles.rulePane + ruleOptionsVisibilityClass}>
                        <div className={styles.leftPane}>
                            <div className={styles.leftPaneInner}>
                                <Toolbar>
                                    <Button className="btn-primary" label={t('Add Composite Rule')} onClickAsync={::this.addCompositeRule}/>
                                    <Button className="btn-primary" label={t('Add Rule')} onClickAsync={::this.addRule}/>
                                </Toolbar>

                                <h3>{t('Rules')}</h3>

                                <div className="clearfix"/>

                                <div className={styles.ruleTree}>
                                    <SortableTree
                                        treeData={this.state.rulesTree}
                                        onChange={rulesTree => this.onRulesChanged(rulesTree)}
                                        isVirtualized={false}
                                        canDrop={ data => !data.nextParent || (data.nextParent.rule.type in this.compositeRuleTypes) }
                                        generateNodeProps={data => ({
                                            buttons: [
                                                <ActionLink onClickAsync={async () => await this.showRuleOptions(data)} className={styles.ruleActionLink}><Icon name="edit"/></ActionLink>,
                                                <ActionLink onClickAsync={async () => await this.onRuleDelete(data)} className={styles.ruleActionLink}><Icon name="remove"/></ActionLink>
                                            ]
                                        })}
                                    />
                                </div>
                            </div>

                            <div className={styles.leftPaneOverlay} />

                            <div className={styles.paneDivider}>
                                <div className={styles.paneDividerSolidBackground}/>
                            </div>
                        </div>

                        <div className={styles.rightPane}>
                            <div className={styles.rightPaneInner}>
                                <div className={styles.ruleOptions}>
                                    <h3>{t('Rule Options')}</h3>

                                    {ruleOptions}

                                    <ButtonRow>
                                        <Button className="btn-primary" icon="chevron-left" label={t('Back')} onClickAsync={::this.hideRuleOptions}/>
                                    </ButtonRow>
                                </div>
                            </div>
                        </div>
                    </div>
                </Form>
            </div>
        );
    }
}