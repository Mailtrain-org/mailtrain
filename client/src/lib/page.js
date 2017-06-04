'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom'
import './page.css';


class PageContent extends Component {
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
class Section extends Component {
    constructor(props) {
        super(props);

        let structure = props.structure;
        if (typeof structure === 'function') {
            structure = structure(props.t);
        }

        this.structure = structure;
    }

    render() {
        return (
            <Router>
                <div>
                    <Breadcrumb structure={this.structure} />
                    <PageContent structure={this.structure}/>
                </div>
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


export {
    Section,
    Title,
    Toolbar,
    Button,
    NavButton
};