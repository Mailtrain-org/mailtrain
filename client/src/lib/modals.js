'use strict';

import React, { Component } from 'react';
import axios, { HTTPMethod } from './axios';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import {
    Icon,
    ModalDialog
} from "./bootstrap-components";
import {getUrl} from "./urls";
import {withPageHelpers} from "./page";
import styles from './styles.scss';

@translate()
@withPageHelpers
export class RestActionModalDialog extends Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
        message: PropTypes.string.isRequired,
        stateOwner: PropTypes.object,
        visible: PropTypes.bool.isRequired,
        actionMethod: PropTypes.func.isRequired,
        actionUrl: PropTypes.string.isRequired,
        backUrl: PropTypes.string,
        successUrl: PropTypes.string,
        onBack: PropTypes.func,
        onSuccess: PropTypes.func,
        onPerformingAction: PropTypes.func,
        actionInProgressMsg:  PropTypes.string.isRequired,
        actionDoneMsg:  PropTypes.string.isRequired,
        onErrorAsync: PropTypes.func
    }

    async hideModal(isBack) {
        if (this.props.backUrl) {
            this.props.stateOwner.navigateTo(this.props.backUrl);
        } else {
            if (isBack) {
                this.props.onBack();
            } else {
                this.props.onPerformingAction();
            }
        }
    }

    async performAction() {
        const props = this.props;
        const t = props.t;
        const owner = props.stateOwner;

        await this.hideModal(false);

        try {
            if (!owner) {
                this.setFlashMessage('info', props.actionInProgressMsg);
            } else {
                owner.disableForm();
                owner.setFormStatusMessage('info', props.actionInProgressMsg);
            }

            await axios.method(props.actionMethod, getUrl(props.actionUrl));

            if (props.successUrl) {
                owner.navigateToWithFlashMessage(props.successUrl, 'success', props.actionDoneMsg);
            } else {
                props.onSuccess();
                this.setFlashMessage('success', props.actionDoneMsg);
            }
        } catch (err) {
            if (props.onErrorAsync) {
                await props.onErrorAsync(err);
            } else {
                throw err;
            }
        }
    }

    render() {
        const t = this.props.t;

        return (
            <ModalDialog hidden={!this.props.visible} title={this.props.title} onCloseAsync={() => this.hideModal(true)} buttons={[
                { label: t('No'), className: 'btn-primary', onClickAsync: () => this.hideModal(true) },
                { label: t('Yes'), className: 'btn-danger', onClickAsync: ::this.performAction }
            ]}>
                {this.props.message}
            </ModalDialog>
        );
    }
}

@translate()
export class DeleteModalDialog extends Component {
    static propTypes = {
        stateOwner: PropTypes.object,
        visible: PropTypes.bool.isRequired,
        deleteUrl: PropTypes.string.isRequired,
        backUrl: PropTypes.string,
        successUrl: PropTypes.string,
        name: PropTypes.string,
        onBack: PropTypes.func,
        onSuccess: PropTypes.func,
        onPerformingAction: PropTypes.func,
        deletingMsg:  PropTypes.string.isRequired,
        deletedMsg:  PropTypes.string.isRequired,
        onErrorAsync: PropTypes.func
    }

    render() {
        const t = this.props.t;
        const owner = this.props.stateOwner;
        const name = this.props.name !== undefined ? this.props.name : (owner ? owner.getFormValue('name') : '');

        return <RestActionModalDialog
            title={t('Confirm deletion')}
            message={t('Are you sure you want to delete "{{name}}"?', {name})}
            stateOwner={this.props.stateOwner}
            visible={this.props.visible}
            actionMethod={HTTPMethod.DELETE}
            actionUrl={this.props.deleteUrl} 
            backUrl={this.props.backUrl}
            successUrl={this.props.successUrl}
            onBack={this.props.onBack}
            onSuccess={this.props.onSuccess}
            onPerformingAction={this.props.onPerformingAction}
            actionInProgressMsg={this.props.deletingMsg}
            actionDoneMsg={this.props.deletedMsg}
            onErrorAsync={this.props.onErrorAsync}
        />
    }
}

export function tableDeleteDialogInit(owner) {
    owner.deleteDialogData = {};
    owner.state.deleteDialogShown = false;
}

export function tableDeleteDialogAddDeleteButton(actions, owner, perms, id, name) {
    const t = owner.props.t;

    if (!perms || perms.includes('delete')) {
        if (owner.deleteDialogData.id) {
            actions.push({
                label: <Icon className={styles.iconDisabled} icon="remove" title={t('Delete')}/>
            });
        } else {
            actions.push({
                label: <Icon icon="remove" title={t('Delete')}/>,
                action: () => {
                    owner.deleteDialogData = {name, id};
                    owner.setState({
                        deleteDialogShown: true
                    });
                    owner.table.refresh();
                }
            });
        }
    }
}

export function tableDeleteDialogRender(owner, deleteUrlBase, deletingMsg, deletedMsg) {
    function hide() {
        owner.deleteDialogData = {};
        owner.setState({ deleteDialogShown: false });
        owner.table.refresh();
    }

    return (
        <DeleteModalDialog
            visible={owner.state.deleteDialogShown}
            name={owner.deleteDialogData.name}
            deleteUrl={deleteUrlBase + '/' + owner.deleteDialogData.id}
            onBack={hide}
            onPerformingAction={() => owner.setState({ deleteDialogShown: false })}
            onSuccess={hide}
            deletingMsg={deletingMsg}
            deletedMsg={deletedMsg}
        />
    );
}
