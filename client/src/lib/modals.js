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
import interoperableErrors from '../../../shared/interoperable-errors';
import {Link} from "react-router-dom";

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
        onPerformingAction: PropTypes.func,
        onSuccess: PropTypes.func,

        actionInProgressMsg:  PropTypes.string.isRequired,
        actionDoneMsg:  PropTypes.string.isRequired,

        onErrorAsync: PropTypes.func
    }

    async hideModal(isBack) {
        if (this.props.backUrl) {
            this.navigateTo(this.props.backUrl);
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
                this.navigateToWithFlashMessage(props.successUrl, 'success', props.actionDoneMsg);
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
@withPageHelpers
export class DeleteModalDialog extends Component {
    constructor(props) {
        super(props);
        const t = props.t;

        this.entityTypeLabels = {
            'namespace': t('Namespace'),
            'list': t('List'),
            'customForm': t('Custom forms'),
            'campaign': t('Campaign'),
            'template': t('Template'),
            'sendConfiguration': t('Send configuration'),
            'report': t('Report'),
            'reportTemplate': t('Report template'),
            'mosaicoTemplate': t('Mosaico template')
        };
    }

    static propTypes = {
        visible: PropTypes.bool.isRequired,

        stateOwner: PropTypes.object,
        name: PropTypes.string,
        deleteUrl: PropTypes.string.isRequired,

        backUrl: PropTypes.string,
        successUrl: PropTypes.string,

        onBack: PropTypes.func,
        onPerformingAction: PropTypes.func,
        onSuccess: PropTypes.func,
        onFail: PropTypes.func,

        deletingMsg:  PropTypes.string.isRequired,
        deletedMsg:  PropTypes.string.isRequired
    }

    async onErrorAsync(err) {
        const t = this.props.t;

        if (err instanceof interoperableErrors.DependencyPresentError) {
            const owner = this.props.stateOwner;

            const name = this.props.name !== undefined ? this.props.name : (owner ? owner.getFormValue('name') : '');
            this.setFlashMessage('danger',
                <div>
                    <p>{t('Cannote delete "{{name}}" due to the following dependencies:', {name, nsSeparator: '|'})}</p>
                    <ul className={styles.dependenciesList}>
                    {err.data.dependencies.map(dep =>
                        dep.link ?
                            <li key={dep.link}><Link to={dep.link}>{this.entityTypeLabels[dep.entityTypeId]}: {dep.name}</Link></li>
                        : // if no dep.link is present, it means the user has no permission to view the entity, thus only id without the link is shown
                            <li key={dep.id}>{this.entityTypeLabels[dep.entityTypeId]}: [{dep.id}]</li>
                    )}
                    {err.data.andMore && <li>{t('... and more')}</li>}
                    </ul>
                </div>
            );

            window.scrollTo(0, 0); // This is to scroll up because the flash message appears on top and it's quite misleading if the delete fails and the message is not in the viewport

            if (this.props.onFail) {
                this.props.onFail();
            }

            if (owner) {
                owner.enableForm();
                owner.clearFormStatusMessage();
            }

        } else {
            throw err;
        }
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
            onPerformingAction={this.props.onPerformingAction}
            onSuccess={this.props.onSuccess}
            actionInProgressMsg={this.props.deletingMsg}
            actionDoneMsg={this.props.deletedMsg}
            onErrorAsync={::this.onErrorAsync}
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
            onFail={hide}
            deletingMsg={deletingMsg}
            deletedMsg={deletedMsg}
        />
    );
}
