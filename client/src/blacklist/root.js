'use strict';

import React from "react";
import List from "./List";

function getMenus(t) {
    return {
        'blacklist': {
            title: t('Blacklist'),
            link: '/blacklist',
            panelComponent: List,
        }
    };
}

export default {
    getMenus
}
