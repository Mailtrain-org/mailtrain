'use strict';

import React, {Component} from "react";
import PropTypes from "prop-types";
import {translate} from "react-i18next";
import {requiresAuthenticatedUser} from "./lib/page";
import {ACEEditor, Button, Form, FormSendMethod, withForm} from "./lib/form";
import {withErrorHandling} from "./lib/error-handling";
import {Table} from "./lib/table";
import Dropzone from "react-dropzone";
import {ModalDialog} from "./lib/modals";
import {Icon} from "./lib/bootstrap-components";
import axios from './axios';

@translate()
@withForm
@withErrorHandling
@requiresAuthenticatedUser
export default class Files extends Component {
    constructor(props) {
        super(props);

        this.state = {
            fileToDeleteName: null,
            fileToDeleteId: null
        };

        const t = props.t;

        this.initForm();
    }

    static propTypes = {
        title: PropTypes.string,
        entity: PropTypes.object,
        entityTypeId: PropTypes.string
    }


    getFilesUploadedMessage(response){
        const t = this.props.t;
        const details = [];
        if (response.data.added) {
            details.push(t('{{count}} file(s) added', {count: response.data.added}));
        }
        if (response.data.replaced) {
            details.push(t('{{count}} file(s) replaced', {count: response.data.replaced}));
        }
        if (response.data.ignored) {
            details.push(t('{{count}} file(s) ignored', {count: response.data.ignored}));
        }
        const detailsMessage = details ? ' (' + details.join(', ') + ')' : '';
        return t('{{count}} file(s) uploaded', {count: response.data.uploaded}) + detailsMessage;
    }

    onDrop(files){
        const t = this.props.t;
        if (files.length > 0) {
            this.setFormStatusMessage('info', t('Uploading {{count}} file(s)', files.length));
            const data = new FormData();
            for (const file of files) {
                data.append('file', file)
            }
            axios.put(`/rest/files/${this.props.entityTypeId}, ${this.props.entity.id}`, data)
            .then(res => {
                this.filesTable.refresh();
                const message = this.getFilesUploadedMessage(res);
                this.setFormStatusMessage('info', message);
            })
            .catch(res => this.setFormStatusMessage('danger', t('File upload failed: ') + res.message));
        }
        else{
            this.setFormStatusMessage('info', t('No files to upload'));
        }
    }

    deleteFile(fileId, fileName){
        this.setState({fileToDeleteId: fileId, fileToDeleteName: fileName})
    }

    async hideDeleteFile(){
        this.setState({fileToDeleteId: null, fileToDeleteName: null})
    }

    async performDeleteFile() {
        const t = this.props.t;
        const fileToDeleteId = this.state.fileToDeleteId;
        await this.hideDeleteFile();

        try {
            this.disableForm();
            this.setFormStatusMessage('info', t('Deleting file ...'));
            await axios.delete(`/rest/files/${this.props.entityTypeId}/${fileToDeleteId}`);
            this.filesTable.refresh();
            this.setFormStatusMessage('info', t('File deleted'));
            this.enableForm();
        } catch (err) {
            this.filesTable.refresh();
            this.setFormStatusMessage('danger', t('Delete file failed: ') + err.message);
            this.enableForm();
        }
    }

    render() {
        const t = this.props.t;

        const columns = [
            { data: 1, title: "Name" },
            { data: 2, title: "Size" },
            {
                actions: data => {

                    const actions = [
                        {
                            label: <Icon icon="download" title={t('Download')}/>,
                            href: `/rest/files/${this.props.entityTypeId}/${data[0]}`
                        },
                        {
                            label: <Icon icon="remove" title={t('Delete')}/>,
                            action: () => this.deleteFile(data[0], data[1])
                        }
                    ];

                    return actions;
                }
            }
        ];

        return (
            <div>
                <ModalDialog
                    hidden={this.state.fileToDeleteId === null}
                    title={t('Confirm file deletion')}
                    onCloseAsync={::this.hideDeleteFile}
                    buttons={[
                        { label: t('No'), className: 'btn-primary', onClickAsync: ::this.hideDeleteFile },
                        { label: t('Yes'), className: 'btn-danger', onClickAsync: ::this.performDeleteFile }
                    ]}>
                    {t('Are you sure you want to delete file "{{name}}"?', {name: this.state.fileToDeleteName})}
                </ModalDialog>
                <Dropzone onDrop={::this.onDrop} className="dropZone" activeClassName="dropZoneActive">
                    {state => state.isDragActive ? t('Drop {{count}} file(s)', {count:state.draggedFiles.length}) : t('Drop files here')}
                </Dropzone>
                <Table withHeader ref={node => this.filesTable = node} dataUrl={`/rest/template-files-table/${this.props.entity.id}`} columns={columns} />
            </div>
        );
    }
}
