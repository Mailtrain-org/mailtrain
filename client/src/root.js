'use strict';

import './lib/public-path';

import React, {Component} from 'react';
import ReactDOM
    from 'react-dom';
import {I18nextProvider} from 'react-i18next';
import i18n, {withTranslation} from './lib/i18n';
import account
    from './account/root';
import blacklist
    from './blacklist/root';
import lists
    from './lists/root';
import namespaces
    from './namespaces/root';
import reports
    from './reports/root';
import campaigns
    from './campaigns/root';
import templates
    from './templates/root';
import users
    from './users/root';
import sendConfigurations
    from './send-configurations/root';
import settings
    from './settings/root';

import {
    NavDropdown,
    NavDropdownLink,
    NavLink,
    Section
} from "./lib/page";

import mailtrainConfig
    from 'mailtrainConfig';
import Home
    from "./Home";
import {
    ActionLink,
    Icon
} from "./lib/bootstrap-components";
import {Link} from "react-router-dom";
import axios
    from './lib/axios';
import {getUrl} from "./lib/urls";
import {getLang} from "../../shared/langs";
import {withComponentMixins} from "./lib/decorator-helpers";

const topLevelMenuKeys = ['lists', 'templates', 'campaigns'];

if (mailtrainConfig.reportsEnabled) {
    topLevelMenuKeys.push('reports');
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

        const structure = {};

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
                const languageOptions = [];
                for (const lng of mailtrainConfig.enabledLanguages) {
                    const langDesc = getLang(lng);
                    const label = langDesc.getLabel(t);

                    languageOptions.push(
                        <ActionLink key={lng} className="dropdown-item" onClickAsync={() => i18n.changeLanguage(langDesc.longCode)}>{label}</ActionLink>
                    )
                }

                const currentLngCode = getLang(i18n.language).getShortLabel(t);

                const path = this.props.location.pathname;

                const topLevelItems = structure[""].children;

                const topLevelMenu = [];

                for (const entryKey of topLevelMenuKeys) {
                    const entry = topLevelItems[entryKey];
                    const link = entry.link || entry.externalLink;

                    if (link && path.startsWith(link)) {
                        topLevelMenu.push(<NavLink key={entryKey} className="active" to={link}>{entry.title} <span className="sr-only">{t('current')}</span></NavLink>);
                    } else {
                        topLevelMenu.push(<NavLink key={entryKey} to={link}>{entry.title}</NavLink>);
                    }
                }

                const languageChooser = (
                    <NavDropdown menuClassName="dropdown-menu-right" label={currentLngCode}>
                        {languageOptions}
                    </NavDropdown>
                );

                return (
                    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                        <Link className="navbar-brand" to="/"><Icon icon="envelope"/> Mailtrain</Link>
                        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#mtMainNavbar" aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>

                        {mailtrainConfig.isAuthenticated ?
                            <div className="collapse navbar-collapse" id="mtMainNavbar">
                                <ul className="navbar-nav mr-auto">
                                    {topLevelMenu}
                                    <NavDropdown label={t('administration')}>
                                        <NavDropdownLink to="/users">{t('users')}</NavDropdownLink>
                                        <NavDropdownLink to="/namespaces">{t('namespaces')}</NavDropdownLink>
                                        {mailtrainConfig.globalPermissions.manageSettings && <NavDropdownLink to="/settings">{t('globalSettings')}</NavDropdownLink>}
                                        <NavDropdownLink to="/send-configurations">{t('sendConfigurations')}</NavDropdownLink>
                                        {mailtrainConfig.globalPermissions.manageBlacklist && <NavDropdownLink to="/blacklist">{t('blacklist')}</NavDropdownLink>}
                                        <NavDropdownLink to="/account/api">{t('api')}</NavDropdownLink>
                                    </NavDropdown>
                                </ul>
                                <ul className="navbar-nav">
                                    {languageChooser}
                                    <NavDropdown menuClassName="dropdown-menu-right" label={mailtrainConfig.user.username} icon="user">
                                        <NavDropdownLink to="/account"><Icon icon='user'/> {t('account')}</NavDropdownLink>
                                        <ActionLink className="dropdown-item" onClickAsync={::this.logout}><Icon icon='sign-out-alt'/> {t('logOut')}</ActionLink>
                                    </NavDropdown>
                                </ul>
                            </div>
                        :
                            <div className="collapse navbar-collapse" id="mtMainNavbar">
                                <ul className="navbar-nav mr-auto">
                                </ul>
                                <ul className="navbar-nav">
                                    {languageChooser}
                                </ul>
                            </div>
                        }
                    </nav>
                );
            }
        }

        structure[''] ={
            title: t('home'),
            link: '/',
            panelComponent: Home,
            primaryMenuComponent: MainMenu,
            children: {
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
            <div>
                <Section root='/' structure={structure}/>

                <footer className="footer">
                    <div className="container-fluid">
                        <p className="text-muted">&copy; 2018 <a href="https://mailtrain.org">Mailtrain.org</a>, <a href="mailto:info@mailtrain.org">info@mailtrain.org</a>. <a href="https://github.com/Mailtrain-org/mailtrain">{t('sourceOnGitHub')}</a></p>
                    </div>
                </footer>
            </div>
        );
    }
}

export default function() {
    ReactDOM.render(<I18nextProvider i18n={ i18n }><Root/></I18nextProvider>,document.getElementById('root'));
};


