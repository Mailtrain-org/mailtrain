'use strict';

import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {
    I18nextProvider,
    translate
} from 'react-i18next';
import i18n from './lib/i18n';

import account from './account/root';
import blacklist from './blacklist/root';
import lists from './lists/root';
import namespaces from './namespaces/root';
import reports from './reports/root';
import templates from './templates/root';
import users from './users/root';
import {Section} from "./lib/page";

import mailtrainConfig from 'mailtrainConfig';
import Home from "./Home";
import {
    ActionLink,
    Icon
} from "./lib/bootstrap-components";
import {Link} from "react-router-dom";
import axios from './lib/axios';


@translate()
class Root extends Component {
    constructor(props) {
        super(props);

        const t = props.t;
        const self = this;

        const topLevelMenuKeys = ['lists', 'templates', 'reports'];

        class MainMenu extends Component {
            render() {
                const path = this.props.location.pathname;
                const topLevelMenu = [];
                const topLevelItems = self.structure[''].children;
                for (const entryKey of topLevelMenuKeys) {
                    const entry = topLevelItems[entryKey];
                    const link = entry.link || entry.externalLink;

                    if (link && path.startsWith(link)) {
                        topLevelMenu.push(<li key={entryKey} className="active"><Link to={link}>{entry.title} <span className="sr-only">{t('(current)')}</span></Link></li>);
                    } else {
                        topLevelMenu.push(<li key={entryKey}><Link to={link}>{entry.title}</Link></li>);
                    }
                }

                return (
                    <nav className="navbar navbar-default navbar-static-top">
                        <div className="container-fluid">
                            <div className="navbar-header">
                                <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                                    <span className="sr-only">{t('Toggle navigation')}</span>
                                    <span className="icon-bar"></span>
                                    <span className="icon-bar"></span>
                                    <span className="icon-bar"></span>
                                </button>
                                <Link className="navbar-brand" to="/"><i className="glyphicon glyphicon-envelope"></i> Mailtrain</Link>
                            </div>

                            {mailtrainConfig.isAuthenticated &&
                            <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                                <ul className="nav navbar-nav">
                                    {topLevelMenu}

                                    <li className="dropdown">
                                        <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">{t('Administration')}<span className="caret"></span></a>
                                        <ul className="dropdown-menu">
                                            <li>
                                                <Link to="/users"><Icon icon='cog'/> {t('Users')}</Link>
                                            </li>
                                            <li>
                                                <Link to="/namespaces"><Icon icon='cog'/> {t('Namespaces')}</Link>
                                            </li>
                                            <li>
                                                <Link to="/settings"><Icon icon='cog'/> {t('Settings')}</Link>
                                            </li>
                                            <li>
                                                <Link to="/blacklist"><Icon icon='ban-circle'/> {t('Blacklist')}</Link>
                                            </li>
                                            <li>
                                                <Link to="/account/api"><Icon icon='retweet'/> {t('API')}</Link>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>


                                <ul className="nav navbar-nav navbar-right">
                                    <li className="dropdown">
                                        <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                                            <span className="glyphicon glyphicon-user" aria-hidden="true"></span> {mailtrainConfig.user.username}<span className="caret"></span>
                                        </a>
                                        <ul className="dropdown-menu">
                                            <li>
                                                <Link to="/account"><Icon icon='user'/> {t('Account')}</Link>
                                            </li>
                                            <li>
                                                <ActionLink onClickAsync={::self.logout}><Icon icon='log-out'/> {t('Log out')}</ActionLink>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                            </div>
                            }

                        </div>
                    </nav>
                );
            }
        }

        this.structure = {
            '': {
                title: t('Home'),
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
                }
            }
        };
    }

    async logout() {
        await axios.post('/rest/logout');
        window.location = '/';
    }

    render() {
        const t = this.props.t;

        return (
            <div>
                <Section root='/' structure={this.structure}/>

                <footer className="footer">
                    <div className="container-fluid">
                        <p className="text-muted">&copy; 2018 <a href="https://mailtrain.org">Mailtrain.org</a>, <a href="mailto:info@mailtrain.org">info@mailtrain.org</a>. <a href="https://github.com/Mailtrain-org/mailtrain">{t('Source on GitHub')}</a></p>
                    </div>
                </footer>
            </div>
        );
    }
}

export default function() {
    ReactDOM.render(<I18nextProvider i18n={ i18n }><Root/></I18nextProvider>,document.getElementById('root'));
};


