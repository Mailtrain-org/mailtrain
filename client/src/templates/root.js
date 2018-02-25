'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../lib/i18n';

import { Section } from '../lib/page';
import TemplatesCUD from './CUD';
import TemplatesList from './List';
import Share from '../shares/Share';


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
                }
            }
        }
    };
}

export default {
    getMenus
}
