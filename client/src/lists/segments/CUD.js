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

import SortableTree from 'react-sortable-tree';
import { getRuleTreeNodeRenderer } from './RuleTreeNodeRenderer';

@translate()
@withForm
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class CUD extends Component {
    constructor(props) {
        super(props);

        this.compoundRuleTypes = [ 'all', 'some', 'none' ];

        const allRule = {
            type: 'all'
        };

        const otherRule = {
            type: 'eq'
        };

        this.state = {
            rules: [
                {
                    key: 'a',
                    title: 'A',
                    expanded: true,
                    rule: allRule,
                    children: [
                        {
                            key: 'aa',
                            title: 'AA',
                            expanded: true,
                            rule: allRule,
                            children: [
                                {
                                    key: 'aaa',
                                    title:
                                        <div><h4>sdfsdf</h4><div>xxx</div><div>yyy<NavButton label="ZZZ" linkTo="/lists"/></div></div>,
                                    rule: otherRule
                                },
                                {
                                    key: 'aab',
                                    title: 'AAB',
                                    subtitle: 'sdfwere',
                                    rule: otherRule
                                }
                            ]
                        },
                        {
                            key: 'ab',
                            title: 'AB',
                            expanded: true,
                            rule: allRule,
                            children: [
                                {
                                    key: 'aba',
                                    title: 'ABA',
                                    rule: otherRule
                                },
                                {
                                    key: 'abb',
                                    title: 'ABB',
                                    rule: otherRule
                                }
                            ]
                        }
                    ]
                },
                {
                    key: 'b',
                    title: 'B',
                    expanded: true,
                    rule: allRule,
                    children: [
                        {
                            key: 'ba',
                            title: 'BA',
                            expanded: true,
                            rule: allRule,
                            children: [
                                {
                                    key: 'baa',
                                    title: 'BAA',
                                    rule: otherRule
                                },
                                {
                                    key: 'bab',
                                    title: 'BAB',
                                    rule: otherRule
                                }
                            ]
                        },
                        {
                            key: 'bb',
                            title: 'BB',
                            expanded: true,
                            rule: allRule,
                            children: [
                                {
                                    key: 'bba',
                                    title: 'BBA',
                                    rule: otherRule
                                },
                                {
                                    key: 'bbb',
                                    title: 'BBB',
                                    rule: otherRule
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        this.initForm();
    }

    static propTypes = {
        action: PropTypes.string.isRequired,
        list: PropTypes.object,
        fields: PropTypes.array,
        entity: PropTypes.object
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

    onRuleSelectionClick(data) {
        this.setState({
            selectedRule: data.node.key
        });
    }

    render() {
        const t = this.props.t;
        const isEdit = !!this.props.entity;

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

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler} format="wide">
                    <ButtonRow format="wide" className="pull-right">
                        <Button type="submit" className="btn-primary" icon="ok" label={t('Save')}/>
                        {isEdit && <NavButton className="btn-danger" icon="remove" label={t('Delete')} linkTo={`/lists/fields/${this.props.list.id}/${this.props.entity.id}/delete`}/>}
                    </ButtonRow>

                    <h3>{t('Segment Options')}</h3>

                    <InputField id="name" label={t('Name')} format="wide"/>


                    <hr />

                    <div className="row">
                        <div className="col-md-6" >
                            <SortableTree
                                treeData={this.state.rules}
                                onChange={ rules => this.setState({rules}) }
                                isVirtualized={false}
                                nodeContentRenderer={getRuleTreeNodeRenderer({
                                    onClick: ::this.onRuleSelectionClick,
                                    isSelected: data => data.node.key === this.state.selectedRule
                                })}
                                canDrop={data => data.nextParent && this.compoundRuleTypes.includes(data.nextParent.rule.type)}
                            />
                        </div>
                        <div className="col-md-6">
                            <h3>{t('Selected Rule Options')}</h3>
                            <InputField id="name" label={t('Name')} format="wide" />
                        </div>
                    </div>
                </Form>
            </div>
        );
    }
}