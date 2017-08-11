'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import {BrowserRouter as Router, Route, Link, Switch, Redirect} from 'react-router-dom'
import './page.css';
import { withErrorHandling, withAsyncErrorHandler } from './error-handling';
import interoperableErrors from '../../../shared/interoperable-errors';
import { DismissibleAlert, Button } from './bootstrap-components';
import mailtrainConfig from 'mailtrainConfig';
import axios from '../lib/axios';


class Breadcrumb extends Component {
    static propTypes = {
        route: PropTypes.object.isRequired,
        params: PropTypes.object.isRequired,
        resolved: PropTypes.object.isRequired
    }

    renderElement(entry, isActive) {
        const params = this.props.params;
        let title;
        if (typeof entry.title === 'function') {
            title = entry.title(this.props.resolved);
        } else {
            title = entry.title;
        }

        if (isActive) {
            return <li key={entry.path} className="active">{title}</li>;

        } else if (entry.externalLink) {
            let externalLink;
            if (typeof entry.externalLink === 'function') {
                externalLink = entry.externalLink(params);
            } else {
                externalLink = entry.externalLink;
            }

            return <li key={entry.path}><a href={externalLink}>{title}</a></li>;

        } else if (entry.link) {
            let link;
            if (typeof entry.link === 'function') {
                link = entry.link(params);
            } else {
                link = entry.link;
            }
            return <li key={entry.path}><Link to={link}>{title}</Link></li>;

        } else {
            return <li key={entry.path}>{title}</li>;
        }
    }

    render() {
        const route = this.props.route;

        const renderedElems = [...route.parents.map(x => this.renderElement(x)), this.renderElement(route, true)];

        return <ol className="breadcrumb">{renderedElems}</ol>;
    }
}

class SecondaryNavBar extends Component {
    static propTypes = {
        route: PropTypes.object.isRequired,
        params: PropTypes.object.isRequired,
        resolved: PropTypes.object.isRequired,
        className: PropTypes.string
    }

    renderElement(key, entry) {
        const params = this.props.params;
        let title;
        if (typeof entry.title === 'function') {
            title = entry.title(this.props.resolved);
        } else {
            title = entry.title;
        }

        let className = '';
        if (entry.active) {
            className += ' active';
        }

        if (entry.link) {
            let link;

            if (typeof entry.link === 'function') {
                link = entry.link(params);
            } else {
                link = entry.link;
            }

            return <li key={key} role="presentation" className={className}><Link to={link}>{title}</Link></li>;

        } else if (entry.externalLink) {
            let externalLink;
            if (typeof entry.externalLink === 'function') {
                externalLink = entry.externalLink(params);
            } else {
                externalLink = entry.externalLink;
            }

            return <li key={key} role="presentation" className={className}><a href={externalLink}>{title}</a></li>;

        } else {
            return <li key={key} role="presentation" className={className}>{title}</li>;
        }
    }

    render() {
        const route = this.props.route;

        const keys = Object.keys(route.navs);
        const renderedElems = [];

        for (const key in keys) {
            const entry = route.navs[key];

            let visible = true;
            if (typeof entry.visible === 'function') {
                visible = entry.visible(this.props.resolved);
            }

            if (visible) {
                renderedElems.push(this.renderElement(key, entry));
            }
        }

        if (renderedElems.length > 1) {
            let className = 'mt-secondary-nav nav nav-pills';
            if (this.props.className) {
                className += ' ' + this.props.className;
            }

            return <ul className={className}>{renderedElems}</ul>;
        } else {
            return null;
        }
    }
}

@translate()
@withErrorHandling
class RouteContent extends Component {
    constructor(props) {
        super(props);
        this.state = {};

        if (Object.keys(props.route.resolve).length === 0) {
            this.state.resolved = {};
        }
    }

    static propTypes = {
        route: PropTypes.object.isRequired,
        flashMessage: PropTypes.object
    }

    @withAsyncErrorHandler
    async resolve() {
        const route = this.props.route;

        const keys = Object.keys(route.resolve);

        if (keys.length > 0) {
            const promises = keys.map(key => axios.get(route.resolve[key](this.props.match.params)));
            const resolvedArr = await Promise.all(promises);

            const resolved = {};
            for (let idx = 0; idx < keys.length; idx++) {
                resolved[keys[idx]] = resolvedArr[idx].data;
            }

            this.setState({
                resolved
            });
        }
    }

    componentDidMount() {
        this.resolve();
    }

    render() {
        const t = this.props.t;
        const route = this.props.route;
        const params = this.props.match.params;
        const resolved = this.state.resolved;

        if (!route.render && !route.component && route.link) {
            let link;
            if (typeof route.link === 'function') {
                link = route.link(params);
            } else {
                link = route.link;
            }

            return <Redirect to={link}/>;

        } else {
            if (resolved) {
                const compProps = {
                    match: this.props.match,
                    location: this.props.location,
                    resolved
                };

                let component;
                if (route.render) {
                    component = route.render(compProps);
                } else if (route.component) {
                    component = React.createElement(route.component, compProps, null);
                }

                return (
                    <div>
                        <div>
                            <SecondaryNavBar className="hidden-xs pull-right" route={route} params={params} resolved={resolved}/>
                            <Breadcrumb route={route} params={params} resolved={resolved}/>
                            <SecondaryNavBar className="visible-xs" route={route} params={params} resolved={resolved}/>
                        </div>
                        {this.props.flashMessage}
                        {component}
                    </div>
                );
            } else {
                return <div>{t('Loading...')}</div>;
            }
        }
    }
}


@withRouter
@withErrorHandling
class SectionContent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            flashMessageText: ''
        }

        this.historyUnlisten = props.history.listen((location, action) => {
            this.closeFlashMessage();
        })


        // -------------------------------------------------------------------------------------------------------
        /* FIXME - remove this once we migrate fully to React
           This part transforms the flash notice rendered by the server to flash notice managed by React client.
           It is used primarily for the login info, but there may be some other cases.
         */
        const alrt = jQuery('.container>.alert');
        alrt.find('button').remove();

        const alrtText = alrt.text();
        if (alrtText) {
            this.state.flashMessageText = alrtText;

            const severityRegex = /alert-([^ ]*)/;
            const match = alrt.attr('class').match(severityRegex);

            if (match) {
                this.state.flashMessageSeverity = match[1];
            }
        }

        alrt.remove();
        // -------------------------------------------------------------------------------------------------------
    }

    static propTypes = {
        structure: PropTypes.object.isRequired,
        root: PropTypes.string.isRequired
    }

    static childContextTypes = {
        sectionContent: PropTypes.object
    }

    getChildContext() {
        return {
            sectionContent: this
        };
    }

    getFlashMessageText() {
        return this.state.flashMessageText;
    }

    getFlashMessageSeverity() {
        return this.state.flashMessageSeverity;
    }

    setFlashMessage(severity, text) {
        this.setState({
            flashMessageText: text,
            flashMessageSeverity: severity
        });
    }

    navigateTo(path) {
        this.props.history.push(path);
    }

    navigateBack() {
        this.props.history.goBack();
    }

    navigateToWithFlashMessage(path, severity, text) {
        this.props.history.push(path);
        this.setFlashMessage(severity, text);
    }

    ensureAuthenticated() {
        if (!mailtrainConfig.isAuthenticated) {
            /* FIXME, once we turn Mailtrain to single-page application, this should become navigateTo */
            window.location = '/account/login?next=' + encodeURIComponent(this.props.root);
        }
    }

    errorHandler(error) {
        if (error instanceof interoperableErrors.NotLoggedInError) {
            /* FIXME, once we turn Mailtrain to single-page application, this should become navigateTo */
            window.location = '/account/login?next=' + encodeURIComponent(this.props.root);
        } else if (error.response && error.response.data && error.response.data.message) {
            console.error(error);
            this.navigateToWithFlashMessage(this.props.root, 'danger', error.response.data.message);
        } else {
            console.error(error);
            this.navigateToWithFlashMessage(this.props.root, 'danger', error.message);
        }
        return true;
    }

    async closeFlashMessage() {
        this.setState({
            flashMessageText: ''
        })
    }

    getRoutes(urlPrefix, resolve, parents, structure, navs) {
        let routes = [];
        for (let routeKey in structure) {
            const entry = structure[routeKey];

            let path = urlPrefix + routeKey;
            let pathWithParams = path;

            if (entry.extraParams) {
                pathWithParams = pathWithParams + '/' + entry.extraParams.join('/');
            }

            let entryResolve;
            if (entry.resolve) {
                entryResolve = Object.assign({}, resolve, entry.resolve);
            } else {
                entryResolve = resolve;
            }

            let navKeys;
            const entryNavs = [];
            if (entry.navs) {
                navKeys = Object.keys(entry.navs);

                for (const navKey of navKeys) {
                    const nav = entry.navs[navKey];

                    entryNavs.push({
                        title: nav.title,
                        visible: nav.visible,
                        link: nav.link,
                        externalLink: nav.externalLink
                    });
                }
            }

            const route = {
                path: (pathWithParams === '' ? '/' : pathWithParams),
                component: entry.component,
                render: entry.render,
                title: entry.title,
                link: entry.link,
                resolve: entryResolve,
                parents,
                navs: [...navs, ...entryNavs]
            };

            routes.push(route);

            const childrenParents = [...parents, route];

            if (entry.navs) {
                for (let navKeyIdx = 0; navKeyIdx < navKeys.length; navKeyIdx++) {
                    const navKey = navKeys[navKeyIdx];
                    const nav = entry.navs[navKey];

                    const childNavs = [...entryNavs];
                    childNavs[navKeyIdx] = Object.assign({}, childNavs[navKeyIdx], { active: true });

                    routes = routes.concat(this.getRoutes(path + '/', entryResolve, childrenParents, { [navKey]: nav }, childNavs));
                }
            }

            if (entry.children) {
                routes = routes.concat(this.getRoutes(path + '/', entryResolve, childrenParents, entry.children, entryNavs));
            }
        }

        return routes;
    }

    renderRoute(route) {
        let flashMessage;
        if (this.state.flashMessageText) {
            flashMessage = <DismissibleAlert severity={this.state.flashMessageSeverity} onCloseAsync={::this.closeFlashMessage}>{this.state.flashMessageText}</DismissibleAlert>;
        }

        const render = props => <RouteContent route={route} flashMessage={flashMessage} {...props}/>;

        return <Route key={route.path} exact path={route.path} render={render} />
    }

    render() {
        let routes = this.getRoutes('', {}, [], this.props.structure, []);

        return (
            <Switch>{routes.map(x => this.renderRoute(x))}</Switch>
        );
    }
}

@translate()
class Section extends Component {
    constructor(props) {
        super(props);

        let structure = props.structure;
        if (typeof structure === 'function') {
            structure = structure(props.t);
        }

        this.structure = structure;
    }

    static propTypes = {
        structure: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
        root: PropTypes.string.isRequired
    }

    render() {
        return (
            <Router>
                <SectionContent root={this.props.root} structure={this.structure} />
            </Router>
        );
    }
}


class Title extends Component {
    render() {
        return (
            <div>
                <h2>{this.props.children}</h2>
                <hr/>
            </div>
        );
    }
}

class Toolbar extends Component {
    static propTypes = {
        className: PropTypes.string,
    };

    render() {
        let className = 'pull-right mt-button-row';
        if (this.props.className) {
            className += ' ' + this.props.className;
        }

        return (
            <div className={className}>
                {this.props.children}
            </div>
        );
    }
}

class NavButton extends Component {
    static propTypes = {
        label: PropTypes.string,
        icon: PropTypes.string,
        className: PropTypes.string,
        linkTo: PropTypes.string
    };

    render() {
        const props = this.props;

        return (
            <Link to={props.linkTo}><Button label={props.label} icon={props.icon} className={props.className}/></Link>
        );
    }
}

class DropdownLink extends Component {
    static propTypes = {
        to: PropTypes.string
    }

    render() {
        const props = this.props;

        return (
            <li><Link to={props.to}>{props.children}</Link></li>
        );
    }
}

function withPageHelpers(target) {
    target = withErrorHandling(target);

    const inst = target.prototype;

    const contextTypes = target.contextTypes || {};

    contextTypes.sectionContent = PropTypes.object.isRequired;

    target.contextTypes = contextTypes;

    inst.getFlashMessageText = function() {
        return this.context.sectionContent.getFlashMessageText();
    };

    inst.getFlashMessageSeverity = function() {
        return this.context.sectionContent.getFlashMessageSeverity();
    };

    inst.setFlashMessage = function(severity, text) {
        return this.context.sectionContent.setFlashMessage(severity, text);
    };

    inst.navigateTo = function(path) {
        return this.context.sectionContent.navigateTo(path);
    }

    inst.navigateBack = function() {
        return this.context.sectionContent.navigateBack();
    }

    inst.navigateToWithFlashMessage = function(path, severity, text) {
        return this.context.sectionContent.navigateToWithFlashMessage(path, severity, text);
    }

    return target;
}

function requiresAuthenticatedUser(target) {
    const comp1 = withPageHelpers(target);

    function comp2(props, context) {
        comp1.call(this, props, context);
        context.sectionContent.ensureAuthenticated();
    }

    comp2.prototype = comp1.prototype;

    for (const attr in comp1) {
        comp2[attr] = comp1[attr];
    }

    return comp2;
}

export {
    Section,
    Title,
    Toolbar,
    NavButton,
    DropdownLink,
    withPageHelpers,
    requiresAuthenticatedUser
};