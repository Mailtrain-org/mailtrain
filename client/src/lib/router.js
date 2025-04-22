'use strict';

import React, {useCallback, useContext, useEffect, useMemo} from 'react';
import {getRoutes} from "./page-common";
export const LocationContext = React.createContext(null);

function getLocationObject() {
    return {
        search: location.search,
        pathname: location.pathname,
        state: window.history.state,
    };
}

export function Router(props) {
    const [location, setLocation] = React.useState(null);
    useEffect(() => {
        const onLocationChange = () => {
            setLocation(getLocationObject());
        };

        window.addEventListener('popstate', onLocationChange);
        window.addEventListener('pushstate', onLocationChange);

        setLocation(getLocationObject());

        return () => {
            console.log('Location handlers to be removed')
            window.removeEventListener('popstate', onLocationChange);
            window.removeEventListener('pushstate', onLocationChange);
        };
    }, []);

    if (!location) {
        return null;
    } else {
        return (
            <LocationContext.Provider value={location}>
                {props.children}
            </LocationContext.Provider>
        );
    }
}

export function Routes({routes, render}) {
    const location = useContext(LocationContext);

    const selection = useMemo(() => {
        for (const route of routes) {
            const match = route.regex.exec(location.pathname);

            if (match) {
                const props = {
                    match: {
                        params: match?.groups || {},
                    },
                    location: location,
                };

                return {
                    route,
                    props
                };
            }
        }

        return null;
    }, [routes, location]);

    if (selection) {
        return render(selection.route, selection.props);
    } else {
        return null;
    }
}

export function Link({to, className, onClick, children}) {
    const onClickHandler = useCallback(ev => {
        ev.preventDefault();
        ev.stopPropagation();

        if (onClick) {
            onClick();
        } else {
            navigateTo(to);
        }
    }, [to, onClick]);

    return <a href={to} className={className} onClick={onClickHandler}>{children}</a>;
}

export function Redirect({to}) {
    navigateTo(to)
    return null;
}

export function navigateTo(path, state) {
    window.history.pushState(state, '', path);
    window.dispatchEvent(new Event('pushstate'));
}

export function navigateBack() {
    window.history.back();
}

// const baseDir = getBaseDir();

/*
location.search
location.pathname

 */
