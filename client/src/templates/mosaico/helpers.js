'use strict';

import React from "react";
import {ACEEditor, Button} from "../../lib/form";
import 'ace-builds/src-noconflict/mode-html'
import 'ace-builds/src-noconflict/mode-xml'
import {ContentModalDialog} from "../../lib/modals";
import mjml2html from "./mjml-mosaico";
import styles from "../../lib/styles.scss";


export function getTemplateTypesOrder() {
    return [ 'mjml' , 'html'];
}

export function getTemplateTypes(t) {
    const templateTypes = {};

    function getMjml(owner) {
        return owner.getFormValue('mjml') || '';
    }

    function generateHtmlFromMjml(mjml) {
        try {
            const res = mjml2html(mjml);
            return res.html;
        } catch {
            return '';
        }
    }

    function validateMjml(owner) {
        const mjml = getMjml(owner);

        try {
            const res = mjml2html(mjml);

            if (res.errors.length > 0) {
                const msg = (
                    <div>
                        <p>{t('invalidMjml')}</p>
                        <ul className={styles.errorsList}>
                            {res.errors.map((err, idx) => <li key={idx}>Line {err.line}: {err.message}</li>)}
                        </ul>
                    </div>
                );

                owner.setFormStatusMessage('danger', msg);
            } else {
                owner.setFormStatusMessage('success', t('mjmlIsValid'));
            }
        } catch (err) {
            console.log(err);
            owner.setFormStatusMessage('danger', t('invalidMjml-1'));
        }
    }

    function setExportModalVisibility(owner, visible) {
        owner.setState({
            exportModalVisible: visible
        })
    }

    function clearBeforeSend(data) {
        delete data.html;
        delete data.mjml;
    }

    templateTypes.html = {
        typeName: t('html'),
        getForm: owner => <ACEEditor id="html" height="700px" mode="html" label={t('templateContent')}/>,
        afterLoad: (owner, data) => {
            data.html = data.data.html;
        },
        beforeSave: (owner, data) => {
            data.data = {
                html: data.html
            };

            clearBeforeSend(data);
        },
        getButtons: owner => null
    };

    templateTypes.mjml = {
        typeName: t('mjml'),
        getForm: owner => (
            <>
                <ContentModalDialog visible={!!owner.state.exportModalVisible} title={t('html')} getContentAsync={async () => generateHtmlFromMjml(getMjml(owner))} onHide={() => setExportModalVisibility(owner, false)}/>
                <ACEEditor id="mjml" height="700px" mode="xml" label={t('templateContent')}/>
            </>
        ),
        afterLoad: (owner, data) => {
            data.mjml = data.data.mjml;
        },
        beforeSave: (owner, data) => {
            data.data = {
                mjml: data.mjml,
                html: generateHtmlFromMjml(data.mjml)
            };

            clearBeforeSend(data);
        },
        getButtons: owner => (
            <>
                <Button className="btn-success" icon="check-circle" label={t('validate')} onClickAsync={async () => validateMjml(owner)}/>
                <Button className="btn-success" icon="file-code" label={t('showHtml')} onClickAsync={async () => setExportModalVisibility(owner, true)}/>
            </>
        )
    };

    return templateTypes;
}