'use strict';

import React from 'react';

import TemplatesCUD from './CUD';
import TemplatesList from './List';
import Share from '../shares/Share';
import Files from "../lib/files";
import MosaicoCUD from './mosaico/CUD';
import MosaicoList from './mosaico/List';
import {ellipsizeBreadcrumbLabel} from "../lib/helpers";
import {namespaceCheckPermissions} from "../lib/namespace";

function getMenus(t) {
    return {
        'templates': {
            title: t('templates'),
            link: '/templates',
            checkPermissions: {
                createTemplate: {
                    entityTypeId: 'namespace',
                    requiredOperations: ['createTemplate']
                },
                createMosaicoTemplate: {
                    entityTypeId: 'namespace',
                    requiredOperations: ['createMosaicoTemplate']
                },
                viewMosaicoTemplate: {
                    entityTypeId: 'mosaicoTemplate',
                    requiredOperations: ['view']
                },
                ...namespaceCheckPermissions('createTemplate')
            },
            panelRender: props => <TemplatesList permissions={props.permissions}/>,
            children: {
                ':templateId([0-9]+)': {
                    title: resolved => t('templateName', {name: ellipsizeBreadcrumbLabel(resolved.template.name)}),
                    resolve: {
                        template: params => `rest/templates/${params.templateId}`
                    },
                    link: params => `/templates/${params.templateId}/edit`,
                    navs: {
                        ':action(edit|delete)': {
                            title: t('edit'),
                            link: params => `/templates/${params.templateId}/edit`,
                            visible: resolved => resolved.template.permissions.includes('view') || resolved.template.permissions.includes('edit'),
                            panelRender: props => <TemplatesCUD action={props.match.params.action} entity={props.resolved.template} permissions={props.permissions} setPanelInFullScreen={props.setPanelInFullScreen} />
                        },
                        files: {
                            title: t('files'),
                            link: params => `/templates/${params.templateId}/files`,
                            visible: resolved => resolved.template.permissions.includes('viewFiles'),
                            panelRender: props => <Files title={t('files')} help={t('theseFilesArePubliclyAvailableViaHttpSo')} entity={props.resolved.template} entityTypeId="template" entitySubTypeId="file" managePermission="manageFiles"/>
                        },
                        share: {
                            title: t('share'),
                            link: params => `/templates/${params.templateId}/share`,
                            visible: resolved => resolved.template.permissions.includes('share'),
                            panelRender: props => <Share title={t('share')} entity={props.resolved.template} entityTypeId="template" />
                        }
                    }
                },
                create: {
                    title: t('create'),
                    panelRender: props => <TemplatesCUD action="create" permissions={props.permissions} />
                },
                mosaico: {
                    title: t('mosaicoTemplates'),
                    link: '/templates/mosaico',
                    checkPermissions: {
                        ...namespaceCheckPermissions('createMosaicoTemplate')
                    },
                    panelRender: props => <MosaicoList  permissions={props.permissions}/>,
                    children: {
                        ':mosaiceTemplateId([0-9]+)': {
                            title: resolved => t('mosaicoTemplateName', {name: ellipsizeBreadcrumbLabel(resolved.mosaicoTemplate.name)}),
                            resolve: {
                                mosaicoTemplate: params => `rest/mosaico-templates/${params.mosaiceTemplateId}`
                            },
                            link: params => `/templates/mosaico/${params.mosaiceTemplateId}/edit`,
                            navs: {
                                ':action(edit|delete)': {
                                    title: t('edit'),
                                    link: params => `/templates/mosaico/${params.mosaiceTemplateId}/edit`,
                                    visible: resolved => resolved.mosaicoTemplate.permissions.includes('view') || resolved.mosaicoTemplate.permissions.includes('edit'),
                                    panelRender: props => <MosaicoCUD action={props.match.params.action} entity={props.resolved.mosaicoTemplate} permissions={props.permissions}/>
                                },
                                files: {
                                    title: t('files'),
                                    link: params => `/templates/mosaico/${params.mosaiceTemplateId}/files`,
                                    visible: resolved => resolved.mosaicoTemplate.permissions.includes('viewFiles'),
                                    panelRender: props => <Files title={t('files')} help={t('theseFilesArePubliclyAvailableViaHttpSo-1')} entity={props.resolved.mosaicoTemplate} entityTypeId="mosaicoTemplate" entitySubTypeId="file" managePermission="manageFiles" />
                                },
                                blocks: {
                                    title: t('blockThumbnails'),
                                    link: params => `/templates/mosaico/${params.mosaiceTemplateId}/blocks`,
                                    visible: resolved => resolved.mosaicoTemplate.permissions.includes('viewFiles'),
                                    panelRender: props => <Files title={t('blockThumbnails')} help={t('theseFilesWillBeUsedByMosaicoToSearchFor')}entity={props.resolved.mosaicoTemplate} entityTypeId="mosaicoTemplate" entitySubTypeId="block" managePermission="manageFiles" />
                                },
                                share: {
                                    title: t('share'),
                                    link: params => `/templates/mosaico/${params.mosaiceTemplateId}/share`,
                                    visible: resolved => resolved.mosaicoTemplate.permissions.includes('share'),
                                    panelRender: props => <Share title={t('share')} entity={props.resolved.mosaicoTemplate} entityTypeId="mosaicoTemplate" />
                                }
                            }
                        },
                        create: {
                            title: t('create'),
                            extraParams: [':wizard?'],
                            panelRender: props => <MosaicoCUD action="create" wizard={props.match.params.wizard} permissions={props.permissions} />
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
