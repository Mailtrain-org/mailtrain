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
import SortableTree from 'react-sortable-tree';
import {ActionLink, Icon} from "../../lib/bootstrap-components";

console.log(styles);

@translate()
@withForm
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class CUD extends Component {
    constructor(props) {
        super(props);

        this.compoundRuleTypes = [ 'all', 'some', 'one', 'none' ];

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


        this.state = {
            rules: sampleRules,
            rulesTree: this.getTreeFromRules(sampleRules)
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
            const rule = Object.assign({}, node.rule);
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
        console.log(data);
    }

    async onRuleOptions(data) {
        this.setState({
            ruleOptionsVisible: true
        });
    }

    async onRuleTree() {
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
                            <SortableTree
                                treeData={this.state.rulesTree}
                                onChange={rulesTree => this.onRulesChanged(rulesTree)}
                                isVirtualized={false}
                                canDrop={ data => !data.nextParent || this.compoundRuleTypes.includes(data.nextParent.rule.type) }
                                generateNodeProps={data => ({
                                    buttons: [
                                        <ActionLink onClickAsync={async () => await this.onRuleOptions(data)} className={styles.ruleActionLink}><Icon name="edit"/></ActionLink>,
                                        <ActionLink onClickAsync={async () => await this.onRuleDelete(data)} className={styles.ruleActionLink}><Icon name="remove"/></ActionLink>
                                    ]
                                })}
                            />

                            <div className={styles.leftPaneOverlay} />

                            <div className={styles.paneDivider}>
                                <div className={styles.paneDividerSolidBackground}/>
                            </div>
                        </div>

                        <div className={styles.rightPane}>
                            <div className={styles.rulePaneRightInner}>
                                <div className={styles.ruleOptions}>
                                    <h3>{t('Rule Options')}</h3>
                                    <InputField id="name" label={t('Name')}/>

                                    <ButtonRow>
                                        <Button className="btn-primary" icon="chevron-left" label={t('Back')} onClickAsync={::this.onRuleTree}/>
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