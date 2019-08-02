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
import ImportsList from './imports/List';
import ImportsCUD from './imports/CUD';
import ImportsStatus from './imports/Status';
import ImportRunsStatus from './imports/RunStatus';
import Share from '../shares/Share';
import TriggersList from './TriggersList';
import {ellipsizeBreadcrumbLabel} from "../lib/helpers";
import {namespaceCheckPermissions} from "../lib/namespace";

function getMenus(t) {
    return {
        'lists': {
            title: t('lists'),
            link: '/lists',
            checkPermissions: {
                createList: {
                    entityTypeId: 'namespace',
                    requiredOperations: ['createList']
                },
                createCustomForm: {
                    entityTypeId: 'namespace',
                    requiredOperations: ['createCustomForm']
                },
                viewCustomForm: {
                    entityTypeId: 'customForm',
                    requiredOperations: ['view']
                },
                ...namespaceCheckPermissions('createList')
            },
            panelRender: props => <ListsList permissions={props.permissions}/>,
            children: {
                ':listId([0-9]+)': {
                    title: resolved => t('listName', {name: ellipsizeBreadcrumbLabel(resolved.list.name)}),
                    resolve: {
                        list: params => `rest/lists/${params.listId}`
                    },
                    link: params => `/lists/${params.listId}/subscriptions`,
                    navs: {
                        subscriptions: {
                            title: t('subscribers'),
                            resolve: {
                                segments: params => `rest/segments/${params.listId}`,
                            },
                            link: params => `/lists/${params.listId}/subscriptions`,
                            visible: resolved => resolved.list.permissions.includes('viewSubscriptions'),
                            panelRender: props => <SubscriptionsList list={props.resolved.list} segments={props.resolved.segments} segmentId={qs.parse(props.location.search).segment} />,
                            children: {
                                ':subscriptionId([0-9]+)': {
                                    title: resolved => resolved.subscription.email,
                                    resolve: {
                                        subscription: params => `rest/subscriptions/${params.listId}/${params.subscriptionId}`,
                                        fieldsGrouped: params => `rest/fields-grouped/${params.listId}`
                                    },
                                    link: params => `/lists/${params.listId}/subscriptions/${params.subscriptionId}/edit`,
                                    navs: {
                                        ':action(edit|delete)': {
                                            title: t('edit'),
                                            link: params => `/lists/${params.listId}/subscriptions/${params.subscriptionId}/edit`,
                                            panelRender: props => <SubscriptionsCUD action={props.match.params.action} entity={props.resolved.subscription} list={props.resolved.list} fieldsGrouped={props.resolved.fieldsGrouped} />
                                        }
                                    }
                                },
                                create: {
                                    title: t('create'),
                                    resolve: {
                                        fieldsGrouped: params => `rest/fields-grouped/${params.listId}`
                                    },
                                    panelRender: props => <SubscriptionsCUD action="create" list={props.resolved.list} fieldsGrouped={props.resolved.fieldsGrouped} />
                                }
                            }                                },
                        ':action(edit|delete)': {
                            title: t('edit'),
                            link: params => `/lists/${params.listId}/edit`,
                            visible: resolved => resolved.list.permissions.includes('edit'),
                            panelRender: props => <ListsCUD action={props.match.params.action} entity={props.resolved.list} permissions={props.permissions} />
                        },
                        fields: {
                            title: t('fields'),
                            link: params => `/lists/${params.listId}/fields/`,
                            visible: resolved => resolved.list.permissions.includes('viewFields'),
                            panelRender: props => <FieldsList list={props.resolved.list} />,
                            children: {
                                ':fieldId([0-9]+)': {
                                    title: resolved => t('fieldName-1', {name: ellipsizeBreadcrumbLabel(resolved.field.name)}),
                                    resolve: {
                                        field: params => `rest/fields/${params.listId}/${params.fieldId}`,
                                        fields: params => `rest/fields/${params.listId}`
                                    },
                                    link: params => `/lists/${params.listId}/fields/${params.fieldId}/edit`,
                                    navs: {
                                        ':action(edit|delete)': {
                                            title: t('edit'),
                                            link: params => `/lists/${params.listId}/fields/${params.fieldId}/edit`,
                                            panelRender: props => <FieldsCUD action={props.match.params.action} entity={props.resolved.field} list={props.resolved.list} fields={props.resolved.fields} />
                                        }
                                    }
                                },
                                create: {
                                    title: t('create'),
                                    resolve: {
                                        fields: params => `rest/fields/${params.listId}`
                                    },
                                    panelRender: props => <FieldsCUD action="create" list={props.resolved.list} fields={props.resolved.fields} />
                                }
                            }
                        },
                        segments: {
                            title: t('segments'),
                            link: params => `/lists/${params.listId}/segments`,
                            visible: resolved => resolved.list.permissions.includes('viewSegments'),
                            panelRender: props => <SegmentsList list={props.resolved.list} />,
                            children: {
                                ':segmentId([0-9]+)': {
                                    title: resolved => t('segmentName', {name: ellipsizeBreadcrumbLabel(resolved.segment.name)}),
                                    resolve: {
                                        segment: params => `rest/segments/${params.listId}/${params.segmentId}`,
                                        fields: params => `rest/fields/${params.listId}`
                                    },
                                    link: params => `/lists/${params.listId}/segments/${params.segmentId}/edit`,
                                    navs: {
                                        ':action(edit|delete)': {
                                            title: t('edit'),
                                            link: params => `/lists/${params.listId}/segments/${params.segmentId}/edit`,
                                            panelRender: props => <SegmentsCUD action={props.match.params.action} entity={props.resolved.segment} list={props.resolved.list} fields={props.resolved.fields} />
                                        }
                                    }
                                },
                                create: {
                                    title: t('create'),
                                    resolve: {
                                        fields: params => `rest/fields/${params.listId}`
                                    },
                                    panelRender: props => <SegmentsCUD action="create" list={props.resolved.list} fields={props.resolved.fields} />
                                }
                            }
                        },
                        imports: {
                            title: t('imports'),
                            link: params => `/lists/${params.listId}/imports/`,
                            visible: resolved => resolved.list.permissions.includes('viewImports'),
                            panelRender: props => <ImportsList list={props.resolved.list} />,
                            children: {
                                ':importId([0-9]+)': {
                                    title: resolved => t('importName-1', {name: ellipsizeBreadcrumbLabel(resolved.import.name)}),
                                    resolve: {
                                        import: params => `rest/imports/${params.listId}/${params.importId}`,
                                    },
                                    link: params => `/lists/${params.listId}/imports/${params.importId}/status`,
                                    navs: {
                                        ':action(edit|delete)': {
                                            title: t('edit'),
                                            resolve: {
                                                fieldsGrouped: params => `rest/fields-grouped/${params.listId}`
                                            },
                                            link: params => `/lists/${params.listId}/imports/${params.importId}/edit`,
                                            panelRender: props => <ImportsCUD action={props.match.params.action} entity={props.resolved.import} list={props.resolved.list} fieldsGrouped={props.resolved.fieldsGrouped}/>
                                        },
                                        'status': {
                                            title: t('status'),
                                            link: params => `/lists/${params.listId}/imports/${params.importId}/status`,
                                            panelRender: props => <ImportsStatus entity={props.resolved.import} list={props.resolved.list} />,
                                            children: {
                                                ':importRunId([0-9]+)': {
                                                    title: resolved => t('run'),
                                                    resolve: {
                                                        importRun: params => `rest/import-runs/${params.listId}/${params.importId}/${params.importRunId}`,
                                                    },
                                                    link: params => `/lists/${params.listId}/imports/${params.importId}/status/${params.importRunId}`,
                                                    panelRender: props => <ImportRunsStatus entity={props.resolved.importRun} imprt={props.resolved.import} list={props.resolved.list} />
                                                }
                                            }
                                        }
                                    }
                                },
                                create: {
                                    title: t('create'),
                                    panelRender: props => <ImportsCUD action="create" list={props.resolved.list} />
                                }
                            }
                        },
                        triggers: {
                            title: t('triggers'),
                            link: params => `/lists/${params.listId}/triggers`,
                            panelRender: props => <TriggersList list={props.resolved.list} />
                        },
                        share: {
                            title: t('share'),
                            link: params => `/lists/${params.listId}/share`,
                            visible: resolved => resolved.list.permissions.includes('share'),
                            panelRender: props => <Share title={t('share')} entity={props.resolved.list} entityTypeId="list" />
                        }
                    }
                },
                create: {
                    title: t('create'),
                    panelRender: props => <ListsCUD action="create" permissions={props.permissions} />
                },
                forms: {
                    title: t('customForms-1'),
                    link: '/lists/forms',
                    checkPermissions: {
                        ...namespaceCheckPermissions('createCustomForm')
                    },
                    panelRender: props => <FormsList permissions={props.permissions}/>,
                    children: {
                        ':formsId([0-9]+)': {
                            title: resolved => t('customFormsName', {name: ellipsizeBreadcrumbLabel(resolved.forms.name)}),
                            resolve: {
                                forms: params => `rest/forms/${params.formsId}`
                            },
                            link: params => `/lists/forms/${params.formsId}/edit`,
                            navs: {
                                ':action(edit|delete)': {
                                    title: t('edit'),
                                    link: params => `/lists/forms/${params.formsId}/edit`,
                                    visible: resolved => resolved.forms.permissions.includes('edit'),
                                    panelRender: props => <FormsCUD action={props.match.params.action} entity={props.resolved.forms} permissions={props.permissions} />
                                },
                                share: {
                                    title: t('share'),
                                    link: params => `/lists/forms/${params.formsId}/share`,
                                    visible: resolved => resolved.forms.permissions.includes('share'),
                                    panelRender: props => <Share title={t('share')} entity={props.resolved.forms} entityTypeId="customForm" />
                                }
                            }
                        },
                        create: {
                            title: t('create'),
                            panelRender: props => <FormsCUD action="create" permissions={props.permissions} />
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
