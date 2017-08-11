'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../lib/i18n';

import { Section } from '../lib/page';
import ReportsCUD from './CUD';
import ReportsList from './List';
import ReportsView from './View';
import ReportsOutput from './Output';
import ReportTemplatesCUD from './templates/CUD';
import ReportTemplatesList from './templates/List';
import Share from '../shares/Share';
import { ReportState } from '../../../shared/reports';


const getStructure = t => {
    const subPaths = {};

    return {
        '': {
            title: t('Home'),
            externalLink: '/',
            children: {
                'reports': {
                    title: t('Reports'),
                    link: '/reports',
                    component: ReportsList,
                    children: {
                        ':reportId([0-9]+)': {
                            title: resolved => t('Report "{{name}}"', {name: resolved.report.name}),
                            resolve: {
                                report: params => `/rest/reports/${params.reportId}`
                            },
                            link: params => `/reports/${params.reportId}/edit`,
                            navs: {
                                ':action(edit|delete)': {
                                    title: t('Edit'),
                                    link: params => `/reports/${params.reportId}/edit`,
                                    visible: resolved => resolved.report.permissions.includes('edit'),
                                    render: props => <ReportsCUD action={props.match.params.action} entity={props.resolved.report} />
                                },
                                view: {
                                    title: t('View'),
                                    link: params => `/reports/${params.reportId}/view`,
                                    visible: resolved => resolved.report.permissions.includes('viewContent') && resolved.report.state === ReportState.FINISHED && resolved.report.mime_type === 'text/html',
                                    render: props => (<ReportsView {...props} />),
                                },
                                download: {
                                    title: t('Download'),
                                    externalLink: params => `/reports/${params.reportId}/download`,
                                    visible: resolved => resolved.report.permissions.includes('viewContent') && resolved.report.state === ReportState.FINISHED && resolved.report.mime_type === 'text/csv'
                                },
                                output: {
                                    title: t('Output'),
                                    link: params => `/reports/${params.reportId}/output`,
                                    visible: resolved => resolved.report.permissions.includes('viewOutput'),
                                    render: props => (<ReportsOutput {...props} />)
                                },
                                share: {
                                    title: t('Share'),
                                    link: params => `/reports/${params.reportId}/share`,
                                    visible: resolved => resolved.report.permissions.includes('share'),
                                    render: props => <Share title={t('Share')} entity={props.resolved.report} entityTypeId="report" />
                                }
                            }
                        },
                        create: {
                            title: t('Create'),
                            render: props => <ReportsCUD action="create" />
                        },
                        'templates': {
                            title: t('Templates'),
                            link: '/reports/templates',
                            component: ReportTemplatesList,
                            children: {
                                ':templateId([0-9]+)': {
                                    title: resolved => t('Template "{{name}}"', {name: resolved.template.name}),
                                    resolve: {
                                        template: params => `/rest/report-templates/${params.templateId}`
                                    },
                                    link: params => `/reports/templates/${params.templateId}/edit`,
                                    navs: {
                                        ':action(edit|delete)': {
                                            title: t('Edit'),
                                            link: params => `/reports/templates/${params.templateId}/edit`,
                                            visible: resolved => resolved.template.permissions.includes('edit'),
                                            render: props => <ReportTemplatesCUD action={props.match.params.action} entity={props.resolved.template} />
                                        },
                                        share: {
                                            title: t('Share'),
                                            link: params => `/reports/templates/${params.templateId}/share`,
                                            visible: resolved => resolved.template.permissions.includes('share'),
                                            render: props => <Share title={t('Share')} entity={props.resolved.template} entityTypeId="reportTemplate" />
                                        }
                                    }
                                },
                                create: {
                                    title: t('Create'),
                                    extraParams: [':wizard?'],
                                    render: props => <ReportTemplatesCUD action="create" wizard={props.match.params.wizard} />
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
        <I18nextProvider i18n={ i18n }><Section root='/reports' structure={getStructure}/></I18nextProvider>,
        document.getElementById('root')
    );
};


