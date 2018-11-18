'use strict';

import React from 'react';
import ReportsCUD from './CUD';
import ReportsList from './List';
import ReportsView from './View';
import ReportsOutput from './Output';
import ReportTemplatesCUD from './templates/CUD';
import ReportTemplatesList from './templates/List';
import Share from '../shares/Share';
import {ReportState} from '../../../shared/reports';
import mailtrainConfig from 'mailtrainConfig';


function getMenus(t) {
    return {
        'reports': {
            title: t('reports'),
            link: '/reports',
            panelComponent: ReportsList,
            children: {
                ':reportId([0-9]+)': {
                    title: resolved => t('reportName-1', {name: resolved.report.name}),
                    resolve: {
                        report: params => `rest/reports/${params.reportId}`
                    },
                    link: params => `/reports/${params.reportId}/edit`,
                    navs: {
                        ':action(edit|delete)': {
                            title: t('edit'),
                            link: params => `/reports/${params.reportId}/edit`,
                            visible: resolved => resolved.report.permissions.includes('edit'),
                            panelRender: props => <ReportsCUD action={props.match.params.action} entity={props.resolved.report} />
                        },
                        view: {
                            title: t('view'),
                            link: params => `/reports/${params.reportId}/view`,
                            visible: resolved => resolved.report.permissions.includes('viewContent') && resolved.report.state === ReportState.FINISHED && resolved.report.mime_type === 'text/html',
                            panelRender: props => (<ReportsView {...props} />),
                        },
                        download: {
                            title: t('download'),
                            externalLink: params => `/reports/${params.reportId}/download`,
                            visible: resolved => resolved.report.permissions.includes('viewContent') && resolved.report.state === ReportState.FINISHED && resolved.report.mime_type === 'text/csv'
                        },
                        output: {
                            title: t('output'),
                            link: params => `/reports/${params.reportId}/output`,
                            visible: resolved => resolved.report.permissions.includes('viewOutput'),
                            panelRender: props => (<ReportsOutput {...props} />)
                        },
                        share: {
                            title: t('share'),
                            link: params => `/reports/${params.reportId}/share`,
                            visible: resolved => resolved.report.permissions.includes('share'),
                            panelRender: props => <Share title={t('share')} entity={props.resolved.report} entityTypeId="report" />
                        }
                    }
                },
                create: {
                    title: t('create'),
                    panelRender: props => <ReportsCUD action="create" />
                },
                templates: {
                    title: t('templates'),
                    link: '/reports/templates',
                    panelComponent: ReportTemplatesList,
                    children: {
                        ':templateId([0-9]+)': {
                            title: resolved => t('templateName', {name: resolved.template.name}),
                            resolve: {
                                template: params => `rest/report-templates/${params.templateId}`
                            },
                            link: params => `/reports/templates/${params.templateId}/edit`,
                            navs: {
                                ':action(edit|delete)': {
                                    title: t('edit'),
                                    link: params => `/reports/templates/${params.templateId}/edit`,
                                    visible: resolved => mailtrainConfig.globalPermissions.createJavascriptWithROAccess && resolved.template.permissions.includes('edit'),
                                    panelRender: props => <ReportTemplatesCUD action={props.match.params.action} entity={props.resolved.template} />
                                },
                                share: {
                                    title: t('share'),
                                    link: params => `/reports/templates/${params.templateId}/share`,
                                    visible: resolved => resolved.template.permissions.includes('share'),
                                    panelRender: props => <Share title={t('share')} entity={props.resolved.template} entityTypeId="reportTemplate" />
                                }
                            }
                        },
                        create: {
                            title: t('create'),
                            extraParams: [':wizard?'],
                            panelRender: props => <ReportTemplatesCUD action="create" wizard={props.match.params.wizard} />
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
