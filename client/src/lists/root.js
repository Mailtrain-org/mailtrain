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
/* FIXME
                        ':listId': {
                            title: resolved => t('List "{{name}}"', {name: resolved.list.name}),
                            resolve: {
                                list: match => `/rest/lists/${match.params.listId}`
                            },
                            actions: {
                                edit: {
                                    title: t('Edit'),
                                    params: [':action?'],
                                    render: props => (<ListsCUD edit entity={resolved.list} {...props} />)
                                },
                                create: {
                                    title: t('Create'),
                                    render: props => (<ListsCUD entity={resolved.list} {...props} />)
                                },
                                share: {
                                    title: t('Share'),
                                    render: props => (<Share title={t('Share')} entity={resolved.list} entityTypeId="list" {...props} />)
                                }
                            }
                        },
*/
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
                        fields: {
                            title: t('Fields'),
                            params: [':listId'],
                            link: match => `/lists/fields/${match.params.listId}`,
                            component: FieldsList,
                            children: {
                                 edit: {
                                     title: t('Edit Field'),
                                     params: [':listId', ':fieldId', ':action?'],
                                     render: props => (<FieldsCUD edit {...props} />)
                                 },
                                 create: {
                                     title: t('Create Field'),
                                     params: [':listId'],
                                     render: props => (<FieldsCUD {...props} />)
                                 },
                            }
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


