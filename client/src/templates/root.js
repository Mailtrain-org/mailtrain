'use strict';

import React from 'react';

import TemplatesCUD from './CUD';
import TemplatesList from './List';
import Share from '../shares/Share';
import Files from "../lib/files";
import MosaicoCUD from './mosaico/CUD';
import MosaicoList from './mosaico/List';


function getMenus(t) {
    return {
        'templates': {
            title: t('Templates'),
            link: '/templates',
            panelComponent: TemplatesList,
            children: {
                ':templateId([0-9]+)': {
                    title: resolved => t('Template "{{name}}"', {name: resolved.template.name}),
                    resolve: {
                        template: params => `/rest/templates/${params.templateId}`
                    },
                    link: params => `/templates/${params.templateId}/edit`,
                    navs: {
                        ':action(edit|delete)': {
                            title: t('Edit'),
                            link: params => `/templates/${params.templateId}/edit`,
                            visible: resolved => resolved.template.permissions.includes('edit'),
                            panelRender: props => <TemplatesCUD action={props.match.params.action} entity={props.resolved.template} />
                        },
                        files: {
                            title: t('Files'),
                            link: params => `/templates/${params.templateId}/files`,
                            visible: resolved => resolved.template.permissions.includes('edit'),
                            panelRender: props => <Files title={t('Files')} entity={props.resolved.template} entityTypeId="template" />
                        },
                        share: {
                            title: t('Share'),
                            link: params => `/templates/${params.templateId}/share`,
                            visible: resolved => resolved.template.permissions.includes('share'),
                            panelRender: props => <Share title={t('Share')} entity={props.resolved.template} entityTypeId="template" />
                        }
                    }
                },
                create: {
                    title: t('Create'),
                    panelRender: props => <TemplatesCUD action="create" />
                },
                mosaico: {
                    title: t('Mosaico Templates'),
                    link: '/templates/mosaico',
                    panelComponent: MosaicoList,
                    children: {
                        ':mosaiceTemplateId([0-9]+)': {
                            title: resolved => t('Mosaico Template "{{name}}"', {name: resolved.mosaicoTemplate.name}),
                            resolve: {
                                mosaicoTemplate: params => `/rest/mosaico-templates/${params.mosaiceTemplateId}`
                            },
                            link: params => `/templates/mosaico/${params.mosaiceTemplateId}/edit`,
                            navs: {
                                ':action(edit|delete)': {
                                    title: t('Edit'),
                                    link: params => `/templates/mosaico/${params.mosaiceTemplateId}/edit`,
                                    visible: resolved => resolved.mosaicoTemplate.permissions.includes('edit'),
                                    panelRender: props => <MosaicoCUD action={props.match.params.action} entity={props.resolved.mosaicoTemplate} />
                                },
                                files: {
                                    title: t('Files'),
                                    link: params => `/templates/mosaico/${params.mosaiceTemplateId}/files`,
                                    visible: resolved => resolved.mosaicoTemplate.permissions.includes('edit'),
                                    panelRender: props => <Files title={t('Files')} entity={props.resolved.mosaicoTemplate} entityTypeId="mosaicoTemplate" />
                                },
                                share: {
                                    title: t('Share'),
                                    link: params => `/templates/mosaico/${params.mosaiceTemplateId}/share`,
                                    visible: resolved => resolved.mosaicoTemplate.permissions.includes('share'),
                                    panelRender: props => <Share title={t('Share')} entity={props.resolved.mosaicoTemplate} entityTypeId="mosaicoTemplate" />
                                }
                            }
                        },
                        create: {
                            title: t('Create'),
                            extraParams: [':wizard?'],
                            panelRender: props => <MosaicoCUD action="create" wizard={props.match.params.wizard} />
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
