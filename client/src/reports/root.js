'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../lib/i18n';

import { Section } from '../lib/page'
import CUD from './CUD'
import List from './List'

const getStructure = t => {
    const subPaths = {};

    return {
        '': {
            title: t('Home'),
            externalLink: '/',
            children: {
                'report-templates': {
                    title: t('Report Templates'),
                    link: '/report-templates',
                    component: List,
                    children: {
                        edit: {
                            title: t('Edit Report Template'),
                            params: [':id', ':action?'],
                            render: props => (<CUD edit {...props} />)
                        },
                        create: {
                            title: t('Create Report Template'),
                            params: [':wizard?'],
                            render: props => (<CUD {...props} />)
                        }
                    }
                }
            }
        }
    }
};

export default function() {
    ReactDOM.render(
        <I18nextProvider i18n={ i18n }><Section root='/report-templates' structure={getStructure}/></I18nextProvider>,
        document.getElementById('root')
    );
};


