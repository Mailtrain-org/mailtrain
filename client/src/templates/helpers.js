'use strict';

import React from "react";
import {
    ACEEditor,
    AlignedRow,
    CheckBox,
    CKEditor,
    Dropdown,
    StaticField,
    TableSelect
} from "../lib/form";
import 'brace/mode/text';
import 'brace/mode/html';

import { MosaicoHost } from "../lib/sandboxed-mosaico";
import { CKEditorHost } from "../lib/sandboxed-ckeditor";
import { GrapesJSHost } from "../lib/sandboxed-grapesjs";
import { CodeEditorHost } from "../lib/sandboxed-codeeditor";

import {
    getGrapesJSSourceTypeOptions,
    GrapesJSSourceType
} from "../lib/sandboxed-grapesjs-shared";

import {
    getCodeEditorSourceTypeOptions,
    CodeEditorSourceType
} from "../lib/sandboxed-codeeditor-shared";

import {getTemplateTypes as getMosaicoTemplateTypes} from './mosaico/helpers';
import {getSandboxUrl} from "../lib/urls";
import mailtrainConfig from 'mailtrainConfig';
import {
    ActionLink,
    Button
} from "../lib/bootstrap-components";
import {Trans} from "react-i18next";

import styles from "../lib/styles.scss";

export const ResourceType = {
    TEMPLATE: 'template',
    CAMPAIGN: 'campaign'
}

export function getTemplateTypes(t, prefix = '', entityTypeId = ResourceType.TEMPLATE) {
    // The prefix is used to to enable use within other forms (i.e. campaign form)
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
            <TableSelect id={prefix + 'mosaicoTemplate'} label={t('Mosaico template')} withHeader dropdown dataUrl='rest/mosaico-templates-table' columns={mosaicoTemplatesColumns} selectionLabelIndex={1} disabled={isEdit} />,
        getHTMLEditor: owner =>
            <AlignedRow label={t('Template content (HTML)')}>
                <MosaicoHost
                    ref={node => owner.editorNode = node}
                    entity={owner.props.entity}
                    initialModel={owner.getFormValue(prefix + 'mosaicoData').model}
                    initialMetadata={owner.getFormValue(prefix + 'mosaicoData').metadata}
                    templateId={owner.getFormValue(prefix + 'mosaicoTemplate')}
                    entityTypeId={entityTypeId}
                    title={t('Mosaico Template Designer')}
                    onFullscreenAsync={::owner.setElementInFullscreen}/>
            </AlignedRow>,
        exportHTMLEditorData: async owner => {
            const {html, metadata, model} = await owner.editorNode.exportState();
            owner.updateFormValue(prefix + 'html', html);
            owner.updateFormValue(prefix + 'mosaicoData', {
                metadata,
                model
            });
        },
        initData: () => ({
            [prefix + 'mosaicoTemplate']: '',
            [prefix + 'mosaicoData']: {}
        }),
        afterLoad: data => {
            data[prefix + 'mosaicoTemplate'] = data[prefix + 'data'].mosaicoTemplate;
            data[prefix + 'mosaicoData'] = {
                metadata: data[prefix + 'data'].metadata,
                model: data[prefix + 'data'].model
            };
        },
        beforeSave: data => {
            data[prefix + 'data'] = {
                mosaicoTemplate: data[prefix + 'mosaicoTemplate'],
                metadata: data[prefix + 'mosaicoData'].metadata,
                model: data[prefix + 'mosaicoData'].model
            };
            clearBeforeSave(data);
        },
        afterTypeChange: mutState => {
            initFieldsIfMissing(mutState, 'mosaico');
        },
        validate: state => {
            const mosaicoTemplate = state.getIn([prefix + 'mosaicoTemplate', 'value']);
            if (!mosaicoTemplate) {
                state.setIn([prefix + 'mosaicoTemplate', 'error'], t('Mosaico template must be selected'));
            }
        }
    };

    const mosaicoFsTemplatesOptions = mailtrainConfig.mosaico.fsTemplates;
    const mosaicoFsTemplatesLabels = new Map(mailtrainConfig.mosaico.fsTemplates.map(({key, label}) => ([key, label])));

    templateTypes.mosaicoWithFsTemplate = {
        typeName: t('Mosaico with predefined templates'),
        getTypeForm: (owner, isEdit) => {
            if (isEdit) {
                return <StaticField id={prefix + 'mosaicoFsTemplate'} className={styles.formDisabled} label={t('Mosaico Template')}>{mosaicoFsTemplatesLabels.get(owner.getFormValue(prefix + 'mosaicoFsTemplate'))}</StaticField>;
            } else {
                return <Dropdown id={prefix + 'mosaicoFsTemplate'} label={t('Mosaico Template')} options={mosaicoFsTemplatesOptions}/>;
            }
        },
        getHTMLEditor: owner =>
            <AlignedRow label={t('Template content (HTML)')}>
                <MosaicoHost
                    ref={node => owner.editorNode = node}
                    entity={owner.props.entity}
                    initialModel={owner.getFormValue(prefix + 'mosaicoData').model}
                    initialMetadata={owner.getFormValue(prefix + 'mosaicoData').metadata}
                    templatePath={getSandboxUrl(`static/mosaico/templates/${owner.getFormValue(prefix + 'mosaicoFsTemplate')}/index.html`)}
                    entityTypeId={entityTypeId}
                    title={t('Mosaico Template Designer')}
                    onFullscreenAsync={::owner.setElementInFullscreen}/>
            </AlignedRow>,
        exportHTMLEditorData: async owner => {
            const {html, metadata, model} = await owner.editorNode.exportState();
            owner.updateFormValue(prefix + 'html', html);
            owner.updateFormValue(prefix + 'mosaicoData', {
                metadata,
                model
            });
        },
        initData: () => ({
            [prefix + 'mosaicoFsTemplate']: mailtrainConfig.mosaico.fsTemplates[0].key,
            [prefix + 'mosaicoData']: {}
        }),
        afterLoad: data => {
            data[prefix + 'mosaicoFsTemplate'] = data[prefix + 'data'].mosaicoFsTemplate;
            data[prefix + 'mosaicoData'] = {
                metadata: data[prefix + 'data'].metadata,
                model: data[prefix + 'data'].model
            };
        },
        beforeSave: data => {
            data[prefix + 'data'] = {
                mosaicoFsTemplate: data[prefix + 'mosaicoFsTemplate'],
                metadata: data[prefix + 'mosaicoData'].metadata,
                model: data[prefix + 'mosaicoData'].model
            };
            clearBeforeSave(data);
        },
        afterTypeChange: mutState => {
            initFieldsIfMissing(mutState, 'mosaicoWithFsTemplate');
        },
        validate: state => {}
    };


    const grapesJSSourceTypes = getGrapesJSSourceTypeOptions(t);
    const grapesJSSourceTypeLabels = {};
    for ({key, label} of grapesJSSourceTypes) {
        grapesJSSourceTypeLabels[key] = label;
    }

    templateTypes.grapesjs = {
        typeName: t('GrapesJS'),
        getTypeForm: (owner, isEdit) => {
            if (isEdit) {
                return <StaticField id={prefix + 'grapesJSSourceType'} className={styles.formDisabled} label={t('Type')}>{grapesJSSourceTypeLabels[owner.getFormValue(prefix + 'grapesJSSourceType')]}</StaticField>;
            } else {
                return <Dropdown id={prefix + 'grapesJSSourceType'} label={t('Type')} options={grapesJSSourceTypes}/>;
            }
        },
        getHTMLEditor: owner =>
            <AlignedRow label={t('Template content (HTML)')}>
                <GrapesJSHost
                    ref={node => owner.editorNode = node}
                    entity={owner.props.entity}
                    entityTypeId={entityTypeId}
                    initialSource={owner.getFormValue(prefix + 'grapesJSData').source}
                    initialStyle={owner.getFormValue(prefix + 'grapesJSData').style}
                    sourceType={owner.getFormValue(prefix + 'grapesJSSourceType')}
                    title={t('GrapesJS Template Designer')}
                    onFullscreenAsync={::owner.setElementInFullscreen}
                />
            </AlignedRow>,
        exportHTMLEditorData: async owner => {
            const {html, source, style} = await owner.editorNode.exportState();
            owner.updateFormValue(prefix + 'html', html);
            owner.updateFormValue(prefix + 'grapesJSData', {
                source,
                style
            });
        },
        initData: () => ({
            [prefix + 'grapesJSSourceType']: GrapesJSSourceType.MJML,
            [prefix + 'grapesJSData']: {}
        }),
        afterLoad: data => {
            data[prefix + 'grapesJSSourceType'] = data[prefix + 'data'].sourceType;
            data[prefix + 'grapesJSData'] = {
                source: data[prefix + 'data'].source,
                style: data[prefix + 'data'].style
            };
        },
        beforeSave: data => {
            data[prefix + 'data'] = {
                sourceType: data[prefix + 'grapesJSSourceType'],
                source: data[prefix + 'grapesJSData'].source,
                style: data[prefix + 'grapesJSData'].style
            };
            clearBeforeSave(data);
        },
        afterTypeChange: mutState => {
            initFieldsIfMissing(mutState, 'grapesjs');
        },
        validate: state => {}
    };

    templateTypes.ckeditor4 = {
        typeName: t('CKEditor 4'),
        getTypeForm: (owner, isEdit) => null,
        getHTMLEditor: owner =>
            <AlignedRow label={t('Template content (HTML)')}>
                <CKEditorHost
                    ref={node => owner.editorNode = node}
                    entity={owner.props.entity}
                    initialHtml={owner.getFormValue(prefix + 'html')}
                    entityTypeId={entityTypeId}
                    title={t('CKEditor 4 Template Designer')}
                    onFullscreenAsync={::owner.setElementInFullscreen}
                />
            </AlignedRow>,
        exportHTMLEditorData: async owner => {
            const {html} = await owner.editorNode.exportState();
            owner.updateFormValue(prefix + 'html', html);
        },
        initData: () => ({}),
        afterLoad: data => {},
        beforeSave: data => {
            clearBeforeSave(data);
        },
        afterTypeChange: mutState => {},
        validate: state => {}
    };

    templateTypes.ckeditor5 = {
        typeName: t('CKEditor 5'),
        getTypeForm: (owner, isEdit) => null,
        getHTMLEditor: owner => <CKEditor id={prefix + 'html'} height="600px" mode="html" label={t('Template content (HTML)')}/>,
        exportHTMLEditorData: async owner => {},
        initData: () => ({}),
        afterLoad: data => {},
        beforeSave: data => {
            clearBeforeSave(data);
        },
        afterTypeChange: mutState => {},
        validate: state => {}
    };

    const codeEditorSourceTypes = getCodeEditorSourceTypeOptions(t);
    const codeEditorSourceTypeLabels = {};
    for ({key, label} of codeEditorSourceTypes) {
        codeEditorSourceTypeLabels[key] = label;
    }

    templateTypes.codeeditor = {
        typeName: t('Code Editor'),
        getTypeForm: (owner, isEdit) => {
            const sourceType = owner.getFormValue(prefix + 'codeEditorSourceType');
            if (isEdit) {
                return <StaticField id={prefix + 'codeEditorSourceType'} className={styles.formDisabled} label={t('Type')}>{codeEditorSourceTypeLabels[sourceType]}</StaticField>;
            } else {
                return <Dropdown id={prefix + 'codeEditorSourceType'} label={t('Type')} options={codeEditorSourceTypes}/>;
            }
        },
        getHTMLEditor: owner =>
            <AlignedRow label={t('Template content (HTML)')}>
                <CodeEditorHost
                    ref={node => owner.editorNode = node}
                    entity={owner.props.entity}
                    entityTypeId={entityTypeId}
                    initialSource={owner.getFormValue(prefix + 'codeEditorData').source}
                    sourceType={owner.getFormValue(prefix + 'codeEditorSourceType')}
                    title={t('Code Editor Template Designer')}
                    onFullscreenAsync={::owner.setElementInFullscreen}
                />
            </AlignedRow>,
        exportHTMLEditorData: async owner => {
            const {html, source} = await owner.editorNode.exportState();
            owner.updateFormValue(prefix + 'html', html);
            owner.updateFormValue(prefix + 'codeEditorData', {
                source
            });
        },
        initData: () => ({
            [prefix + 'codeEditorSourceType']: CodeEditorSourceType.HTML,
            [prefix + 'codeEditorData']: {}
        }),
        afterLoad: data => {
            data[prefix + 'codeEditorSourceType'] = data[prefix + 'data'].sourceType;
            data[prefix + 'codeEditorData'] = {
                source: data[prefix + 'data'].source
            };
        },
        beforeSave: data => {
            data[prefix + 'data'] = {
                sourceType: data[prefix + 'codeEditorSourceType'],
                source: data[prefix + 'codeEditorData'].source
            };

            clearBeforeSave(data);
        },
        afterTypeChange: mutState => {
            initFieldsIfMissing(mutState, 'codeeditor');
        },
        validate: state => {}
    };

    return templateTypes;
}


export function getEditForm(owner, typeKey, prefix = '') {
    const t = owner.props.t;

    return <div>
        <AlignedRow>
            <Button className="btn-default" onClickAsync={::owner.toggleMergeTagReference} label={t('Merge tag reference')}/>
            {owner.state.showMergeTagReference &&
            <div style={{marginTop: '15px'}}>
                <Trans><p>Merge tags are tags that are replaced before sending out the message. The format of the merge tag is the following: <code>[TAG_NAME]</code> or <code>[TAG_NAME/fallback]</code> where <code>fallback</code> is an optional text value used when <code>TAG_NAME</code> is empty.</p></Trans>
                <Trans><p>You can use any of the standard merge tags below. In addition to that every custom field has its own merge tag. Check the fields of the list you are going to send to.</p></Trans>
                <table className="table table-bordered table-condensed table-striped">
                    <thead>
                    <tr>
                        <th>
                            <Trans>Merge tag</Trans>
                        </th>
                        <th>
                            <Trans>Description</Trans>
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <th scope="row">
                            [LINK_UNSUBSCRIBE]
                        </th>
                        <td>
                            <Trans>URL that points to the unsubscribe page</Trans>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            [LINK_PREFERENCES]
                        </th>
                        <td>
                            <Trans>URL that points to the preferences page of the subscriber</Trans>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            [LINK_BROWSER]
                        </th>
                        <td>
                            <Trans>URL to preview the message in a browser</Trans>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            [EMAIL]
                        </th>
                        <td>
                            <Trans>Email address</Trans>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            [TO_NAME]
                        </th>
                        <td>
                            <Trans>Recipient name as it appears in email's 'To' header</Trans>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            [SUBSCRIPTION_ID]
                        </th>
                        <td>
                            <Trans>Unique ID that identifies the recipient</Trans>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            [LIST_ID]
                        </th>
                        <td>
                            <Trans>Unique ID that identifies the list used for this campaign</Trans>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            [CAMPAIGN_ID]
                        </th>
                        <td>
                            <Trans>Unique ID that identifies current campaign</Trans>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>}
        </AlignedRow>

        {owner.templateTypes[typeKey].getHTMLEditor(owner)}

        <ACEEditor id={prefix + 'text'} height="400px" mode="text" label={t('Template content (plain text)')} help={<Trans>To extract the text from HTML click <ActionLink onClickAsync={::owner.extractPlainText}>here</ActionLink>. Please note that your existing plaintext in the field above will be overwritten. This feature uses the <a href="http://premailer.dialect.ca/api">Premailer API</a>, a third party service. Their Terms of Service and Privacy Policy apply.</Trans>}/>
    </div>;
}

export function getTypeForm(owner, typeKey, isEdit) {
    return owner.templateTypes[typeKey].getTypeForm(owner, isEdit);
}

