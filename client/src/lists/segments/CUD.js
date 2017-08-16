'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate, Trans } from 'react-i18next';
import {requiresAuthenticatedUser, withPageHelpers, Title, NavButton, Toolbar} from '../../lib/page';
import {
    withForm, Form, FormSendMethod, InputField, ButtonRow, Button, Fieldset
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

        this.compoundRuleTypes = [ 'all', 'some', 'one', 'none' ];

/*
        const allRule = {
            type: 'all'
        };

        const otherRule = {
            type: 'eq'
        };

        const sampleRules = [
            {
                type: 'all',
                rules: [
                    {
                        type: 'some',
                        rules: [
                            {
                                type: 'eq',
                                value: 11
                            },
                            {
                                type: 'eq',
                                value: 9
                            }
                        ]
                    },
                    {
                        type: 'some',
                        rules: [
                            {
                                type: 'eq',
                                value: 3
                            },
                            {
                                type: 'eq',
                                value: 7
                            }
                        ]
                    }
                ]
            }
        ];
*/

        this.state = {
            rules: [],
            rulesTree: this.getTreeFromRules([])
        };

        this.initForm();
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

    componentDidMount() {
        if (this.props.entity) {
            this.getFormValuesFromEntity(this.props.entity, data => {
                // FIXME populate all others from settings
            });

        } else {
            this.populateFormValues({
                name: '',
                settingsJSON: ''
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

    }

    async submitHandler() {
        const t = this.props.t;

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
                // FIXME - make sure settings is correct and delete all others
            });

            if (submitSuccessful) {
                this.enableForm();
                this.setFormStatusMessage('success', t('Segment saved'));
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

    async onRuleDelete(data) {
        let finishedSearching = false;

        function childrenWithoutRule(rules) {
            console.log(rules);
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

        const rules = childrenWithoutRule(this.state.rules);
        console.log(rules);

        this.setState({
            rules,
            rulesTree: this.getTreeFromRules(rules)
        });
    }

    async showRuleOptions(data) {
        this.setState({
            ruleOptionsVisible: true
        });
    }

    async hideRuleOptions() {
        this.setState({
            ruleOptionsVisible: false
        });
    }

    async onRulesChanged(rulesTree) {
        this.setState({
            rulesTree,
            rules: this.getRulesFromTree(rulesTree)
        })
    }

    _addRule(type) {
        const rules = this.state.rules;

        rules.push({
            type,
            rules: []
        });

        this.setState({
            rules,
            rulesTree: this.getTreeFromRules(rules)
        });
    }

    async addCompositeRule() {
        this._addRule('all');
    }

    async addRule() {
        this._addRule('eq');
    }

    render() {
        const t = this.props.t;
        const isEdit = !!this.props.entity;

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
                        deleteUrl={`/rest/segments/${this.props.list.id}/${this.props.entity.id}`}
                        cudUrl={`/lists/segments/${this.props.list.id}/${this.props.entity.id}/edit`}
                        listUrl={`/lists/segments/${this.props.list.id}`}
                        deletingMsg={t('Deleting segment ...')}
                        deletedMsg={t('Segment deleted')}/>
                }

                <Title>{isEdit ? t('Edit Segment') : t('Create Segment')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <ButtonRow format="wide" className={`col-xs-12 ${styles.toolbar}`}>
                        <Button type="submit" className="btn-primary" icon="ok" label={t('Save')}/>
                        {isEdit && <NavButton className="btn-danger" icon="remove" label={t('Delete')} linkTo={`/lists/fields/${this.props.list.id}/${this.props.entity.id}/delete`}/>}
                    </ButtonRow>

                    <h3>{t('Segment Options')}</h3>

                    <InputField id="name" label={t('Name')}/>


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
                                        canDrop={ data => !data.nextParent || this.compoundRuleTypes.includes(data.nextParent.rule.type) }
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
                                    <InputField id="name" label={t('Name')}/>

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