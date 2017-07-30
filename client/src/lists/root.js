'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../lib/i18n';

import { Section } from '../lib/page';
import ListsList from './List';
import ListsCUD from './CUD';
import FormsList from './forms/List';
import FormsCUD from './forms/CUD';
import Share from '../shares/Share';


const getStructure = t => {
    const subPaths = {};

    return {
        '': {
            title: t('Home'),
            externalLink: '/',
            children: {
                'lists': {
                    title: t('Lists'),
                    link: '/lists',
                    component: ListsList,
                    children: {
                        edit: {
                            title: t('Edit List'),
                            params: [':id', ':action?'],
                            render: props => (<ListsCUD edit {...props} />)
                        },
                        create: {
                            title: t('Create List'),
                            render: props => (<ListsCUD {...props} />)
                        },
                        share: {
                            title: t('Share List'),
                            params: [':id'],
                            render: props => (<Share title={entity => t('Share List "{{name}}"', {name: entity.name})} getUrl={id => `/rest/lists/${id}`} entityTypeId="list" {...props} />)
                        },
                        forms: {
                            title: t('Custom Forms'),
                            link: '/lists/forms',
                            component: FormsList,
                            children: {
                                edit: {
                                    title: t('Edit Custom Forms'),
                                    params: [':id', ':action?'],
                                    render: props => (<FormsCUD edit {...props} />)
                                },
                                create: {
                                    title: t('Create Custom Forms'),
                                    render: props => (<FormsCUD {...props} />)
                                },
                                share: {
                                    title: t('Share Custom Forms'),
                                    params: [':id'],
                                    render: props => (<Share title={entity => t('Custom Forms "{{name}}"', {name: entity.name})} getUrl={id => `/rest/forms/${id}`} entityTypeId="customForm" {...props} />)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

export default function() {
    ReactDOM.render(
        <I18nextProvider i18n={ i18n }><Section root='/lists' structure={getStructure}/></I18nextProvider>,
        document.getElementById('root')
    );
};


