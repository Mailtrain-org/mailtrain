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
    MenuLink,
    Section
} from "./lib/page";

import mailtrainConfig
    from 'mailtrainConfig';
import Home
    from "./Home";
import {
    ActionLink,
    DropdownMenuItem,
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
                        <li key={lng}><ActionLink onClickAsync={() => i18n.changeLanguage(langDesc.longCode)}>{label}</ActionLink></li>
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
                        topLevelMenu.push(<MenuLink key={entryKey} className="active" to={link}>{entry.title} <span className="sr-only">{t('current')}</span></MenuLink>);
                    } else {
                        topLevelMenu.push(<MenuLink key={entryKey} to={link}>{entry.title}</MenuLink>);
                    }
                }

                return (
                    <nav className="navbar navbar-default navbar-static-top">
                        <div className="container-fluid">
                            <div className="navbar-header">
                                <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                                    <span className="sr-only">{t('toggleNavigation')}</span>
                                    <span className="icon-bar"></span>
                                    <span className="icon-bar"></span>
                                    <span className="icon-bar"></span>
                                </button>
                                <Link className="navbar-brand" to="/"><Icon icon="envelope"/> Mailtrain</Link>
                            </div>

                            {mailtrainConfig.isAuthenticated ?
                                <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                                    <ul className="nav navbar-nav">
                                        {topLevelMenu}
                                        <DropdownMenuItem label={t('administration')}>
                                            <MenuLink to="/users"><Icon icon='cog'/> {t('users')}</MenuLink>
                                            <MenuLink to="/namespaces"><Icon icon='cog'/> {t('namespaces')}</MenuLink>
                                            {mailtrainConfig.globalPermissions.manageSettings && <MenuLink to="/settings"><Icon icon='cog'/> {t('globalSettings')}</MenuLink>}
                                            <MenuLink to="/send-configurations"><Icon icon='cog'/> {t('sendConfigurations')}</MenuLink>
                                            {mailtrainConfig.globalPermissions.manageBlacklist && <MenuLink to="/blacklist"><Icon icon='ban-circle'/> {t('blacklist')}</MenuLink>}
                                            <MenuLink to="/account/api"><Icon icon='retweet'/> {t('api')}</MenuLink>
                                        </DropdownMenuItem>
                                    </ul>


                                    <ul className="nav navbar-nav navbar-right">
                                        <DropdownMenuItem label={currentLngCode}>
                                            {languageOptions}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem label={mailtrainConfig.user.username} icon="user">
                                            <MenuLink to="/account"><Icon icon='user'/> {t('account')}</MenuLink>
                                            <li>
                                                <ActionLink onClickAsync={::this.logout}><Icon icon='log-out'/> {t('logOut')}</ActionLink>
                                            </li>
                                        </DropdownMenuItem>
                                    </ul>
                                </div>
                                :
                                <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                                    <ul className="nav navbar-nav navbar-right">
                                        <DropdownMenuItem label={currentLngCode}>
                                            {languageOptions}
                                        </DropdownMenuItem>
                                    </ul>
                                </div>
                            }

                        </div>
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


