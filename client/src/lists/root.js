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
import FieldsList from './fields/List';
import FieldsCUD from './fields/CUD';
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
                        ':listId([0-9]+)': {
                            title: resolved => t('List "{{name}}"', {name: resolved.list.name}),
                            resolve: {
                                list: params => `/rest/lists/${params.listId}`
                            },
                            link: params => `/lists/${params.listId}/edit`,
                            navs: {
                                ':action(edit|delete)': {
                                    title: t('Edit'),
                                    link: params => `/lists/${params.listId}/edit`,
                                    visible: resolved => resolved.list.permissions.includes('edit'),
                                    render: props => <ListsCUD action={props.match.params.action} entity={props.resolved.list} />
                                },
                                fields: {
                                    title: t('Fields'),
                                    link: params => `/lists/${params.listId}/fields/`,
                                    visible: resolved => resolved.list.permissions.includes('manageFields'),
                                    component: FieldsList,
                                    children: {
                                        ':fieldId([0-9]+)': {
                                            title: resolved => t('Field "{{name}}"', {name: resolved.field.name}),
                                            resolve: {
                                                field: params => `/rest/fields/${params.listId}/${params.fieldId}`
                                            },
                                            link: params => `/lists/${params.listId}/fields/${params.fieldId}/edit`,
                                            navs: {
                                                ':action(edit|delete)': {
                                                    title: t('Edit'),
                                                    link: params => `/lists/${params.listId}/fields/${params.fieldId}/edit`,
                                                    render: props => <FieldsCUD action={props.match.params.action} entity={props.resolved.field} list={props.resolved.list} />
                                                }
                                            }
                                        },
                                        create: {
                                            title: t('Create Field'),
                                            render: props => <FieldsCUD action="create" list={props.resolved.list} />
                                        }
                                    }
                                },
                                share: {
                                    title: t('Share'),
                                    link: params => `/lists/${params.listId}/share`,
                                    visible: resolved => resolved.list.permissions.includes('share'),
                                    render: props => <Share title={t('Share')} entity={props.resolved.list} entityTypeId="list" />
                                }
                            }
                        },
                        create: {
                            title: t('Create'),
                            render: props => <ListsCUD action="create" />
                        },
                        forms: {
                            title: t('Custom Forms'),
                            link: '/lists/forms',
                            component: FormsList,
                            children: {
                                ':formsId([0-9]+)': {
                                    title: resolved => t('Custom Forms "{{name}}"', {name: resolved.forms.name}),
                                    resolve: {
                                        forms: params => `/rest/forms/${params.formsId}`
                                    },
                                    link: params => `/lists/forms/${params.formsId}/edit`,
                                    navs: {
                                        ':action(edit|delete)': {
                                            title: t('Edit'),
                                            link: params => `/lists/forms/${params.formsId}/edit`,
                                            visible: resolved => resolved.forms.permissions.includes('edit'),
                                            render: props => <FormsCUD action={props.match.params.action} entity={props.resolved.forms} />
                                        },
                                        share: {
                                            title: t('Share'),
                                            link: params => `/lists/forms/${params.formsId}/share`,
                                            visible: resolved => resolved.forms.permissions.includes('share'),
                                            render: props => <Share title={t('Share')} entity={props.resolved.forms} entityTypeId="customForm" />
                                        }
                                    }
                                },
                                create: {
                                    title: t('Create'),
                                    render: props => <FormsCUD action="create" />
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


