'use strict';

import React from "react";
import {
    ACEEditor,
    AlignedRow,
    CKEditor
} from "../lib/form";
import 'brace/mode/text';
import 'brace/mode/html'

import {MosaicoEditor, ResourceType} from "../lib/mosaico";


export function getTemplateTypes(t) {

    const templateTypes = {};

    templateTypes.mosaico = {
        typeName: t('Mosaico'),
        getHTMLEditor: owner => <AlignedRow label={t('Template content (HTML)')}><MosaicoEditor ref={node => owner.editorNode = node} entity={owner.props.entity} entityTypeId={ResourceType.TEMPLATE} title={t('Mosaico Template Designer')} onFullscreenAsync={::owner.setElementInFullscreen}/></AlignedRow>,
        htmlEditorBeforeSave: async owner => {
            const {html, metadata, model} = await owner.editorNode.exportState();
            owner.updateFormValue('html', html);
            owner.updateFormValue('data', {metadata, model});
        }
    };

    templateTypes.grapejs = {
        typeName: t('GrapeJS')
    };

    templateTypes.ckeditor = {
        typeName: t('CKEditor'),
        getHTMLEditor: owner => <CKEditor id="html" height="600px" label={t('Template content (HTML)')}/>,
        htmlEditorBeforeSave: async owner => {}
    };

    templateTypes.codeeditor = {
        typeName: t('Code Editor'),
        getHTMLEditor: owner => <ACEEditor id="html" height="600px" mode="html" label={t('Template content (HTML)')}/>,
        htmlEditorBeforeSave: async owner => {}
    };

    templateTypes.mjml = {
        typeName: t('MJML')
    };

    return templateTypes;
}