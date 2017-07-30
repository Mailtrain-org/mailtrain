'use strict';

import React, { Component } from 'react';
import axios from './axios';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import {ModalDialog} from "./bootstrap-components";

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

    async hideDeleteModal() {
        this.props.stateOwner.navigateTo(this.props.cudUrl);
    }

    async performDelete() {
        const t = this.props.t;
        const owner = this.props.stateOwner;

        await this.hideDeleteModal();

        try {
            owner.disableForm();
            owner.setFormStatusMessage('info', this.props.deletingMsg);
            await axios.delete(this.props.deleteUrl);

            owner.navigateToWithFlashMessage(this.props.listUrl, 'success', this.props.deletedMsg);
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
        const owner = this.props.stateOwner;

        return (
            <ModalDialog hidden={!this.props.visible} title={t('Confirm deletion')} onCloseAsync={::this.hideDeleteModal} buttons={[
                { label: t('No'), className: 'btn-primary', onClickAsync: ::this.hideDeleteModal },
                { label: t('Yes'), className: 'btn-danger', onClickAsync: ::this.performDelete }
            ]}>
                {t('Are you sure you want to delete "{{name}}"?', {name: owner.getFormValue('name')})}
            </ModalDialog>
        );
    }
}


export {
    DeleteModalDialog
}
