'use strict';

import React, {Component} from "react";
import {ACEEditor, AlignedRow, Dropdown, Form, StaticField, TableSelect, withForm} from "../lib/form";
import 'ace-builds/src-noconflict/mode-text';
import 'ace-builds/src-noconflict/mode-html';

import {MosaicoHost} from "../lib/sandboxed-mosaico";
import {CKEditorHost} from "../lib/sandboxed-ckeditor";
import {GrapesJSHost} from "../lib/sandboxed-grapesjs";
import {CodeEditorHost} from "../lib/sandboxed-codeeditor";

import {getGrapesJSSourceTypeOptions, GrapesJSSourceType} from "../lib/sandboxed-grapesjs-shared";

import {CodeEditorSourceType, getCodeEditorSourceTypeOptions} from "../lib/sandboxed-codeeditor-shared";

import {getTemplateTypes as getMosaicoTemplateTypes} from './mosaico/helpers';
import {getSandboxUrl} from "../lib/urls";
import mailtrainConfig from 'mailtrainConfig';
import {ActionLink, Button, ModalDialog} from "../lib/bootstrap-components";
import {Trans} from "react-i18next";
import {renderTag, TagLanguages} from "../../../shared/templates";

import styles from "../lib/styles.scss";
import PropTypes from "prop-types";
import {withComponentMixins} from "../lib/decorator-helpers";
import {withTranslation} from "../lib/i18n";
import {withErrorHandling} from "../lib/error-handling";
import {withPageHelpers} from "../lib/page-common";
import {requiresAuthenticatedUser} from "../lib/page";

export const ResourceType = {
    TEMPLATE: 'template',
    CAMPAIGN: 'campaign'
};

export function getTagLanguages(t) {
    return {
        [TagLanguages.SIMPLE]: {
            name: t('simple')
        },
        [TagLanguages.HBS]: {
            name: t('handlebars')
        }
    };
}

function getMosaicoTemplatesColumns(t) {
    const mosaicoTemplateTypes = getMosaicoTemplateTypes(t);
    const mosaicoTemplatesColumns = [
        {
            data: 1,
            title: t('name')
        },
        {
            data: 2,
            title: t('description')
        },
        {
            data: 3,
            title: t('type'),
            render: data => mosaicoTemplateTypes[data].typeName
        },
        {
            data: 6,
            title: t('namespace')
        },
    ];

    return mosaicoTemplatesColumns;
}


@withComponentMixins([
    withTranslation,
    withForm,
    withErrorHandling,
    withPageHelpers,
    requiresAuthenticatedUser
])
class MosaicoTemplateChangeModalDialog extends Component {
    constructor() {
        super();

        this.initForm({
            leaveConfirmation: false
        });

        this.hideModalHandler = ::this.hideModal;
        this.performActionHandler = ::this.performAction;
    }

    static propTypes = {
        visible: PropTypes.bool.isRequired,
        onHide: PropTypes.func.isRequired,
        owner: PropTypes.object,
        prefix: PropTypes.string,
    }

    componentDidMount() {
        const owner = this.props.owner;
        const prefix = this.props.prefix;

        this.populateFormValues({
            mosaicoTemplate: owner.getFormValue(prefix + 'mosaicoTemplate')
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const owner = this.props.owner;
        const prefix = this.props.prefix;

        if (!prevProps.visible && this.props.visible) {
            this.updateFormValue('mosaicoTemplate', owner.getFormValue(prefix + 'mosaicoTemplate'))
        }
    }

    localValidateFormValues(state) {
        const t = this.props.t;

        state.setIn(['mosaicoTemplate', 'error'], null);
        if (!state.getIn(['mosaicoTemplate', 'value'])) {
            state.setIn(['mosaicoTemplate', 'error'], t('mosaicoTemplateMustBeSelected'))
        }
    }

    async hideModal() {
        this.props.onHide();
    }

    async performAction() {
        if (this.isFormWithoutErrors()) {
            const owner = this.props.owner;
            const prefix = this.props.prefix;
            const state = await owner.editorNode.exportState();

            this.props.owner.updateFormValue(prefix + 'mosaicoTemplate', this.getFormValue('mosaicoTemplate'));

            // If the sandbox is still loading, the exportState returns null.
            if (state) {
                owner.updateFormValue(prefix + 'mosaicoData', {
                    metadata: state.metadata,
                    model: state.model
                });
            }

            this.props.owner.updateFormValue(prefix + 'mosaicoEditorEpoch', owner.getFormValue(prefix + 'mosaicoEditorEpoch') + 1);
            this.hideModal();
        } else {
            this.showFormValidation();
        }
    }

    render() {
        const t = this.props.t;
        const owner = this.props.owner;
        const prefix = this.props.prefix;
        const tagLanguageKey = owner.getFormValue(prefix + 'tag_language');

        if (tagLanguageKey) {
            return (
                <ModalDialog hidden={!this.props.visible} title={t('changeMosaicoTemplate')} onCloseAsync={this.hideModalHandler} buttons={[
                    { label: t('cancel'), className: 'btn-primary', onClickAsync: this.hideModalHandler },
                    { label: t('apply'), className: 'btn-danger', onClickAsync: this.performActionHandler }
                ]}>
                    <Form stateOwner={this} format="wide">
                        <div className="alert alert-warning" role="alert">
                            <Trans i18nKey="warning!SwitchingTheMosaicoTemplateWorks"><b>Warning!</b> Switching the Mosaico template works only if the original and the new templates use the same fields. If they do not, your data will be lost. Please make sure you save your work before performing this operation.</Trans>
                        </div>
                        <TableSelect
                            id={'mosaicoTemplate'}
                            label={t('mosaicoTemplate')}
                            withHeader
                            dropdown
                            dataUrl={`rest/mosaico-templates-by-tag-language-table/${tagLanguageKey}`}
                            columns={getMosaicoTemplatesColumns(t)}
                            selectionLabelIndex={1}
                        />
                    </Form>
                </ModalDialog>
            );

        } else {
            return null;
        }
    }
}

export function getTemplateTypes(t, prefix = '', entityTypeId = ResourceType.TEMPLATE, allowEmpty = false) {
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

    templateTypes.mosaico = {
        typeName: t('mosaico'),
        getModals: (owner, isEdit) => (
            <MosaicoTemplateChangeModalDialog
                owner={owner}
                prefix={prefix}
                visible={owner.getFormValue(prefix + 'mosaicoTemplateChangeModalVisible')}
                onHide={() => owner.updateFormValue(prefix + 'mosaicoTemplateChangeModalVisible', false)}
            />
        ),
        getTypeForm: (owner, isEdit) => {
            const tagLanguageKey = owner.getFormValue(prefix + 'tag_language');
            if (tagLanguageKey) {
                let extraButtons;
                if (isEdit) {
                    extraButtons=[
                        <Button key='change' label={t('change')} className="btn-secondary" onClickAsync={async () => owner.updateFormValue(prefix + 'mosaicoTemplateChangeModalVisible', true)}/>
                    ];
                } else {
                    extraButtons = null;
                }

                return (
                    <TableSelect
                        id={prefix + 'mosaicoTemplate'}
                        label={t('mosaicoTemplate')}
                        withHeader
                        dropdown
                        dataUrl={`rest/mosaico-templates-by-tag-language-table/${tagLanguageKey}`}
                        columns={getMosaicoTemplatesColumns(t)}
                        selectionLabelIndex={1}
                        disabled={isEdit}
                        withClear={allowEmpty}
                        extraButtons={extraButtons}
                    />
                );
            } else {
                return null;
            }
        },
        getHTMLEditor: owner =>
            <AlignedRow
                label={t('templateContentHtml')}>
                <MosaicoHost
                    key={`editor-${owner.getFormValue(prefix + 'mosaicoEditorEpoch')}`}
                    ref={owner.editorNodeRefHandler}
                    entity={owner.props.entity}
                    initialModel={owner.getFormValue(prefix + 'mosaicoData').model}
                    initialMetadata={owner.getFormValue(prefix + 'mosaicoData').metadata}
                    templateId={owner.getFormValue(prefix + 'mosaicoTemplate')}
                    entityTypeId={entityTypeId}
                    title={t('mosaicoTemplateDesigner')}
                    onSave={::owner.save}
                    canSave={owner.isFormWithoutErrors()}
                    onTestSend={::owner.showTestSendModal}
                    onShowExport={::owner.showExportModal}
                    onFullscreenAsync={::owner.setElementInFullscreen}
                />
            </AlignedRow>,
        exportHTMLEditorData: async owner => {
            const state = await owner.editorNode.exportState();
            // If the sandbox is still loading, the exportState returns null.
            if (state) {
                return {
                    [prefix + 'html']: state.html,
                    [prefix + 'mosaicoData']: {
                        metadata: state.metadata,
                        model: state.model
                    }
                };
            } else {
                return null;
            }
        },
        exportContent: async (owner, contentType) => {
            const {html, metadata, model} = await owner.editorNode.exportState();
            if (contentType === 'html') return html;
            return null;
        },
        initData: () => ({
            [prefix + 'mosaicoTemplate']: null,
            [prefix + 'mosaicoData']: {},
            [prefix + 'mosaicoTemplateChangeModalVisible']: false,
            [prefix + 'mosaicoEditorEpoch']: 0
        }),
        afterLoad: data => {
            data[prefix + 'mosaicoTemplate'] = data[prefix + 'data'].mosaicoTemplate;
            data[prefix + 'mosaicoData'] = {
                metadata: data[prefix + 'data'].metadata,
                model: data[prefix + 'data'].model
            };
            data[prefix + 'mosaicoTemplateChangeModalVisible'] = false;
            data[prefix + 'mosaicoEditorEpoch'] = 0;
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
        afterTagLanguageChange: (mutState, isEdit) => {
            if (!isEdit) {
                mutState.setIn([prefix + 'mosaicoTemplate', 'value'], null);
            }
        },
        validate: state => {
            const mosaicoTemplate = state.getIn([prefix + 'mosaicoTemplate', 'value']);
            if (!allowEmpty && !mosaicoTemplate) {
                state.setIn([prefix + 'mosaicoTemplate', 'error'], t('mosaicoTemplateMustBeSelected'));
            }
        }
    };

    const mosaicoFsTemplatesOptions = mailtrainConfig.mosaico.fsTemplates;
    const mosaicoFsTemplatesLabels = new Map(mailtrainConfig.mosaico.fsTemplates.map(({key, label}) => ([key, label])));

    templateTypes.mosaicoWithFsTemplate = {
        typeName: t('mosaicoWithPredefinedTemplates'),
        getModals: (owner, isEdit) => null,
        getTypeForm: (owner, isEdit) => {
            if (isEdit) {
                return <StaticField
                    id={prefix + 'mosaicoFsTemplate'}
                    className={styles.formDisabled}
                    label={t('mosaicoTemplate-1')}>{mosaicoFsTemplatesLabels.get(owner.getFormValue(prefix + 'mosaicoFsTemplate'))}</StaticField>;
            } else {
                return <Dropdown
                    id={prefix + 'mosaicoFsTemplate'}
                    label={t('mosaicoTemplate-1')}
                    options={mosaicoFsTemplatesOptions}/>;
            }
        },
        getHTMLEditor: owner =>
            <AlignedRow
                label={t('templateContentHtml')}>
                <MosaicoHost
                    ref={owner.editorNodeRefHandler}
                    entity={owner.props.entity}
                    initialModel={owner.getFormValue(prefix + 'mosaicoData').model}
                    initialMetadata={owner.getFormValue(prefix + 'mosaicoData').metadata}
                    templatePath={getSandboxUrl(`static/mosaico/templates/${owner.getFormValue(prefix + 'mosaicoFsTemplate')}/template-${owner.getFormValue(prefix + 'mosaicoFsTemplate')}.html`)}
                    entityTypeId={entityTypeId}
                    title={t('mosaicoTemplateDesigner')}
                    onSave={::owner.save}
                    canSave={owner.isFormWithoutErrors()}
                    onTestSend={::owner.showTestSendModal}
                    onShowExport={::owner.showExportModal}
                    onFullscreenAsync={::owner.setElementInFullscreen}
                />
            </AlignedRow>,
        exportHTMLEditorData: async owner => {
            const state = await owner.editorNode.exportState();
            // If the sandbox is still loading, the exportState returns null.
            if (state) {
                return {
                    [prefix + 'html']: state.html,
                    [prefix + 'mosaicoData']: {
                        metadata: state.metadata,
                        model: state.model
                    }
                };
            } else {
                return null;
            }
        },
        exportContent: async (owner, contentType) => {
            const {html, metadata, model} = await owner.editorNode.exportState();
            if (contentType === 'html') return html;
            return null;
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
        afterTagLanguageChange: (mutState, isEdit) => {
        },
        validate: state => {
        }
    };


    const grapesJSSourceTypes = getGrapesJSSourceTypeOptions(t);
    const grapesJSSourceTypeLabels = {};
    for (const srcType of grapesJSSourceTypes) {
        grapesJSSourceTypeLabels[srcType.key] = srcType.label;
    }

    templateTypes.grapesjs = {
        typeName: t('grapesJs'),
        getModals: (owner, isEdit) => null,
        getTypeForm: (owner, isEdit) => {
            if (isEdit) {
                return <StaticField
                    id={prefix + 'grapesJSSourceType'}
                    className={styles.formDisabled}
                    label={t('content')}>{grapesJSSourceTypeLabels[owner.getFormValue(prefix + 'grapesJSSourceType')]}</StaticField>;
            } else {
                return <Dropdown
                    id={prefix + 'grapesJSSourceType'}
                    label={t('content')}
                    options={grapesJSSourceTypes}/>;
            }
        },
        getHTMLEditor: owner =>
            <AlignedRow
                label={t('templateContentHtml')}>
                <GrapesJSHost
                    ref={owner.editorNodeRefHandler}
                    entity={owner.props.entity}
                    entityTypeId={entityTypeId}
                    initialSource={owner.getFormValue(prefix + 'grapesJSData').source}
                    initialStyle={owner.getFormValue(prefix + 'grapesJSData').style}
                    sourceType={owner.getFormValue(prefix + 'grapesJSSourceType')}
                    title={t('grapesJsTemplateDesigner')}
                    onSave={::owner.save}
                    canSave={owner.isFormWithoutErrors()}
                    onTestSend={::owner.showTestSendModal}
                    onShowExport={::owner.showExportModal}
                    onFullscreenAsync={::owner.setElementInFullscreen}
                />
            </AlignedRow>,
        exportHTMLEditorData: async owner => {
            const state = await owner.editorNode.exportState();
            // If the sandbox is still loading, the exportState returns null.
            if (state) {
                return {
                    [prefix + 'html']: state.html,
                    [prefix + 'grapesJSData']: {
                        source: state.source,
                        style: state.style
                    }
                };
            } else {
                return null;
            }
        },
        exportContent: async (owner, contentType) => {
            const {html, source, style} = await owner.editorNode.exportState();
            if (contentType === 'html') return html;
            if (contentType === 'mjml') return source;
            return null;
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
        afterTagLanguageChange: (mutState, isEdit) => {
        },
        validate: state => {
        }
    };

    templateTypes.ckeditor4 = {
        typeName: t('ckEditor4'),
        getModals: (owner, isEdit) => null,
        getTypeForm: (owner, isEdit) => null,
        getHTMLEditor: owner =>
            <AlignedRow
                label={t('templateContentHtml')}>
                <CKEditorHost
                    ref={owner.editorNodeRefHandler}
                    entity={owner.props.entity}
                    initialSource={owner.getFormValue(prefix + 'ckeditor4Data').source}
                    entityTypeId={entityTypeId}
                    title={t('ckEditor4TemplateDesigner')}
                    onSave={::owner.save}
                    canSave={owner.isFormWithoutErrors()}
                    onTestSend={::owner.showTestSendModal}
                    onShowExport={::owner.showExportModal}
                    onFullscreenAsync={::owner.setElementInFullscreen}
                />
            </AlignedRow>,
        exportHTMLEditorData: async owner => {
            const state = await owner.editorNode.exportState();
            // If the sandbox is still loading, the exportState returns null.
            if (state) {
                return {
                    [prefix + 'html']: state.html,
                    [prefix + 'ckeditor4Data']: {
                        source: state.source
                    }
                };
            } else {
                return null;
            }
        },
        exportContent: async (owner, contentType) => {
            const {html, source} = await owner.editorNode.exportState();
            if (contentType === 'html') return html;
            return null;
        },
        initData: () => ({
            [prefix + 'ckeditor4Data']: {}
        }),
        afterLoad: data => {
            data[prefix + 'ckeditor4Data'] = {
                source: data[prefix + 'data'].source
            };
        },
        beforeSave: data => {
            data[prefix + 'data'] = {
                source: data[prefix + 'ckeditor4Data'].source,
            };
            clearBeforeSave(data);
        },
        afterTypeChange: mutState => {
            initFieldsIfMissing(mutState, 'ckeditor4');
        },
        afterTagLanguageChange: (mutState, isEdit) => {
        },
        validate: state => {
        }
    };


    const codeEditorSourceTypes = getCodeEditorSourceTypeOptions(t);
    const codeEditorSourceTypeLabels = {};
    for (const srcType of codeEditorSourceTypes) {
        codeEditorSourceTypeLabels[srcType.key] = srcType.label;
    }

    templateTypes.codeeditor = {
        typeName: t('codeEditor'),
        getModals: (owner, isEdit) => null,
        getTypeForm: (owner, isEdit) => {
            const sourceType = owner.getFormValue(prefix + 'codeEditorSourceType');
            if (isEdit) {
                return <StaticField
                    id={prefix + 'codeEditorSourceType'}
                    className={styles.formDisabled}
                    label={t('type')}>{codeEditorSourceTypeLabels[sourceType]}</StaticField>;
            } else {
                return <Dropdown
                    id={prefix + 'codeEditorSourceType'}
                    label={t('type')}
                    options={codeEditorSourceTypes}/>;
            }
        },
        getHTMLEditor: owner =>
            <AlignedRow
                label={t('templateContentHtml')}>
                <CodeEditorHost
                    ref={owner.editorNodeRefHandler}
                    entity={owner.props.entity}
                    entityTypeId={entityTypeId}
                    initialSource={owner.getFormValue(prefix + 'codeEditorData').source}
                    sourceType={owner.getFormValue(prefix + 'codeEditorSourceType')}
                    title={t('codeEditorTemplateDesigner')}
                    onSave={::owner.save}
                    canSave={owner.isFormWithoutErrors()}
                    onTestSend={::owner.showTestSendModal}
                    onShowExport={::owner.showExportModal}
                    onFullscreenAsync={::owner.setElementInFullscreen}
                />
            </AlignedRow>,
        exportHTMLEditorData: async owner => {
            const state = await owner.editorNode.exportState();
            // If the sandbox is still loading, the exportState returns null.
            if (state) {
                return {
                    [prefix + 'html']: state.html,
                    [prefix + 'codeEditorData']: {
                        source: state.source
                    }
                };
            } else {
                return null;
            }
        },
        exportContent: async (owner, contentType) => {
            const {html, source} = await owner.editorNode.exportState();
            if (contentType === 'html') return html;
            return null;
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
        afterTagLanguageChange: (mutState, isEdit) => {
        },
        validate: state => {
        }
    };

    return templateTypes;
}


export function getEditForm(owner, typeKey, prefix = '') {
    const t = owner.props.t;

    const tagLanguage = owner.getFormValue(prefix + 'tag_language');

    const tg = tag => renderTag(tagLanguage, tag);

    let instructions = null;
    if (tagLanguage === TagLanguages.SIMPLE) {
        instructions = (
            <>
                <Trans i18nKey="mergeTagsAreTagsThatAreReplacedBefore">
                    <p>Merge tags are tags that are replaced before sending out the message. The format of the merge tag is the following: <code>{tg('TAG_NAME')}</code> or <code>[TAG_NAME/fallback]</code> where <code>fallback</code> is an optional text value used when <code>TAG_NAME</code> is empty.</p>
                </Trans>
                <Trans i18nKey="youCanUseAnyOfTheStandardMergeTagsBelow">
                    <p>You can use any of the standard merge tags below. In addition to that every custom field has its own merge tag. Check the fields of the list you are going to send to.</p>
                </Trans>
            </>
        );
    } else if (tagLanguage === TagLanguages.HBS) {
        instructions = (
            <>
                <Trans i18nKey="mergeTagsAreTagsThatAreReplacedBefore-1">
                    <p>Merge tags are tags that are replaced before sending out the message. The format of the merge tag is the following: <code>{tg('TAG_NAME')}</code>. </p>
                </Trans>
                <Trans i18nKey="youCanUseAnyOfTheStandardMergeTagsBelow">
                    <p>You can use any of the standard merge tags below. In addition to that every custom field has its own merge tag. Check the fields of the list you are going to send to.</p>
                </Trans>
                <Trans i18nKey="theWholeMessageIsInterpretedAsHandlebars">
                    <p>The whole message is interpreted as Handlebars template (see <a href="http://handlebarsjs.com/">http://handlebarsjs.com/</a>). You can use any Handlebars blocks and expressions
                        in the template. The merge tags form the root context of the Handlebars template.</p>
                </Trans>
            </>
        );
    }

    return (
        <div>
            <AlignedRow>
                <Button
                    className="btn-secondary"
                    onClickAsync={::owner.toggleMergeTagReference}
                    label={t('mergeTagReference')}/>
                {owner.state.showMergeTagReference &&
                <div style={{marginTop: '15px'}}>
                    {instructions}
                    <table className="table table-bordered table-condensed table-striped">
                        <thead>
                        <tr>
                            <th>
                                <Trans i18nKey="mergeTag-1">Merge tag</Trans>
                            </th>
                            <th>
                                <Trans i18nKey="description">Description</Trans>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <th scope="row">
                                {tg('LINK_PUBLIC_SUBSCRIBE')}
                            </th>
                            <td>
                                <Trans i18nKey="urlThatPointsToTheSubscribePageOfThe">URL that points to the subscribe page of the first list in the campaign that allows public subscriptions</Trans>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                {tg('LINK_UNSUBSCRIBE')}
                            </th>
                            <td>
                                <Trans i18nKey="urlThatPointsToTheUnsubscribePage">URL that points to the unsubscribe page</Trans>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                {tg('LINK_PREFERENCES')}
                            </th>
                            <td>
                                <Trans i18nKey="urlThatPointsToThePreferencesPageOfThe">URL that points to the preferences page of the subscriber</Trans>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                {tg('LINK_BROWSER')}
                            </th>
                            <td>
                                <Trans i18nKey="urlToPreviewTheMessageInABrowser">URL to preview the message in a browser</Trans>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                {tg('EMAIL')}
                            </th>
                            <td>
                                <Trans i18nKey="emailAddress-1">Email address</Trans>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                {tg('SUBSCRIPTION_ID')}
                            </th>
                            <td>
                                <Trans i18nKey="uniqueIdThatIdentifiesTheRecipient">Unique ID that identifies the recipient</Trans>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                {tg('LIST_ID')}
                            </th>
                            <td>
                                <Trans i18nKey="uniqueIdThatIdentifiesTheListUsedForThis">Unique ID that identifies the list to which the target subscriber belongs</Trans>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                {tg('LIST_ID_<index>')}
                            </th>
                            <td>
                                <Trans i18nKey="uniqueIdThatIdentifiesTheListTheIndexIs0">Unique ID that identifies the list. The <code>index</code> is 0-based index of the list in the campaign. <code>LIST_ID_0</code> thus means the first list in the campaign.</Trans>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                {tg('PUBLIC_LIST_ID_<index>')}
                            </th>
                            <td>
                                <Trans i18nKey="theSameAsAboveButOnlyTakingIntoAccount">The same as above, but only taking into account the lists for which public subscribe is enabled. <code>PUBLIC_LIST_ID_0</code> thus means the first public list in the campaign.</Trans>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                {tg('CAMPAIGN_ID')}
                            </th>
                            <td>
                                <Trans i18nKey="uniqueIdThatIdentifiesCurrentCampaign">Unique ID that identifies current campaign</Trans>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <Trans i18nKey="forRssCampaignsTheFollowingFurtherTags">
                        <p>For RSS campaigns, the following further tags can be used.</p>
                    </Trans>
                    <table className="table table-bordered table-condensed table-striped">
                        <thead>
                        <tr>
                            <th>
                                <Trans i18nKey="mergeTag-1">Merge tag</Trans>
                            </th>
                            <th>
                                <Trans i18nKey="description">Description</Trans>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <th scope="row">
                                {tg('RSS_ENTRY_TITLE')}
                            </th>
                            <td>
                                <Trans i18nKey="rssEntryTitle">RSS entry title</Trans>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                {tg('RSS_ENTRY_DATE')}
                            </th>
                            <td>
                                <Trans i18nKey="rssEntryDate">RSS entry date</Trans>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                {tg('RSS_ENTRY_LINK')}
                            </th>
                            <td>
                                <Trans i18nKey="rssEntryLink">RSS entry link</Trans>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                {tg('RSS_ENTRY_CONTENT')}
                            </th>
                            <td>
                                <Trans i18nKey="contentOfAnRssEntry">Content of an RSS entry</Trans>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                {tg('RSS_ENTRY_SUMMARY')}
                            </th>
                            <td>
                                <Trans i18nKey="rssEntrySummary">RSS entry summary</Trans>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                {tg('RSS_ENTRY_IMAGE_URL')}
                            </th>
                            <td>
                                <Trans i18nKey="rssEntryImageUrl">RSS entry image URL</Trans>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                {tg('RSS_ENTRY_CUSTOM_TAGS')}
                            </th>
                            <td>
                                <Trans i18nKey="mailtrainCustomTagsTheCustomTagsCanBe">Mailtrain custom tags. The custom tags can be passed in via <code>mt:entries-json</code> element in RSS entry. The text contents of the elements is interpreted as JSON-formatted object..</Trans>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>}
            </AlignedRow>

            {owner.templateTypes[typeKey].getHTMLEditor(owner)}

            <ACEEditor
                id={prefix + 'text'}
                height="400px"
                mode="text"
                label={t('templateContentPlainText')}
                help={<Trans i18nKey="toExtractTheTextFromHtmlClickHerePlease">To extract the text from HTML click <ActionLink onClickAsync={::owner.extractPlainText}>here</ActionLink>. Please note that your existing plaintext in the field above will be overwritten.</Trans>}
            />
        </div>
    );
}

export function getTypeForm(owner, typeKey, isEdit) {
    return owner.templateTypes[typeKey].getTypeForm(owner, isEdit);
}

export function getModals(owner, typeKey, isEdit) {
    return owner.templateTypes[typeKey].getModals(owner, isEdit);
}

