'use strict';

import './lib/public-path';

import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {TranslationRoot, withTranslation} from './lib/i18n';
import account from './account/root';
import login from './login/root';
import blacklist from './blacklist/root';
import lists from './lists/root';
import namespaces from './namespaces/root';
import reports from './reports/root';
import campaigns from './campaigns/root';
import channels from './channels/root';
import templates from './templates/root';
import users from './users/root';
import sendConfigurations from './send-configurations/root';
import settings from './settings/root';

import {DropdownLink, getLanguageChooser, NavDropdown, NavLink, Section} from "./lib/page";

import mailtrainConfig from 'mailtrainConfig';
import Home from "./Home";
import {DropdownActionLink, Icon} from "./lib/bootstrap-components";
import axios from './lib/axios';
import {getUrl} from "./lib/urls";
import {withComponentMixins} from "./lib/decorator-helpers";
import Update from "./settings/Update";

const topLevelMenuKeys = ['Lists', 'Channels', 'Templates', 'Campaigns'];

if (mailtrainConfig.reportsEnabled) {
    topLevelMenuKeys.push('Reports');
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
            }

            async logout() {
                await axios.post(getUrl('rest/logout'));
                window.location = getUrl();
            }

            render() {
                const path = this.props.location.pathname;

                const topLevelItems = structure.children;

                const topLevelMenu = [];

                if (mailtrainConfig.isAuthenticated) {

                    const gP = mailtrainConfig.globalPermissions;
                    const superadmin = mailtrainConfig.user.admin;

		            for (const entryKey of topLevelMenuKeys) {
		                const entry = topLevelItems[entryKey.toLowerCase()];
		                const link = entry.link || entry.externalLink;

		                if (superadmin || gP["manage"+entryKey]) {
		                    if (link && path.startsWith(link)) {
		                        topLevelMenu.push(<NavLink key={entryKey.toLowerCase()} className="active" to={link}>{entry.title} <span className="sr-only">{t('current')}</span></NavLink>);
		                    } else {
		                        topLevelMenu.push(<NavLink key={entryKey.toLowerCase()} to={link}>{entry.title}</NavLink>);
		                    }
		                }
		            }

                    return (
                        <>
                            <ul className="navbar-nav mt-navbar-nav-left">
                                {topLevelMenu}
                                {(superadmin || gP.manageUsers || gP.manageNamespaces || gP.manageSettings || 
                                  gP.manageSendConfigurations || gP.manageBlacklist || gP.manageApi) &&
                                  <NavDropdown label={t('administration')}>
                                    {(superadmin || gP.manageUsers) &&
                                        <DropdownLink to="/users">{t('users')}</DropdownLink>}
                                    {(superadmin || gP.manageNamespaces) &&
                                        <DropdownLink to="/namespaces">{t('namespaces')}</DropdownLink>}
                                    {(superadmin || gP.manageSettings) &&
                                        <DropdownLink to="/settings">{t('globalSettings')}</DropdownLink>}
                                    {(superadmin || gP.manageSendConfigurations) &&
                                        <DropdownLink to="/send-configurations">{t('sendConfigurations')}</DropdownLink>}
                                    {(superadmin || gP.manageBlacklist) &&
                                        <DropdownLink to="/blacklist">{t('blacklist')}</DropdownLink>}
                                    {(superadmin || gP.manageApi) &&
                                        <DropdownLink to="/account/api">{t('api')}</DropdownLink>}
                                  </NavDropdown>}
                            </ul>
                            <ul className="navbar-nav mt-navbar-nav-right">
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
            panelRender: props => <Home />,
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
                ...campaigns.getMenus(t),
                ...channels.getMenus(t)
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


