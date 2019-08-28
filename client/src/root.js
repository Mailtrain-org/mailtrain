'use strict';

import './lib/public-path';

import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import i18n, {TranslationRoot, withTranslation} from './lib/i18n';
import account from './account/root';
import login from './login/root';
import blacklist from './blacklist/root';
import lists from './lists/root';
import namespaces from './namespaces/root';
import reports from './reports/root';
import campaigns from './campaigns/root';
import templates from './templates/root';
import users from './users/root';
import sendConfigurations from './send-configurations/root';
import settings from './settings/root';

import {DropdownLink, getLanguageChooser, NavDropdown, NavLink, NavActionLink, Section} from "./lib/page";
import {
    Form,
    withForm,
    CheckBox, 
    TreeTableSelect
} from './lib/form';

import mailtrainConfig from 'mailtrainConfig';
import Home from "./Home";
import {DropdownActionLink, Icon, ModalDialog} from "./lib/bootstrap-components";
import axios from './lib/axios';
import {withComponentMixins} from "./lib/decorator-helpers";
import PropTypes from 'prop-types';
import {requiresAuthenticatedUser,  withPageHelpers} from './lib/page';
import {withErrorHandling} from './lib/error-handling';
import {getUrl} from "./lib/urls";
import {withAsyncErrorHandler} from './lib/error-handling';

const topLevelMenuKeys = ['lists', 'templates', 'campaigns'];

if (mailtrainConfig.reportsEnabled) {
    topLevelMenuKeys.push('reports');
}


@withComponentMixins([
    withTranslation,
    withForm,
    withErrorHandling,
    withPageHelpers,
    requiresAuthenticatedUser
])
class PreviewNamespaceFilterModalDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {namespaceId: null, namespaceName: this.props.t("namespaceFilter")};
        this.initForm({
            leaveConfirmation: false
        });
    }

    static propTypes = {
        visible: PropTypes.bool.isRequired,
        onHide: PropTypes.func.isRequired,
    }

    localValidateFormValues(state) {
        const t = this.props.t;
        if (!state.getIn(['namespace', 'value']) && state.getIn(['namespaceFilterCheckboxEnabled', 'value'])) {
            state.setIn(['namespace', 'error'], t("namespaceHasToBeSelectedToApply"));
        } else {
            state.setIn(['namespace', 'error'], null);
        }
    }

    componentDidMount() {
        var enabled = false;
        const localStorage = window.localStorage;
        if(localStorage.getItem('namespaceFilterId')){
            enabled = true;
        }
        this.populateFormValues({
            namespace: localStorage.getItem('namespaceFilterName'),
            namespaceFilterCheckboxEnabled: enabled
        });
        this.loadTreeData();
    }

    @withAsyncErrorHandler
    async loadTreeData() {

            const response = await axios.get(getUrl('rest/namespaces-tree'));
            const data = response.data;
            for (const root of data) {
                root.expanded = true;
            }

            if (this.isComponentMounted()) {
                this.setState({
                    treeData: data
                });
            }
        
    }

    async setNamespaceFilterAsync() {
        const t = this.props.t;

        if(this.getFormValue('namespaceFilterCheckboxEnabled')){
            if(this.getFormValue('namespace')){
                const localStorage = window.localStorage;
                localStorage.setItem('namespaceFilterId', this.getFormValue('namespace'));
                const response = await axios.get(getUrl('rest/namespaces/' + this.getFormValue('namespace')));
                localStorage.setItem('namespaceFilterName', response.data.name);
                this.state.namespaceId = this.getFormValue('namespace');
                this.state.namespaceName = this.getFormValue('namespace');
                this.setFormStatusMessage('warning', null);
                this.props.onHide();
            }else{
                this.setFormStatusMessage('warning', t('namespaceMustNotBeEmpty'));
            }
        }else{
            const localStorage = window.localStorage;
            localStorage.removeItem('namespaceFilterId');
            localStorage.removeItem('namespaceFilterName');
            this.state.namespaceId = null;
            this.state.namespaceName = "Namespace filter";
            this.setFormStatusMessage('warning', null);
            this.props.onHide();
        }
        i18n.changeLanguage();//FIXME Using this temporarily because it produces re-render effect without language change 
    }

    async hideModal() {
        this.setFormStatusMessage('warning', null);
        this.props.onHide();
    }

    render() {
        const t = this.props.t;

        return (
            <ModalDialog hidden={!this.props.visible} title={t('namespaceFilter')} onCloseAsync={() => this.hideModal()} buttons={[
                { label: t('apply'), className: 'btn-primary', onClickAsync: ::this.setNamespaceFilterAsync },
                { label: t('close'), className: 'btn-danger', onClickAsync: ::this.hideModal }
            ]}>
                <Form stateOwner={this}>
                    <CheckBox id="namespaceFilterCheckboxEnabled" format="wide" text={t('enableNamespaceFilter')}></CheckBox>
                    {this.getFormValue('namespaceFilterCheckboxEnabled') && <TreeTableSelect id="namespace" format="wide" label={t('namespace')} data={this.state.treeData}/>}               
                </Form>
            </ModalDialog>
        );
    }
}

@withComponentMixins([
    withTranslation
])
class Root extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const t = this.props.t;

        let structure;

        // The MainMenu component is defined here in order to avoid recreating menu structure on every change in the main menu
        // This is because Root component depends only on the language, thus it is redrawn (and the structure is recomputed) only when the language changes
        class MainMenu extends Component {
            constructor(props) {
                super(props);
                this.state = {showModal: false};      
            }
            
            async logout() {
                await axios.post(getUrl('rest/logout'));
                window.location = getUrl();
            }

            async showNamespaceFilterModal() {
                this.showModal();
            }

            showModal() { 
                this.setState({
                    showModal: true
                });
            }

            async hideModal() {
                this.hide();
            }

            hide() { 
                this.setState({
                    showModal: false
                });
            }

            render() {
                const path = this.props.location.pathname;

                const topLevelItems = structure.children;

                const topLevelMenu = [];
                
                var namespaceFilter = null;

        
                if(mailtrainConfig.namespaceFilterEnabled){
                    const localStorage = window.localStorage;
                    if(localStorage.getItem('namespaceFilterId')){
                        namespaceFilter = <NavActionLink onClickAsync={::this.showNamespaceFilterModal}>{localStorage.getItem('namespaceFilterName')}</NavActionLink>;
                    }else{
                        namespaceFilter = <NavActionLink onClickAsync={::this.showNamespaceFilterModal}>{'Namespace filter'}</NavActionLink>;
                    }
                }
                
                for (const entryKey of topLevelMenuKeys) {
                    const entry = topLevelItems[entryKey];
                    const link = entry.link || entry.externalLink;

                    if (link && path.startsWith(link)) {
                        topLevelMenu.push(<NavLink key={entryKey} className="active" to={link}>{entry.title} <span className="sr-only">{t('current')}</span></NavLink>);
                    } else {
                        topLevelMenu.push(<NavLink key={entryKey} to={link}>{entry.title}</NavLink>);
                    }
                }

                if (mailtrainConfig.isAuthenticated) {
                    return (
                        <>  
                            <PreviewNamespaceFilterModalDialog
                                visible={this.state.showModal}
                                onHide={() => this.setState({showModal: false})}
                            />  
                            <ul className="navbar-nav mt-navbar-nav-left">
                                {topLevelMenu}
                                <NavDropdown label={t('administration')}>
                                    {mailtrainConfig.globalPermissions.displayManageUsers && <DropdownLink to="/users">{t('users')}</DropdownLink>}
                                    <DropdownLink to="/namespaces">{t('namespaces')}</DropdownLink>
                                    {mailtrainConfig.globalPermissions.manageSettings && <DropdownLink to="/settings">{t('globalSettings')}</DropdownLink>}
                                    <DropdownLink to="/send-configurations">{t('sendConfigurations')}</DropdownLink>
                                    {mailtrainConfig.globalPermissions.manageBlacklist && <DropdownLink to="/blacklist">{t('blacklist')}</DropdownLink>}
                                    <DropdownLink to="/account/api">{t('api')}</DropdownLink>
                                </NavDropdown>
                            </ul>
                            <ul className="navbar-nav mt-navbar-nav-right">
                                {namespaceFilter}
                                {getLanguageChooser(t)}
                                <NavDropdown menuClassName="dropdown-menu-right" label={mailtrainConfig.user.username} icon="user">
                                    <DropdownLink to="/account"><Icon icon='user'/> {t('account')}</DropdownLink>
                                    <DropdownActionLink onClickAsync={::this.logout}><Icon icon='sign-out-alt'/> {t('logOut')}</DropdownActionLink>
                                </NavDropdown>        
                            </ul>
                        </>
                    );
                } else {
                    return (
                        <>
                            <ul className="navbar-nav mt-navbar-nav-right">
                                {getLanguageChooser(t)}
                            </ul>
                        </>
                    );
                }
            }
        }

        structure = {
            title: t('home'),
            link: '/',
            panelComponent: Home,
            primaryMenuComponent: MainMenu,
            children: {
                ...login.getMenus(t),
                ...lists.getMenus(t),
                ...reports.getMenus(t),
                ...templates.getMenus(t),
                ...namespaces.getMenus(t),
                ...users.getMenus(t),
                ...blacklist.getMenus(t),
                ...account.getMenus(t),
                ...settings.getMenus(t),
                ...sendConfigurations.getMenus(t),
                ...campaigns.getMenus(t)
            }
        };

        return (
            <Section root='/' structure={structure}/>
        );
    }
}

export default function() {
    ReactDOM.render(<TranslationRoot><Root/></TranslationRoot>,document.getElementById('root'));
};


