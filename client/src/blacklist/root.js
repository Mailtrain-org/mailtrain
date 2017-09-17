'use strict';

import React from "react";
import ReactDOM from "react-dom";
import {I18nextProvider} from "react-i18next";
import i18n from "../lib/i18n";

import {Section} from "../lib/page";
import List from "./List";

const getStructure = t => {
    return {
        '': {
            title: t('Home'),
            externalLink: '/',
            children: {
                'blacklist': {
                    title: t('Blacklist'),
                    link: '/blacklist',
                    panelComponent: List,
                }
            }
        }
    }
};

export default function() {
    ReactDOM.render(
        <I18nextProvider i18n={ i18n }><Section root='/blacklist' structure={getStructure}/></I18nextProvider>,
        document.getElementById('root')
    );
}


