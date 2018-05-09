'use strict';

import React from "react";
import {
    ACEEditor,
    AlignedRow,
    CKEditor,
    TableSelect
} from "../lib/form";
import 'brace/mode/text';
import 'brace/mode/html';

import {
    MosaicoEditor,
    ResourceType
} from "../lib/mosaico";

import {getTemplateTypes as getMosaicoTemplateTypes} from './mosaico/helpers';


export function getTemplateTypes(t) {
    const templateTypes = {};

    function initFieldsIfMissing(mutState, templateType) {
        const initVals = templateTypes[templateType].initData();

        for (const key in initVals) {
            if (!mutState.hasIn([key])) {
                mutState.setIn([key, 'value'], initVals[key]);
            }
        }
    }

    function clearBeforeSave(data) {
        for (const templateKey in templateTypes) {
            const initVals = templateTypes[templateKey].initData();
            for (const fieldKey in initVals) {
                delete data[fieldKey];
            }
        }
    }


    const mosaicoTemplateTypes = getMosaicoTemplateTypes(t);
    const mosaicoTemplatesColumns = [
        { data: 1, title: t('Name') },
        { data: 2, title: t('Description') },
        { data: 3, title: t('Type'), render: data => mosaicoTemplateTypes[data].typeName },
        { data: 5, title: t('Namespace') },
    ];

    templateTypes.mosaico = {
        typeName: t('Mosaico'),
        getTypeForm: (owner, isEdit) =>
            <TableSelect id="mosaicoTemplate" label={t('Mosaico template')} withHeader dropdown dataUrl='rest/mosaico-templates-table' columns={mosaicoTemplatesColumns} selectionLabelIndex={1} disabled={isEdit} />,
        getHTMLEditor: owner =>
            <AlignedRow label={t('Template content (HTML)')}>
                <MosaicoEditor
                    ref={node => owner.editorNode = node}
                    entity={owner.props.entity}
                    initialModel={owner.getFormValue('mosaicoData').model}
                    initialMetadata={owner.getFormValue('mosaicoData').metadata}
                    templateId={owner.getFormValue('mosaicoTemplate')}
                    entityTypeId={ResourceType.TEMPLATE}
                    title={t('Mosaico Template Designer')}
                    onFullscreenAsync={::owner.setElementInFullscreen}/>
            </AlignedRow>,
        exportHTMLEditorData: async owner => {
            const {html, metadata, model} = await owner.editorNode.exportState();
            owner.updateFormValue('html', html);
            owner.updateFormValue('mosaicoData', {
                metadata,
                model
            });
        },
        initData: () => ({
            mosaicoTemplate: '',
            mosaicoData: {}
        }),
        afterLoad: data => {
            data.mosaicoTemplate = data.data.mosaicoTemplate;
            data.html = data.data.html;
            data.mosaicoData = {
                metadata: data.data.metadata,
                model: data.data.model
            };
        },
        beforeSave: data => {
            data.data = {
                mosaicoTemplate: data.mosaicoTemplate,
                metadata: data.mosaicoData.metadata,
                model: data.mosaicoData.model
            };
            clearBeforeSave(data);
        },
        afterTypeChange: mutState => {
            initFieldsIfMissing(mutState, 'mosaico');
        },
        validate: state => {
            const mosaicoTemplate = state.getIn(['mosaicoTemplate', 'value']);
            if (!mosaicoTemplate) {
                state.setIn(['mosaicoTemplate', 'error'], t('Mosaico template must be selected'));
            } else {
                state.setIn(['mosaicoTemplate', 'error'], null);
            }
        }
    };

    templateTypes.grapejs = { // TODO
        typeName: t('GrapeJS'),
        getTypeForm: (owner, isEdit) => null,
        getHTMLEditor: owner => null,
        exportHTMLEditorData: async owner => {},
        initData: () => ({}),
        afterLoad: data => {},
        beforeSave: data => {
            clearBeforeSave(data);
        },
        afterTypeChange: mutState => {},
        validate: state => {}
    };

    templateTypes.ckeditor = {
        typeName: t('CKEditor'),
        getTypeForm: (owner, isEdit) => null,
        getHTMLEditor: owner => <CKEditor id="html" height="600px" label={t('Template content (HTML)')}/>,
        exportHTMLEditorData: async owner => {},
        initData: () => ({}),
        afterLoad: data => {},
        beforeSave: data => {
            clearBeforeSave(data);
        },
        afterTypeChange: mutState => {},
        validate: state => {}
    };

    templateTypes.codeeditor = {
        typeName: t('Code Editor'),
        getTypeForm: (owner, isEdit) => null,
        getHTMLEditor: owner => <ACEEditor id="html" height="600px" mode="html" label={t('Template content (HTML)')}/>,
        exportHTMLEditorData: async owner => {},
        initData: () => ({}),
        afterLoad: data => {},
        beforeSave: data => {
            clearBeforeSave(data);
        },
        afterTypeChange: mutState => {},
        validate: state => {}
    };

    templateTypes.mjml = { // TODO
        getTypeForm: (owner, isEdit) => null,
        getHTMLEditor: owner => null,
        exportHTMLEditorData: async owner => {},
        initData: () => ({}),
        afterLoad: data => {},
        beforeSave: data => {
            clearBeforeSave(data);
        },
        afterTypeChange: mutState => {},
        validate: state => {}
    };

    return templateTypes;
}