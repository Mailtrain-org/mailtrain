'use strict';

import React from "react";
import {ACEEditor} from "../../lib/form";
import 'brace/mode/html'
import 'brace/mode/xml'

export function getTemplateTypesOrder() {
    return ['mjml', 'html'];
}

export function getTemplateTypes(t) {
    const templateTypes = {};

    function clearBeforeSend(data) {
        delete data.html;
        delete data.mjml;
    }

    templateTypes.html = {
        typeName: t('HTML'),
        getForm: owner => <ACEEditor id="html" height="700px" mode="html" label={t('Template content')}/>,
        afterLoad: data => {
            data.html = data.data.html;
        },
        beforeSave: (data) => {
            data.data = {
                html: data.html
            };

            clearBeforeSend(data);
        },
    };

    templateTypes.mjml = {
        typeName: t('MJML'),
        getForm: owner => <ACEEditor id="html" height="700px" mode="xml" label={t('Template content')}/>,
        afterLoad: data => {
            data.mjml = data.data.mjml;
        },
        beforeSave: (data) => {
            data.data = {
                mjml: data.mjml
            };

            clearBeforeSend(data);
        },
    };

    return templateTypes;
}