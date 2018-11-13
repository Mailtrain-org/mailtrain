'use strict';

export const CodeEditorSourceType = {
    MJML: 'mjml',
    HTML: 'html'
};

export const getCodeEditorSourceTypeOptions = t => [
    {key: CodeEditorSourceType.MJML, label: t('MJML')},
    {key: CodeEditorSourceType.HTML, label: t('HTML')}
];
