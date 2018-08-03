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
                        template: params => `rest/templates/${params.templateId}`
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
                            visible: resolved => resolved.template.permissions.includes('viewFiles'),
                            panelRender: props => <Files title={t('Files')} help={t('These files are publicly available via HTTP so that they can be linked to from the content of the campaign.')} entity={props.resolved.template} entityTypeId="template" entitySubTypeId="file" managePermission="manageFiles"/>
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
                                mosaicoTemplate: params => `rest/mosaico-templates/${params.mosaiceTemplateId}`
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
                                    visible: resolved => resolved.mosaicoTemplate.permissions.includes('viewFiles'),
                                    panelRender: props => <Files title={t('Files')} help={t('These files are publicly available via HTTP so that they can be linked to from the Mosaico template.')} entity={props.resolved.mosaicoTemplate} entityTypeId="mosaicoTemplate" entitySubTypeId="file" managePermission="manageFiles" />
                                },
                                blocks: {
                                    title: t('Block thumbnails'),
                                    link: params => `/templates/mosaico/${params.mosaiceTemplateId}/blocks`,
                                    visible: resolved => resolved.mosaicoTemplate.permissions.includes('viewFiles'),
                                    panelRender: props => <Files title={t('Block thumbnails')} help={t('These files will be used by Mosaico to search for block thumbnails (the "edres" directory). Place here one file per block type that you have defined in the Mosaico template. Each file must have the same name as the block id. The file will be used as the thumbnail of the corresponding block.')}entity={props.resolved.mosaicoTemplate} entityTypeId="mosaicoTemplate" entitySubTypeId="block" managePermission="manageFiles" />
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
