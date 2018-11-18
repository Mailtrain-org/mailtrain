'use strict';

import React from "react";
import List from "./List";

function getMenus(t) {
    return {
        'blacklist': {
            title: t('blacklist'),
            link: '/blacklist',
            panelComponent: List,
        }
    };
}

export default {
    getMenus
}
