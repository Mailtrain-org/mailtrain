'use strict';

import React, {Component} from "react";
import PropTypes from "prop-types";
import {Redirect, Route, Switch} from "react-router-dom";
import {withAsyncErrorHandler, withErrorHandling} from "./error-handling";
import axios from "../lib/axios";
import {getUrl} from "./urls";
import {createComponentMixin, withComponentMixins} from "./decorator-helpers";
import {withTranslation} from "./i18n";
import shallowEqual from "shallowequal";
import {checkPermissions} from "./permissions";

async function resolve(route, match, prevResolverState) {
    const resolved = {};
    const permissions = {};
    const resolverState = {
        resolvedByUrl: {},
        permissionsBySig: {}
    };

    prevResolverState = prevResolverState || {
        resolvedByUrl: {},
        permissionsBySig: {}
    };

    async function processResolve() {
        const keysToGo = new Set(Object.keys(route.resolve));

        while (keysToGo.size > 0) {
            const urlsToResolve = [];
            const keysToResolve = [];

            for (const key of keysToGo) {
                const resolveEntry = route.resolve[key];

                let allDepsSatisfied = true;
                let urlFn = null;

                if (typeof resolveEntry === 'function') {
                    urlFn = resolveEntry;

                } else {
                    if (resolveEntry.dependencies) {
                        for (const dep of resolveEntry.dependencies) {
                            if (!(dep in resolved)) {
                                allDepsSatisfied = false;
                                break;
                            }
                        }
                    }

                    urlFn = resolveEntry.url;
                }

                if (allDepsSatisfied) {
                    urlsToResolve.push(urlFn(match.params, resolved));
                    keysToResolve.push(key);
                }
            }

            if (keysToResolve.length === 0) {
                throw new Error('Cyclic dependency in "resolved" entries of ' + route.path);
            }

            const urlsToResolveByRest = [];
            const keysToResolveByRest = [];

            for (let idx = 0; idx < keysToResolve.length; idx++) {
                const key = keysToResolve[idx];
                const url = urlsToResolve[idx];

                if (url in prevResolverState.resolvedByUrl) {
                    const entity = prevResolverState.resolvedByUrl[url];
                    resolved[key] = entity;
                    resolverState.resolvedByUrl[url] = entity;

                } else {
                    urlsToResolveByRest.push(url);
                    keysToResolveByRest.push(key);
                }
            }

            if (keysToResolveByRest.length > 0) {
                const promises = urlsToResolveByRest.map(url => {
                    if (url) {
                        return axios.get(getUrl(url));
                    } else {
                        return Promise.resolve({data: null});
                    }
                });
                const resolvedArr = await Promise.all(promises);

                for (let idx = 0; idx < keysToResolveByRest.length; idx++) {
                    resolved[keysToResolveByRest[idx]] = resolvedArr[idx].data;
                    resolverState.resolvedByUrl[urlsToResolveByRest[idx]] = resolvedArr[idx].data;
                }
            }

            for (const key of keysToResolve) {
                keysToGo.delete(key);
            }
        }
    }

    async function processCheckPermissions() {
        const checkPermsRequest = {};

        function getSig(checkPermissionsEntry) {
            return `${checkPermissionsEntry.entityTypeId}-${checkPermissionsEntry.entityId || ''}-${checkPermissionsEntry.requiredOperations.join(',')}`;
        }

        for (const key in route.checkPermissions) {
            const checkPermissionsEntry = route.checkPermissions[key];
            const sig = getSig(checkPermissionsEntry);

            if (sig in prevResolverState.permissionsBySig) {
                const perm = prevResolverState.permissionsBySig[sig];
                permissions[key] = perm;
                resolverState.permissionsBySig[sig] = perm;

            } else {
                checkPermsRequest[key] = checkPermissionsEntry;
            }
        }

        if (Object.keys(checkPermsRequest).length > 0) {
            const result = await checkPermissions(checkPermsRequest);

            for (const key in checkPermsRequest) {
                const checkPermissionsEntry = checkPermsRequest[key];
                const perm = result.data[key];

                permissions[key] = perm;
                resolverState.permissionsBySig[getSig(checkPermissionsEntry)] = perm;
            }
        }

    }

    await Promise.all([processResolve(), processCheckPermissions()]);

    return { resolved, permissions, resolverState };
}

export function getRoutes(structure, parentRoute) {
    function _getRoutes(urlPrefix, resolve, checkPermissions, parents, structure, navs, primaryMenuComponent, secondaryMenuComponent) {
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

            let entryResolveWithLocal;
            if (entry.localResolve) {
                entryResolveWithLocal = Object.assign({}, entryResolve, entry.localResolve);
            } else {
                entryResolveWithLocal = entryResolve;
            }

            let entryCheckPermissions;
            if (entry.checkPermissions) {
                entryCheckPermissions = Object.assign({}, checkPermissions, entry.checkPermissions);
            } else {
                entryCheckPermissions = checkPermissions;
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
                exact: !entry.structure && entry.exact !== false,
                structure: entry.structure,
                panelComponent: entry.panelComponent,
                panelRender: entry.panelRender,
                primaryMenuComponent: (entry.primaryMenuComponent || entry.primaryMenuComponent === null) ? entry.primaryMenuComponent : primaryMenuComponent,
                secondaryMenuComponent: (entry.secondaryMenuComponent || entry.secondaryMenuComponent === null) ? entry.secondaryMenuComponent : secondaryMenuComponent,
                title: entry.title,
                link: entry.link,
                panelInFullScreen: entry.panelInFullScreen,
                insideIframe: entry.insideIframe,
                resolve: entryResolveWithLocal,
                checkPermissions: entryCheckPermissions,
                parents,
                navs: [...navs, ...entryNavs],

                // This is primarily for route embedding via "structure"
                routeSpec: entry,
                urlPrefix,
                siblingNavs: navs,
                routeKey
            };

            routes.push(route);

            const childrenParents = [...parents, route];

            if (entry.navs) {
                for (let navKeyIdx = 0; navKeyIdx < navKeys.length; navKeyIdx++) {
                    const navKey = navKeys[navKeyIdx];
                    const nav = entry.navs[navKey];

                    const childNavs = [...entryNavs];
                    childNavs[navKeyIdx] = Object.assign({}, childNavs[navKeyIdx], { active: true });

                    routes = routes.concat(_getRoutes(path + '/', entryResolve, entryCheckPermissions, childrenParents, { [navKey]: nav }, childNavs, route.primaryMenuComponent, route.secondaryMenuComponent));
                }
            }

            if (entry.children) {
                routes = routes.concat(_getRoutes(path + '/', entryResolve, entryCheckPermissions, childrenParents, entry.children, entryNavs, route.primaryMenuComponent, route.secondaryMenuComponent));
            }
        }

        return routes;
    }

    if (parentRoute) {
        // This embeds the structure in the parent route.

        const routeSpec = parentRoute.routeSpec;

        const extStructure = {
            ...routeSpec,
            structure: undefined,
            ...structure,
            navs: { ...(routeSpec.navs || {}), ...(structure.navs || {}) },
            children: { ...(routeSpec.children || {}), ...(structure.children || {}) }
        };

        return _getRoutes(parentRoute.urlPrefix, parentRoute.resolve, parentRoute.checkPermissions, parentRoute.parents, { [parentRoute.routeKey]: extStructure }, parentRoute.siblingNavs, parentRoute.primaryMenuComponent, parentRoute.secondaryMenuComponent);

    } else {
        return _getRoutes('', {}, {}, [], { "": structure }, [], null, null);
    }
}


@withComponentMixins([
    withErrorHandling
])
export class Resolver extends Component {
    constructor(props) {
        super(props);

        this.state = {
            resolved: null,
            permissions: null,
            resolverState: null
        };

        if (Object.keys(props.route.resolve).length === 0 && Object.keys(props.route.checkPermissions).length === 0) {
            this.state.resolved = {};
            this.state.permissions = {};
        }
    }

    static propTypes = {
        route: PropTypes.object.isRequired,
        render: PropTypes.func.isRequired,
        location: PropTypes.object,
        match: PropTypes.object
    }

    @withAsyncErrorHandler
    async resolve(prevMatch) {
        const props = this.props;

        if (Object.keys(props.route.resolve).length === 0 && Object.keys(props.route.checkPermissions).length === 0) {
            this.setState({
                resolved: {},
                permissions: {},
                resolverState: null
            });

        } else {
            const prevResolverState = this.state.resolverState;

            if (this.state.resolverState) {
                this.setState({
                    resolved: null,
                    permissions: null,
                    resolverState: null
                });
            }

            const {resolved, permissions, resolverState} = await resolve(props.route, props.match, prevResolverState);

            if (!this.disregardResolve) { // This is to prevent the warning about setState on discarded component when we immediatelly redirect.
                this.setState({
                    resolved,
                    permissions,
                    resolverState
                });
            }
        }
    }

    componentDidMount() {
        // noinspection JSIgnoredPromiseFromCall
        this.resolve();
    }

    componentDidUpdate(prevProps) {
        if (this.props.location.state !== prevProps.location.state || !shallowEqual(this.props.match.params, prevProps.match.params)) {
            // noinspection JSIgnoredPromiseFromCall
            this.resolve(prevProps.route, prevProps.match);
        }
    }

    componentWillUnmount() {
        this.disregardResolve = true; // This is to prevent the warning about setState on discarded component when we immediatelly redirect.
    }

    render() {
        return this.props.render(this.state.resolved, this.state.permissions, this.props);
    }
}


class RedirectRoute extends Component {
    static propTypes = {
        route: PropTypes.object.isRequired
    }

    render() {
        const route = this.props.route;
        const params = this.props.match.params;

        let link;
        if (typeof route.link === 'function') {
            link = route.link(params);
        } else {
            link = route.link;
        }

        return <Redirect to={link}/>;
    }
}


@withComponentMixins([
    withTranslation
])
class SubRoute extends Component {
    static propTypes = {
        route: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        match: PropTypes.object.isRequired,
        flashMessage: PropTypes.object,
        panelRouteCtor: PropTypes.func.isRequired,
        loadingMessageFn: PropTypes.func.isRequired
    }

    render() {
        const t = this.props.t;
        const route = this.props.route;
        const params = this.props.match.params;

        const render = (resolved, permissions) => {
            if (resolved && permissions) {
                const subStructure = route.structure(resolved, permissions, params);
                const routes = getRoutes(subStructure, route);

                const _renderRoute = route => {
                    const render = props => renderRoute(route, this.props.panelRouteCtor, this.props.loadingMessageFn, this.props.flashMessage, props);
                    return <Route key={route.path} exact={route.exact} path={route.path} render={render} />
                };

                return (
                    <Switch>{routes.map(x => _renderRoute(x))}</Switch>
                );

            } else {
                return this.props.loadingMessageFn();
            }
        };

        return <Resolver route={route} render={render} location={this.props.location} match={this.props.match} />;
    }
}

export function renderRoute(route, panelRouteCtor, loadingMessageFn, flashMessage, props) {
    if (route.structure) {
        return <SubRoute route={route} flashMessage={flashMessage} panelRouteCtor={panelRouteCtor} loadingMessageFn={loadingMessageFn} {...props}/>;

    } else if (!route.panelRender && !route.panelComponent && route.link) {
        return <RedirectRoute route={route} {...props}/>;

    } else {
        const PanelRoute = panelRouteCtor;
        return <PanelRoute route={route} flashMessage={flashMessage} {...props}/>;
    }

}

export const SectionContentContext = React.createContext(null);
export const withPageHelpers = createComponentMixin({
    contexts: [{context: SectionContentContext, propName: 'sectionContent'}],
    deps: [withErrorHandling],
    decoratorFn: (TargetClass, InnerClass) => {
        InnerClass.prototype.setFlashMessage = function (severity, text) {
            return this.props.sectionContent.setFlashMessage(severity, text);
        };

        InnerClass.prototype.navigateTo = function (path) {
            return this.props.sectionContent.navigateTo(path);
        };

        InnerClass.prototype.navigateBack = function () {
            return this.props.sectionContent.navigateBack();
        };

        InnerClass.prototype.navigateToWithFlashMessage = function (path, severity, text) {
            return this.props.sectionContent.navigateToWithFlashMessage(path, severity, text);
        };

        InnerClass.prototype.registerBeforeUnloadHandlers = function (handlers) {
            return this.props.sectionContent.registerBeforeUnloadHandlers(handlers);
        };

        InnerClass.prototype.deregisterBeforeUnloadHandlers = function (handlers) {
            return this.props.sectionContent.deregisterBeforeUnloadHandlers(handlers);
        };

        return {};
    }
});
