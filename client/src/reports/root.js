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
                        edit: {
                            title: t('Edit Report'),
                            params: [':id', ':action?'],
                            render: props => (<ReportsCUD edit {...props} />)
                        },
                        create: {
                            title: t('Create Report'),
                            render: props => (<ReportsCUD {...props} />)
                        },
                        view: {
                            title: t('View Report'),
                            params: [':id' ],
                            render: props => (<ReportsView {...props} />)
                        },
                        output: {
                            title: t('View Report Output'),
                            params: [':id' ],
                            render: props => (<ReportsOutput {...props} />)
                        },
                        share: {
                            title: t('Share Report'),
                            params: [':id'],
                            render: props => (<Share title={entity => t('Share Report "{{name}}"', {name: entity.name})} getUrl={id => `/rest/reports/${id}`} entityTypeId="report" {...props} />)
                        },
                        'templates': {
                            title: t('Templates'),
                            link: '/reports/templates',
                            component: ReportTemplatesList,
                            children: {
                                edit: {
                                    title: t('Edit Report Template'),
                                    params: [':id', ':action?'],
                                    render: props => (<ReportTemplatesCUD edit {...props} />)
                                },
                                create: {
                                    title: t('Create Report Template'),
                                    params: [':wizard?'],
                                    render: props => (<ReportTemplatesCUD {...props} />)
                                },
                                share: {
                                    title: t('Share Report Template'),
                                    params: [':id'],
                                    render: props => (<Share title={entity => t('Share Report Template "{{name}}"', {name: entity.name})} getUrl={id => `/rest/report-templates/${id}`} entityTypeId="reportTemplate" {...props} />)
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


