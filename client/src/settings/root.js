'use strict';

import React from "react";
import Update from "./Update";

function getMenus(t) {
    return {
        'settings': {
            title: t('globalSettings'),
            link: '/settings',
            resolve: {
                configItems: params => `rest/settings`
            },
            panelRender: props => <Update entity={props.resolved.configItems} />
        }
    };
}

export default {
    getMenus
}
