'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom'
import './page.css';
import { withErrorHandling } from './error-handling';


class PageContent extends Component {
    static propTypes = {
        structure: PropTypes.object.isRequired
    }

    getRoutes(urlPrefix, children) {
        let routes = [];
        for (let routeKey in children) {
            const structure = children[routeKey];

            let path = urlPrefix + routeKey;

            if (structure.params) {
                path = path + '/' + structure.params.join('/');
            }

            if (structure.component) {
                const route = {
                    component: structure.component,
                    path: (path === '' ? '/' : path)
                };

                routes.push(route);
            }

            if (structure.children) {
                routes = routes.concat(this.getRoutes(path + '/', structure.children));
            }
        }

        return routes;
    }

    renderRoute(route) {
        return <Route key={route.path} exact path={route.path} component={route.component} />;
    }

    render() {
        let routes = this.getRoutes('', this.props.structure);
        return <Switch>{routes.map(x => this.renderRoute(x))}</Switch>;
    }
}

@withRouter
class Breadcrumb extends Component {
    static propTypes = {
        structure: PropTypes.object.isRequired
    }

    renderElement(breadcrumbElem) {
        if (breadcrumbElem.isActive) {
            return <li key={breadcrumbElem.idx} className="active">{breadcrumbElem.title}</li>;
        } else if (breadcrumbElem.externalLink) {
            return <li key={breadcrumbElem.idx}><a href={breadcrumbElem.externalLink}>{breadcrumbElem.title}</a></li>;
        } else if (breadcrumbElem.link) {
            return <li key={breadcrumbElem.idx}><Link to={breadcrumbElem.link}>{breadcrumbElem.title}</Link></li>;
        } else {
            return <li key={breadcrumbElem.idx}>{breadcrumbElem.title}</li>;
        }
    }

    render() {
        const location = this.props.location.pathname;
        const locationElems = location.split('/');

        let breadcrumbElems = [];
        let children = this.props.structure;

        for (let idx = 0; idx < locationElems.length; idx++) {
            const breadcrumbElem = children[locationElems[idx]];
            if (!breadcrumbElem) {
                break;
            }

            breadcrumbElem.isActive = (idx === locationElems.length - 1);
            breadcrumbElem.idx = idx;

            breadcrumbElems.push(breadcrumbElem);
            children = breadcrumbElem.children;

            if (!children) {
                break;
            }
        }

        const renderedElems = breadcrumbElems.map(x => this.renderElement(x));

        return <ol className="breadcrumb">{renderedElems}</ol>;
    }
}

@translate()
class DismissibleAlert extends Component {
    static propTypes = {
        severity: PropTypes.string.isRequired,
        onClose: PropTypes.func
    }

    close() {
        if (this.props.onClose) {
            this.props.onClose();
        }
    }

    render() {
        const t = this.props.t;

        return (
            <div className={`alert alert-${this.props.severity} alert-dismissible`} role="alert">
                <button type="button" className="close" aria-label={t('Close')} onClick={::this.close}><span aria-hidden="true">&times;</span></button>
                {this.props.children}
            </div>
        )
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

    navigateToWithFlashMessage(path, severity, text) {
        this.props.history.push(path);
        this.setFlashMessage(severity, text);
    }

    errorHandler(error) {
        if (error.response && error.response.data && error.response.data.message) {
            this.navigateToWithFlashMessage(this.props.root, 'danger', error.response.data.message);
        } else {
            this.navigateToWithFlashMessage(this.props.root, 'danger', error.message);
        }
        return true;
    }

    closeFlashMessage() {
        this.setState({
            flashMessageText: ''
        })
    }

    render() {
        return (
            <div>
                <Breadcrumb structure={this.props.structure} />
                {(this.state.flashMessageText && <DismissibleAlert severity={this.state.flashMessageSeverity} onClose={::this.closeFlashMessage}>{this.state.flashMessageText}</DismissibleAlert>)}
                <PageContent structure={this.props.structure}/>
            </div>
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
    render() {
        return (
            <div className="pull-right mt-button-row">
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

class Button extends Component {
    static propTypes = {
        onClick: PropTypes.func,
        label: PropTypes.string,
        icon: PropTypes.string,
        className: PropTypes.string
    }

    async onClick(evt) {
        evt.preventDefault();

        if (this.props.onClick) {
            onClick(evt);
        }
    }

    render() {
        const props = this.props;

        let className = 'btn';
        if (props.className) {
            className = className + ' ' + props.className;
        }

        let icon;
        if (props.icon) {
            icon = <span className={'glyphicon glyphicon-' + props.icon}></span>
        }

        let iconSpacer;
        if (props.icon && props.label) {
            iconSpacer = ' ';
        }

        return (
            <button type="button" className={className} onClick={::this.onClick}>{icon}{iconSpacer}{props.label}</button>
        );
    }
}

function withSectionHelpers(target) {
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

    inst.navigateToWithFlashMessage = function(path, severity, text) {
        return this.context.sectionContent.navigateToWithFlashMessage(path, severity, text);
    }

    return target;
}

export {
    Section,
    Title,
    Toolbar,
    Button,
    NavButton,
    withSectionHelpers
};