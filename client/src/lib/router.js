'use strict';

import React, {useCallback, useContext, useEffect, useMemo} from 'react';
let confirmNavigation = async () => true;
let navigationPending = false;
let historyIndex = 0;

export function setNavigationConfirmation(handler) {
    confirmNavigation = handler;
    return () => { confirmNavigation = async () => true; };
}

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
        historyIndex = window.history.state?.mailtrainHistoryIndex || 0;
        window.history.replaceState({...window.history.state, mailtrainHistoryIndex: historyIndex}, '');
        let traversal = null;
        const onLocationChange = () => setLocation(getLocationObject());
        const onPopState = () => {
            const nextIndex = window.history.state?.mailtrainHistoryIndex || 0;
            if (traversal?.phase === 'approved') {
                if (nextIndex !== traversal.destination) {
                    window.history.go(traversal.destination - nextIndex);
                    return;
                }
                traversal = null;
                navigationPending = false;
                historyIndex = nextIndex;
                window.dispatchEvent(new Event('pushstate'));
                return;
            }
            if (!traversal && nextIndex === historyIndex) return;
            if (!traversal) {
                traversal = {destination: nextIndex, phase: 'restore'};
                navigationPending = true;
            }
            // Rapid traversals may deliver another popstate before restoration.
            // Only the original native entry can complete that restoration.
            if (nextIndex !== historyIndex) {
                window.history.go(historyIndex - nextIndex);
                return;
            }
            if (traversal.phase !== 'restore') return;
            traversal.phase = 'confirm';
            confirmNavigation().then(allowed => {
                if (allowed) {
                    traversal.phase = 'approved';
                    window.history.go(traversal.destination - historyIndex);
                } else {
                    traversal = null;
                    navigationPending = false;
                }
            }).catch(error => {
                traversal = null;
                navigationPending = false;
                console.error(error);
            });
        };
        window.addEventListener('popstate', onPopState);
        window.addEventListener('pushstate', onLocationChange);
        setLocation(getLocationObject());
        return () => {
            window.removeEventListener('popstate', onPopState);
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
        if (ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
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

export async function navigateTo(path, state) {
    if (navigationPending) return false;
    navigationPending = true;
    try {
        if (!await confirmNavigation()) return false;
        window.history.pushState({...state, mailtrainHistoryIndex: ++historyIndex}, '', path);
        window.dispatchEvent(new Event('pushstate'));
        return true;
    } finally {
        navigationPending = false;
    }
}

export function navigateBack() {
    window.history.back();
}
