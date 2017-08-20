'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../lib/i18n';
import qs from 'querystringify';

import { Section } from '../lib/page';
import ListsList from './List';
import ListsCUD from './CUD';
import FormsList from './forms/List';
import FormsCUD from './forms/CUD';
import FieldsList from './fields/List';
import FieldsCUD from './fields/CUD';
import SubscriptionsList from './subscriptions/List';
import SubscriptionsCUD from './subscriptions/CUD';
import SegmentsList from './segments/List';
import SegmentsCUD from './segments/CUD';
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
                            link: params => `/lists/${params.listId}/subscriptions`,
                            navs: {
                                subscriptions: {
                                    title: t('Subscribers'),
                                    resolve: {
                                        segments: params => `/rest/segments/${params.listId}`,
                                    },
                                    link: params => `/lists/${params.listId}/subscriptions`,
                                    visible: resolved => resolved.list.permissions.includes('viewSubscriptions'),
                                    render: props => <SubscriptionsList list={props.resolved.list} segments={props.resolved.segments} segmentId={qs.parse(props.location.search).segment} />,
                                    children: {
                                        ':subscriptionId([0-9]+)': {
                                            title: resolved => resolved.subscription.email,
                                            resolve: {
                                                subscription: params => `/rest/subscriptions/${params.listId}/${params.subscriptionId}`,
                                                fieldsGrouped: params => `/rest/fields-grouped/${params.listId}`
                                            },
                                            link: params => `/lists/${params.listId}/subscriptions/${params.subscriptionId}/edit`,
                                            navs: {
                                                ':action(edit|delete)': {
                                                    title: t('Edit'),
                                                    link: params => `/lists/${params.listId}/subscriptions/${params.subscriptionId}/edit`,
                                                    render: props => <SubscriptionsCUD action={props.match.params.action} entity={props.resolved.subscription} list={props.resolved.list} fieldsGrouped={props.resolved.fieldsGrouped} />
                                                }
                                            }
                                        },
                                        create: {
                                            title: t('Create'),
                                            resolve: {
                                                fieldsGrouped: params => `/rest/fields-grouped/${params.listId}`
                                            },
                                            render: props => <SubscriptionsCUD action="create" list={props.resolved.list} fieldsGrouped={props.resolved.fieldsGrouped} />
                                        }
                                    }                                },
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
                                    render: props => <FieldsList list={props.resolved.list} />,
                                    children: {
                                        ':fieldId([0-9]+)': {
                                            title: resolved => t('Field "{{name}}"', {name: resolved.field.name}),
                                            resolve: {
                                                field: params => `/rest/fields/${params.listId}/${params.fieldId}`,
                                                fields: params => `/rest/fields/${params.listId}`
                                            },
                                            link: params => `/lists/${params.listId}/fields/${params.fieldId}/edit`,
                                            navs: {
                                                ':action(edit|delete)': {
                                                    title: t('Edit'),
                                                    link: params => `/lists/${params.listId}/fields/${params.fieldId}/edit`,
                                                    render: props => <FieldsCUD action={props.match.params.action} entity={props.resolved.field} list={props.resolved.list} fields={props.resolved.fields} />
                                                }
                                            }
                                        },
                                        create: {
                                            title: t('Create'),
                                            resolve: {
                                                fields: params => `/rest/fields/${params.listId}`
                                            },
                                            render: props => <FieldsCUD action="create" list={props.resolved.list} fields={props.resolved.fields} />
                                        }
                                    }
                                },
                                segments: {
                                    title: t('Segments'),
                                    link: params => `/lists/${params.listId}/segments`,
                                    visible: resolved => resolved.list.permissions.includes('manageSegments'),
                                    render: props => <SegmentsList list={props.resolved.list} />,
                                    children: {
                                        ':segmentId([0-9]+)': {
                                            title: resolved => t('Segment "{{name}}"', {name: resolved.segment.name}),
                                            resolve: {
                                                segment: params => `/rest/segments/${params.listId}/${params.segmentId}`,
                                                fields: params => `/rest/fields/${params.listId}`
                                            },
                                            link: params => `/lists/${params.listId}/segments/${params.segmentId}/edit`,
                                            navs: {
                                                ':action(edit|delete)': {
                                                    title: t('Edit'),
                                                    link: params => `/lists/${params.listId}/segments/${params.segmentId}/edit`,
                                                    render: props => <SegmentsCUD action={props.match.params.action} entity={props.resolved.segment} list={props.resolved.list} fields={props.resolved.fields} />
                                                }
                                            }
                                        },
                                        create: {
                                            title: t('Create'),
                                            resolve: {
                                                fields: params => `/rest/fields/${params.listId}`
                                            },
                                            render: props => <SegmentsCUD action="create" list={props.resolved.list} fields={props.resolved.fields} />
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


