'use strict';

import React, {Component} from "react";
import PropTypes from "prop-types";
import {translate} from "react-i18next";
import {
    requiresAuthenticatedUser,
    Title
} from "./page";
import {withErrorHandling} from "./error-handling";
import {Table} from "./table";
import Dropzone from "react-dropzone";
import {Icon, ModalDialog} from "./bootstrap-components";
import axios from './axios';
import styles from "./styles.scss";
import {withPageHelpers} from "./page";
import {getUrl} from "./urls";

@translate()
@withErrorHandling
@withPageHelpers
@requiresAuthenticatedUser
export default class Files extends Component {
    constructor(props) {
        super(props);

        this.state = {
            fileToDeleteName: null,
            fileToDeleteId: null
        };

        const t = props.t;
    }

    static propTypes = {
        title: PropTypes.string,
        help: PropTypes.string,
        entity: PropTypes.object.isRequired,
        entityTypeId: PropTypes.string.isRequired,
        entitySubTypeId: PropTypes.string.isRequired,
        managePermission: PropTypes.string.isRequired,
        usePublicDownloadUrls: PropTypes.bool
    }

    static defaultProps = {
        usePublicDownloadUrls: true
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
            this.setFlashMessage('info', t('Uploading {{count}} file(s)', files.length));
            const data = new FormData();
            for (const file of files) {
                data.append('files[]', file)
            }
            axios.post(getUrl(`rest/files/${this.props.entityTypeId}/${this.props.entitySubTypeId}/${this.props.entity.id}`), data)
            .then(res => {
                this.filesTable.refresh();
                const message = this.getFilesUploadedMessage(res);
                this.setFlashMessage('info', message);
            })
            .catch(res => this.setFlashMessage('danger', t('File upload failed: ') + res.message));
        }
        else{
            this.setFlashMessage('info', t('No files to upload'));
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
            this.setFlashMessage('info', t('Deleting file ...'));
            await axios.delete(getUrl(`rest/files/${this.props.entityTypeId}/${this.props.entitySubTypeId}/${fileToDeleteId}`));
            this.filesTable.refresh();
            this.setFlashMessage('info', t('File deleted'));
        } catch (err) {
            this.filesTable.refresh();
            this.setFlashMessage('danger', t('Delete file failed: ') + err.message);
        }
    }

    render() {
        const t = this.props.t;

        const columns = [
            { data: 1, title: "Name" },
            { data: 3, title: "Size" },
            {
                actions: data => {
                    const actions = [];

                    let downloadUrl;
                    if (this.props.usePublicDownloadUrls) {
                        downloadUrl =`/files/${this.props.entityTypeId}/${this.props.entitySubTypeId}/${this.props.entity.id}/${data[2]}`;
                    } else {
                        downloadUrl =`rest/files/${this.props.entityTypeId}/${this.props.entitySubTypeId}/${data[0]}`;
                    }

                    actions.push({
                        label: <Icon icon="download" title={t('Download')}/>,
                        href: downloadUrl
                    });

                    if (this.props.entity.permissions.includes(this.props.managePermission)) {
                        actions.push({
                            label: <Icon icon="remove" title={t('Delete')}/>,
                            action: () => this.deleteFile(data[0], data[1])
                        });
                    }

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

                {this.props.title && <Title>{this.props.title}</Title>}

                {this.props.help && <p>{this.props.help}</p>}

                {
                    this.props.entity.permissions.includes(this.props.managePermission) &&
                    <Dropzone onDrop={::this.onDrop} className={styles.dropZone} activeClassName={styles.dropZoneActive}>
                        {state => state.isDragActive ? t('Drop {{count}} file(s)', {count:state.draggedFiles.length}) : t('Drop files here')}
                    </Dropzone>
                }

                <Table withHeader ref={node => this.filesTable = node} dataUrl={`rest/files-table/${this.props.entityTypeId}/${this.props.entitySubTypeId}/${this.props.entity.id}`} columns={columns} />
            </div>
        );
    }
}
