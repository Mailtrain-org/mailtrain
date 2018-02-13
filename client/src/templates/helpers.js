'use strict';

import React from "react";
import {ACEEditor, SummernoteEditor} from "../lib/form";
import 'brace/mode/text';
import 'brace/mode/html'

export function getTemplateTypes(t) {

    const templateTypes = {};

    templateTypes.mosaico = {
        typeName: t('Mosaico')
    };

    templateTypes.grapejs = {
        typeName: t('GrapeJS')
    };

    templateTypes.ckeditor = {
        typeName: t('CKEditor'),
        form: <SummernoteEditor id="html" height="600px" label={t('Template content (HTML)')}/>
    };

    templateTypes.codeeditor = {
        typeName: t('Code Editor'),
        form: <ACEEditor id="html" height="600px" mode="html" label={t('Template content (HTML)')}/>
    };

    templateTypes.mjml = {
        typeName: t('MJML')
    };

    return templateTypes;
}