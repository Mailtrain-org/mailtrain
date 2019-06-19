'use strict';

export const GrapesJSSourceType = {
    MJML: 'mjml',
    HTML: 'html'
};

export const getGrapesJSSourceTypeOptions = t => [
    {key: GrapesJSSourceType.MJML, label: t('mjml')},
    {key: GrapesJSSourceType.HTML, label: t('html')}
];
