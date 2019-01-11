'use strict';

import React
    from "react";
import {withRouter} from "react-router";
import {withErrorHandling} from "./error-handling";
import axios
    from "../lib/axios";
import {getUrl} from "./urls";
import {createComponentMixin} from "./decorator-helpers";

export function needsResolve(route, nextRoute, match, nextMatch) {
    const resolve = route.resolve;
    const nextResolve = nextRoute.resolve;

    if (Object.keys(resolve).length === Object.keys(nextResolve).length) {
        for (const key in resolve) {
            if (!(key in nextResolve) ||
                resolve[key](match.params) !== nextResolve[key](nextMatch.params)) {
                return true;
            }
        }
    } else {
        return true;
    }

    return false;
}

export async function resolve(route, match) {
    const keys = Object.keys(route.resolve);

    const promises = keys.map(key => {
        const url = route.resolve[key](match.params);
        if (url) {
            return axios.get(getUrl(url));
        } else {
            return Promise.resolve({data: null});
        }
    });
    const resolvedArr = await Promise.all(promises);

    const resolved = {};
    for (let idx = 0; idx < keys.length; idx++) {
        resolved[keys[idx]] = resolvedArr[idx].data;
    }

    return resolved;
}

export function getRoutes(urlPrefix, resolve, parents, structure, navs, primaryMenuComponent, secondaryMenuComponent) {
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
            panelComponent: entry.panelComponent,
            panelRender: entry.panelRender,
            primaryMenuComponent: entry.primaryMenuComponent || primaryMenuComponent,
            secondaryMenuComponent: entry.secondaryMenuComponent || secondaryMenuComponent,
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

                routes = routes.concat(getRoutes(path + '/', entryResolve, childrenParents, { [navKey]: nav }, childNavs, route.primaryMenuComponent, route.secondaryMenuComponent));
            }
        }

        if (entry.children) {
            routes = routes.concat(getRoutes(path + '/', entryResolve, childrenParents, entry.children, entryNavs, route.primaryMenuComponent, route.secondaryMenuComponent));
        }
    }

    return routes;
}

export const SectionContentContext = React.createContext(null);
export const withPageHelpers = createComponentMixin([{context: SectionContentContext, propName: 'sectionContent'}], [withErrorHandling], (TargetClass, InnerClass) => {
    InnerClass.prototype.setFlashMessage = function(severity, text) {
        return this.props.sectionContent.setFlashMessage(severity, text);
    };

    InnerClass.prototype.navigateTo = function(path) {
        return this.props.sectionContent.navigateTo(path);
    }

    InnerClass.prototype.navigateBack = function() {
        return this.props.sectionContent.navigateBack();
    }

    InnerClass.prototype.navigateToWithFlashMessage = function(path, severity, text) {
        return this.props.sectionContent.navigateToWithFlashMessage(path, severity, text);
    }

    return {};
});
