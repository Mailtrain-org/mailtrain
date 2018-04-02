'use strict';

import React from 'react';
import qs from 'querystringify';
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


function getMenus(t) {
    return {
        'lists': {
            title: t('Lists'),
            link: '/lists',
            panelComponent: ListsList,
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
                            panelRender: props => <SubscriptionsList list={props.resolved.list} segments={props.resolved.segments} segmentId={qs.parse(props.location.search).segment} />,
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
                                            panelRender: props => <SubscriptionsCUD action={props.match.params.action} entity={props.resolved.subscription} list={props.resolved.list} fieldsGrouped={props.resolved.fieldsGrouped} />
                                        }
                                    }
                                },
                                create: {
                                    title: t('Create'),
                                    resolve: {
                                        fieldsGrouped: params => `/rest/fields-grouped/${params.listId}`
                                    },
                                    panelRender: props => <SubscriptionsCUD action="create" list={props.resolved.list} fieldsGrouped={props.resolved.fieldsGrouped} />
                                }
                            }                                },
                        ':action(edit|delete)': {
                            title: t('Edit'),
                            link: params => `/lists/${params.listId}/edit`,
                            visible: resolved => resolved.list.permissions.includes('edit'),
                            panelRender: props => <ListsCUD action={props.match.params.action} entity={props.resolved.list} />
                        },
                        fields: {
                            title: t('Fields'),
                            link: params => `/lists/${params.listId}/fields/`,
                            visible: resolved => resolved.list.permissions.includes('manageFields'),
                            panelRender: props => <FieldsList list={props.resolved.list} />,
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
                                            panelRender: props => <FieldsCUD action={props.match.params.action} entity={props.resolved.field} list={props.resolved.list} fields={props.resolved.fields} />
                                        }
                                    }
                                },
                                create: {
                                    title: t('Create'),
                                    resolve: {
                                        fields: params => `/rest/fields/${params.listId}`
                                    },
                                    panelRender: props => <FieldsCUD action="create" list={props.resolved.list} fields={props.resolved.fields} />
                                }
                            }
                        },
                        segments: {
                            title: t('Segments'),
                            link: params => `/lists/${params.listId}/segments`,
                            visible: resolved => resolved.list.permissions.includes('manageSegments'),
                            panelRender: props => <SegmentsList list={props.resolved.list} />,
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
                                            panelRender: props => <SegmentsCUD action={props.match.params.action} entity={props.resolved.segment} list={props.resolved.list} fields={props.resolved.fields} />
                                        }
                                    }
                                },
                                create: {
                                    title: t('Create'),
                                    resolve: {
                                        fields: params => `/rest/fields/${params.listId}`
                                    },
                                    panelRender: props => <SegmentsCUD action="create" list={props.resolved.list} fields={props.resolved.fields} />
                                }
                            }
                        },
                        share: {
                            title: t('Share'),
                            link: params => `/lists/${params.listId}/share`,
                            visible: resolved => resolved.list.permissions.includes('share'),
                            panelRender: props => <Share title={t('Share')} entity={props.resolved.list} entityTypeId="list" />
                        }
                    }
                },
                create: {
                    title: t('Create'),
                    panelRender: props => <ListsCUD action="create" />
                },
                forms: {
                    title: t('Custom Forms'),
                    link: '/lists/forms',
                    panelComponent: FormsList,
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
                                    panelRender: props => <FormsCUD action={props.match.params.action} entity={props.resolved.forms} />
                                },
                                share: {
                                    title: t('Share'),
                                    link: params => `/lists/forms/${params.formsId}/share`,
                                    visible: resolved => resolved.forms.permissions.includes('share'),
                                    panelRender: props => <Share title={t('Share')} entity={props.resolved.forms} entityTypeId="customForm" />
                                }
                            }
                        },
                        create: {
                            title: t('Create'),
                            panelRender: props => <FormsCUD action="create" />
                        }
                    }
                }
            }
        }
    };
}


export default {
    getMenus
}
