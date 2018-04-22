'use strict';

import React, {Component} from "react";
import {translate} from "react-i18next";
import PropTypes from "prop-types";
import {withRouter} from "react-router";
import {BrowserRouter as Router, Link, Redirect, Route, Switch} from "react-router-dom";
import {withAsyncErrorHandler, withErrorHandling} from "./error-handling";
import interoperableErrors from "../../../shared/interoperable-errors";
import {Button, DismissibleAlert} from "./bootstrap-components";
import mailtrainConfig from "mailtrainConfig";
import styles from "./styles.scss";
import {getRoutes, needsResolve, resolve, withPageHelpers} from "./page-common";

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
            let className = styles.secondaryNav + ' nav nav-pills';
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
    async resolve(props) {
        if (Object.keys(props.route.resolve).length === 0) {
            this.setState({
                resolved: {}
            });

        } else {
            this.setState({
                resolved: null
            });

            const resolved = await resolve(props.route, props.match);

            if (!this.disregardResolve) { // This is to prevent the warning about setState on discarded component when we immediatelly redirect.
                this.setState({
                    resolved
                });
            }
        }
    }

    componentDidMount() {
        this.resolve(this.props);
    }

    componentDidUpdate() {
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.match.params !== nextProps.match.params && needsResolve(this.props.route, nextProps.route, this.props.match, nextProps.match)) {
            this.resolve(nextProps);
        }
    }

    componentWillUnmount() {
        this.disregardResolve = true; // This is to prevent the warning about setState on discarded component when we immediatelly redirect.
    }

    render() {
        const t = this.props.t;
        const route = this.props.route;
        const params = this.props.match.params;
        const resolved = this.state.resolved;

        if (!route.panelRender && !route.panelComponent && route.link) {
            let link;
            if (typeof route.link === 'function') {
                link = route.link(params);
            } else {
                link = route.link;
            }

            return <Redirect to={link}/>;

        } else {
            const primaryMenuProps = {
                location: this.props.location
            };

            const primaryMenuComponent = React.createElement(route.primaryMenuComponent, primaryMenuProps);

            if (resolved) {
                const compProps = {
                    match: this.props.match,
                    location: this.props.location,
                    resolved
                };

                let panel;
                if (route.panelComponent) {
                    panel = React.createElement(route.panelComponent, compProps);
                } else if (route.panelRender) {
                    panel = route.panelRender(compProps);
                }

                return (
                    <div>
                        {primaryMenuComponent}

                        <div>
                            <SecondaryNavBar className="hidden-xs pull-right" route={route} params={params} resolved={resolved}/>
                            <Breadcrumb route={route} params={params} resolved={resolved}/>
                            <SecondaryNavBar className="visible-xs" route={route} params={params} resolved={resolved}/>
                        </div>

                        <div className="container-fluid">
                            {this.props.flashMessage}
                            {panel}
                        </div>
                    </div>
                );
            } else {
                return (
                    <div>
                        {primaryMenuComponent}
                        <div className="container-fluid">
                            {t('Loading...')}
                        </div>
                    </div>
                );
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
        }

        this.historyUnlisten = props.history.listen((location, action) => {
            this.closeFlashMessage();
        })
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
            this.navigateTo('/account/login?next=' + encodeURIComponent(window.location.pathname));
        }
    }

    errorHandler(error) {
        if (error instanceof interoperableErrors.NotLoggedInError) {
            this.navigateTo('/account/login?next=' + encodeURIComponent(window.location.pathname));
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

    renderRoute(route) {
        let flashMessage;
        if (this.state.flashMessageText) {
            flashMessage = <DismissibleAlert severity={this.state.flashMessageSeverity} onCloseAsync={::this.closeFlashMessage}>{this.state.flashMessageText}</DismissibleAlert>;
        }

        const render = props => <RouteContent route={route} flashMessage={flashMessage} {...props}/>;

        return <Route key={route.path} exact path={route.path} render={render} />
    }

    render() {
        let routes = getRoutes('', {}, [], this.props.structure, [], null, null);

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
            <Router basename={mailtrainConfig.urlBase}>
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
        let className = 'pull-right ' + styles.buttonRow;
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

class MenuLink extends Component {
    static propTypes = {
        to: PropTypes.string,
        className: PropTypes.string
    }

    render() {
        const props = this.props;

        return (
            <li className={props.className}><Link to={props.to}>{props.children}</Link></li>
        );
    }
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
    MenuLink,
    withPageHelpers,
    requiresAuthenticatedUser
};