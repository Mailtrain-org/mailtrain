'use strict';

import React, { Component } from 'react';
import axios, { HTTPMethod } from './axios';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import {ModalDialog} from "./bootstrap-components";

@translate()
class RestActionModalDialog extends Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
        message: PropTypes.string.isRequired,
        stateOwner: PropTypes.object.isRequired,
        visible: PropTypes.bool.isRequired,
        actionMethod: PropTypes.func.isRequired,
        actionUrl: PropTypes.string.isRequired,
        backUrl: PropTypes.string.isRequired,
        successUrl: PropTypes.string.isRequired,
        actionInProgressMsg:  PropTypes.string.isRequired,
        actionDoneMsg:  PropTypes.string.isRequired,
        onErrorAsync: PropTypes.func
    }

    async hideModal() {
        this.props.stateOwner.navigateTo(this.props.backUrl);
    }

    async performAction() {
        const t = this.props.t;
        const owner = this.props.stateOwner;

        await this.hideModal();

        try {
            owner.disableForm();
            owner.setFormStatusMessage('info', this.props.actionInProgressMsg);
            await axios.method(this.props.actionMethod, this.props.actionUrl);

            owner.navigateToWithFlashMessage(this.props.successUrl, 'success', this.props.actionDoneMsg);
        } catch (err) {
            if (this.props.onErrorAsync) {
                await this.props.onErrorAsync(err);
            } else {
                throw err;
            }
        }
    }

    render() {
        const t = this.props.t;

        return (
            <ModalDialog hidden={!this.props.visible} title={this.props.title} onCloseAsync={::this.hideModal} buttons={[
                { label: t('No'), className: 'btn-primary', onClickAsync: ::this.hideModal },
                { label: t('Yes'), className: 'btn-danger', onClickAsync: ::this.performAction }
            ]}>
                {this.props.message}
            </ModalDialog>
        );
    }
}

@translate()
class DeleteModalDialog extends Component {
    static propTypes = {
        stateOwner: PropTypes.object.isRequired,
        visible: PropTypes.bool.isRequired,
        deleteUrl: PropTypes.string.isRequired,
        cudUrl: PropTypes.string.isRequired,
        listUrl: PropTypes.string.isRequired,
        deletingMsg:  PropTypes.string.isRequired,
        deletedMsg:  PropTypes.string.isRequired,
        onErrorAsync: PropTypes.func
    }

    render() {
        const t = this.props.t;
        const owner = this.props.stateOwner;

        return <RestActionModalDialog
            title={t('Confirm deletion')}
            message={t('Are you sure you want to delete "{{name}}"?', {name: owner.getFormValue('name')})}
            stateOwner={this.props.stateOwner}
            visible={this.props.visible}
            actionMethod={HTTPMethod.DELETE}
            actionUrl={this.props.deleteUrl} 
            backUrl={this.props.cudUrl}
            successUrl={this.props.listUrl}
            actionInProgressMsg={this.props.deletingMsg}
            actionDoneMsg={this.props.deletedMsg}
            onErrorAsync={this.props.onErrorAsync}
        />
    }
}


export {
    ModalDialog,
    DeleteModalDialog,
    RestActionModalDialog
}
