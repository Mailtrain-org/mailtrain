'use strict';

import React, {Component} from "react";
import PropTypes
    from "prop-types";
import {withTranslation} from '../../lib/i18n';
import {
    NavButton,
    requiresAuthenticatedUser,
    Title,
    Toolbar,
    withPageHelpers
} from "../../lib/page";
import {
    Button as FormButton,
    ButtonRow,
    Dropdown,
    Form,
    FormSendMethod,
    InputField,
    withForm
} from "../../lib/form";
import {withErrorHandling} from "../../lib/error-handling";
import {DeleteModalDialog} from "../../lib/modals";

import styles
    from "./CUD.scss";
import {DragDropContext} from "react-dnd";
import HTML5Backend
    from "react-dnd-html5-backend";
import TouchBackend
    from "react-dnd-touch-backend";
import SortableTree
    from "react-sortable-tree";
import 'react-sortable-tree/style.css';
import {
    ActionLink,
    Button,
    Icon
} from "../../lib/bootstrap-components";
import {getRuleHelpers} from "./helpers";
import RuleSettingsPane
    from "./RuleSettingsPane";
import {withComponentMixins} from "../../lib/decorator-helpers";

// https://stackoverflow.com/a/4819886/1601953
const isTouchDevice = !!('ontouchstart' in window || navigator.maxTouchPoints);

@DragDropContext(isTouchDevice ? TouchBackend : HTML5Backend)
@withComponentMixins([
    withTranslation,
    withForm,
    withErrorHandling,
    withPageHelpers,
    requiresAuthenticatedUser
])
export default class CUD extends Component {
    // The code below keeps the segment settings in form value. However, it uses it as a mutable datastructure.
    // After initilization, segment settings is never set using setState. This is OK we update the state.rulesTree
    // from the segment settings on relevant events (changes in the tree and closing the rule settings pane).

    constructor(props) {
        super(props);

        this.ruleHelpers = getRuleHelpers(props.t, props.fields);

        this.state = {
            rulesTree: this.getTreeFromRules([])
            // There is no ruleOptionsVisible here. We have 3 state logic for the visibility:
            //   Undef - not shown, True - shown with entry animation, False - hidden with exit animation
        };

        this.initForm();

        this.onRuleSettingsPaneUpdatedHandler = ::this.onRuleSettingsPaneUpdated;
        this.onRuleSettingsPaneCloseHandler = ::this.onRuleSettingsPaneClose;
        this.onRuleSettingsPaneDeleteHandler = ::this.onRuleSettingsPaneDelete;
    }

    static propTypes = {
        action: PropTypes.string.isRequired,
        list: PropTypes.object,
        fields: PropTypes.array,
        entity: PropTypes.object
    }

    getRulesFromTree(tree) {
        const rules = [];

        for (const node of tree) {
            const rule = node.rule;

            if (this.ruleHelpers.isCompositeRuleType(rule.type)) {
                rule.rules = this.getRulesFromTree(node.children);
            }

            rules.push(rule);
        }

        return rules;
    }

    getTreeFromRules(rules) {
        const ruleHelpers = this.ruleHelpers;

        const tree = [];
        for (const rule of rules) {
            const ruleTypeSettings = ruleHelpers.getRuleTypeSettings(rule);
            const title = ruleTypeSettings ? ruleTypeSettings.treeLabel(rule) : this.props.t('newRule');

            tree.push({
                rule,
                title,
                expanded: true,
                children: this.getTreeFromRules(rule.rules || [])
            });
        }

        return tree;
    }

    componentDidMount() {
        if (this.props.entity) {
            this.setState({
                rulesTree: this.getTreeFromRules(this.props.entity.settings.rootRule.rules)
            });

            this.getFormValuesFromEntity(this.props.entity, data => {
                data.rootRuleType = data.settings.rootRule.type;
                data.selectedRule = null; // Validation errors of the selected rule are attached to this which makes sure we don't submit the segment if the opened rule has errors
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
                rootRuleType: 'all',
                selectedRule: null
            });
        }
    }

    localValidateFormValues(state) {
        const t = this.props.t;

        if (!state.getIn(['name', 'value'])) {
            state.setIn(['name', 'error'], t('nameMustNotBeEmpty'));
        } else {
            state.setIn(['name', 'error'], null);
        }

        if (state.getIn(['selectedRule', 'value']) === null) {
            state.setIn(['selectedRule', 'error'], null);
        }
    }

    async doSubmit(stay) {
        const t = this.props.t;

        let sendMethod, url;
        if (this.props.entity) {
            sendMethod = FormSendMethod.PUT;
            url = `rest/segments/${this.props.list.id}/${this.props.entity.id}`
        } else {
            sendMethod = FormSendMethod.POST;
            url = `rest/segments/${this.props.list.id}`
        }

        try {
            this.disableForm();
            this.setFormStatusMessage('info', t('saving'));

            const submitSuccessful = await this.validateAndSendFormValuesToURL(sendMethod, url, data => {
                const keep = ['name', 'settings', 'originalHash'];

                data.settings.rootRule.type = data.rootRuleType;

                delete data.rootRuleType;
                delete data.selectedRule;
            });

            if (submitSuccessful) {
                if (stay) {
                    await this.getFormValuesFromURL(`rest/segments/${this.props.list.id}/${this.props.entity.id}`, data => {
                        data.rootRuleType = data.settings.rootRule.type;
                        data.selectedRule = null; // Validation errors of the selected rule are attached to this which makes sure we don't submit the segment if the opened rule has errors

                        this.setState({
                            rulesTree: this.getTreeFromRules(data.settings.rootRule.rules)
                        });
                    });
                    this.enableForm();
                    this.setFormStatusMessage('success', t('segmentSaved'));
                } else {
                    this.navigateToWithFlashMessage(`/lists/${this.props.list.id}/segments`, 'success', t('segmentSaved'));
                }
            } else {
                this.enableForm();
                this.setFormStatusMessage('warning', t('thereAreErrorsInTheFormPleaseFixThemAnd'));
            }
        } catch (error) {
            throw error;
        }
    }

    async submitAndStay() {
        await this.formHandleChangedError(async () => await this.doSubmit(true));
    }

    async submitAndLeave() {
        await this.formHandleChangedError(async () => await this.doSubmit(false));
    }

    onRulesChanged(rulesTree) {
        // This assumes that !this.state.ruleOptionsVisible
        this.getFormValue('settings').rootRule.rules = this.getRulesFromTree(rulesTree);

        this.setState({
            rulesTree
        })
    }

    showRuleOptions(rule) {
        this.updateFormValue('selectedRule', rule);

        this.setState({
            ruleOptionsVisible: true
        });
    }

    onRuleSettingsPaneClose() {
        this.updateFormValue('selectedRule', null);

        this.setState({
            ruleOptionsVisible: false,
            rulesTree: this.getTreeFromRules(this.getFormValue('settings').rootRule.rules)
        });
    }

    onRuleSettingsPaneDelete() {
        const selectedRule = this.getFormValue('selectedRule');
        this.updateFormValue('selectedRule', null);

        this.setState({
            ruleOptionsVisible: false,
        });

        this.deleteRule(selectedRule);
    }

    onRuleSettingsPaneUpdated(hasErrors) {
        this.setState(previousState => ({
            formState: previousState.formState.setIn(['data', 'selectedRule', 'error'], hasErrors)
        }));
    }

    addRule(rule) {
        if (!this.state.ruleOptionsVisible) {
            const rules = this.getFormValue('settings').rootRule.rules;
            rules.push(rule);

            this.updateFormValue('selectedRule', rule);

            this.setState({
                ruleOptionsVisible: true,
                rulesTree: this.getTreeFromRules(rules)
            });
        }
    }

    async addCompositeRule() {
        this.addRule({
            type: 'all',
            rules: []
        });
    }

    async addPrimitiveRule() {
        this.addRule({
            type: null  // Null type means a primitive rule where the type has to be chosen based on the chosen column
        });
    }

    deleteRule(ruleToDelete) {
        let finishedSearching = false;

        function childrenWithoutRule(rules) {
            const newRules = [];

            for (const rule of rules) {
                if (finishedSearching) {
                    newRules.push(rule);

                } else if (rule !== ruleToDelete) {
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

        const rules = childrenWithoutRule(this.getFormValue('settings').rootRule.rules);

        this.getFormValue('settings').rootRule.rules = rules;

        this.setState({
            rulesTree: this.getTreeFromRules(rules)
        });
    }


    render() {
        const t = this.props.t;
        const isEdit = !!this.props.entity;
        const selectedRule = this.getFormValue('selectedRule');
        const ruleHelpers = this.ruleHelpers;

        let ruleOptionsVisibilityClass = '';
        if ('ruleOptionsVisible' in this.state) {
            if (this.state.ruleOptionsVisible) {
                ruleOptionsVisibilityClass = ' ' + styles.ruleOptionsVisible;
            } else {
                ruleOptionsVisibilityClass = ' ' + styles.ruleOptionsHidden;
            }
        }

        return (

            <div>
                {isEdit &&
                    <DeleteModalDialog
                        stateOwner={this}
                        visible={this.props.action === 'delete'}
                        deleteUrl={`rest/segments/${this.props.list.id}/${this.props.entity.id}`}
                        backUrl={`/lists/${this.props.list.id}/segments/${this.props.entity.id}/edit`}
                        successUrl={`/lists/${this.props.list.id}/segments`}
                        deletingMsg={t('deletingSegment')}
                        deletedMsg={t('segmentDeleted')}/>
                }

                <Title>{isEdit ? t('editSegment') : t('createSegment')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitAndLeave}>
                    {isEdit ?
                        <ButtonRow format="wide" className={`col-xs-12 ${styles.toolbar}`}>
                            <FormButton type="submit" className="btn-primary" icon="check" label={t('saveAndStay')} onClickAsync={::this.submitAndStay}/>
                            <FormButton type="submit" className="btn-primary" icon="check" label={t('saveAndLeave')}/>

                            <NavButton className="btn-danger" icon="trash-alt" label={t('delete')} linkTo={`/lists/${this.props.list.id}/segments/${this.props.entity.id}/delete`}/>
                        </ButtonRow>
                    :
                        <ButtonRow format="wide" className={`col-xs-12 ${styles.toolbar}`}>
                            <FormButton type="submit" className="btn-primary" icon="check" label={t('save')}/>
                        </ButtonRow>
                    }

                    <h3>{t('segmentOptions')}</h3>

                    <InputField id="name" label={t('name')} />
                    <Dropdown id="rootRuleType" label={t('toplevelMatchType')} options={ruleHelpers.getCompositeRuleTypeOptions()} />
                </Form>

                <hr />

                <div className={styles.rulePane + ruleOptionsVisibilityClass}>
                    <div className={styles.leftPane}>
                        <div className={styles.leftPaneInner}>
                            <Toolbar>
                                <Button className="btn-primary" label={t('addCompositeRule')} onClickAsync={::this.addCompositeRule}/>
                                <Button className="btn-primary" label={t('addRule')} onClickAsync={::this.addPrimitiveRule}/>
                            </Toolbar>

                            <h3>{t('rules')}</h3>

                            <div className="clearfix"/>

                            <div className={styles.ruleTree}>
                                <SortableTree
                                    treeData={this.state.rulesTree}
                                    onChange={rulesTree => this.onRulesChanged(rulesTree)}
                                    isVirtualized={false}
                                    canDrop={ data => !data.nextParent || (ruleHelpers.isCompositeRuleType(data.nextParent.rule.type)) }
                                    generateNodeProps={data => ({
                                        buttons: [
                                            <ActionLink onClickAsync={async () => !this.state.ruleOptionsVisible && this.showRuleOptions(data.node.rule)} className={styles.ruleActionLink}><Icon icon="edit" title={t('edit')}/></ActionLink>,
                                            <ActionLink onClickAsync={async () => !this.state.ruleOptionsVisible && this.deleteRule(data.node.rule)} className={styles.ruleActionLink}><Icon icon="trash-alt" title={t('delete')}/></ActionLink>
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
                            {selectedRule &&
                                <RuleSettingsPane rule={selectedRule} fields={this.props.fields} onChange={this.onRuleSettingsPaneUpdatedHandler} onClose={this.onRuleSettingsPaneCloseHandler} onDelete={this.onRuleSettingsPaneDeleteHandler} forceShowValidation={this.isFormValidationShown()}/>}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}