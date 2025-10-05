'use strict';

import './lib/public-path';

import React, {Component} from 'react';
import { createRoot } from 'react-dom/client';

import {TranslationRoot, withTranslation} from './lib/i18n';
import account from './account/root';
import login from './login/root';
import blacklist from './blacklist/root';
import lists from './lists/root';
import namespaces from './namespaces/root';
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
import {Router} from "./lib/router";

const topLevelMenuKeys = ['lists', 'channels', 'templates', 'campaigns'];

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
                window.location.href = getUrl();
            }

            render() {
                const path = this.props.location.pathname;

                const topLevelItems = structure.children;

                const topLevelMenu = [];

                for (const entryKey of topLevelMenuKeys) {
                    const entry = topLevelItems[entryKey];
                    const link = entry.link || entry.externalLink;

                    if (link && path.startsWith(link)) {
                        topLevelMenu.push(<NavLink key={entryKey} className="active" to={link}>{entry.title}</NavLink>);
                    } else {
                        topLevelMenu.push(<NavLink key={entryKey} to={link}>{entry.title}</NavLink>);
                    }
                }

                if (mailtrainConfig.isAuthenticated) {
                    return (
                        <>
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
                                {getLanguageChooser(t)}
                                <NavDropdown menuClassName="dropdown-menu-end" label={mailtrainConfig.user.username} icon="user">
                                    <DropdownLink to="/account"><Icon icon='user'/> {t('account')}</DropdownLink>
                                    {mailtrainConfig.authMethod == 'cas' && <DropdownLink to="/cas/logout" forceReload><Icon icon="sign-out-alt"/> {t('logOut')}</DropdownLink>}
                                    {mailtrainConfig.authMethod != 'cas' && <DropdownActionLink onClickAsync={::this.logout}><Icon icon='sign-out-alt'/> {t('logOut')}</DropdownActionLink>}
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
        console.log('Render Root');

        return (
            <Section root='/' structure={structure}/>
        );
    }
}

export default function() {
    const container = document.getElementById('root');
    const root = createRoot(container); // createRoot(container!) if you use TypeScript
    root.render(
        <Router>
            <TranslationRoot>
                <Root/>
            </TranslationRoot>
        </Router>
    );
};

