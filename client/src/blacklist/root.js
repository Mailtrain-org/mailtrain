'use strict';

import React from "react";
import ReactDOM from "react-dom";
import {I18nextProvider} from "react-i18next";
import i18n from "../lib/i18n";

import {Section} from "../lib/page";
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
