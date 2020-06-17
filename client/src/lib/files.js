'use strict';

import React, {Component} from "react";
import PropTypes from "prop-types";
import {withTranslation} from './i18n';
import {requiresAuthenticatedUser, Title, withPageHelpers} from "./page";
import {withErrorHandling} from "./error-handling";
import {Table} from "./table";
import Dropzone from "react-dropzone";
import {Icon, ModalDialog} from "./bootstrap-components";
import axios from './axios';
import styles from "./styles.scss";
import {getPublicUrl, getUrl} from "./urls";
import {withComponentMixins} from "./decorator-helpers";

@withComponentMixins([
    withTranslation,
    withErrorHandling,
    withPageHelpers,
    requiresAuthenticatedUser
])
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

    getFilesUploadedMessage(response) {
        const t = this.props.t;
        const details = [];
        if (response.data.added) {
            details.push(t('countFileAdded', {count: response.data.added}));
        }
        if (response.data.replaced) {
            details.push(t('countFileReplaced', {count: response.data.replaced}));
        }
        if (response.data.ignored) {
            details.push(t('countFileIgnored', {count: response.data.ignored}));
        }
        const detailsMessage = details ? ' (' + details.join(', ') + ')' : '';
        return t('countFileUploaded', {count: response.data.uploaded}) + detailsMessage;
    }

    onDrop(files) {
        const t = this.props.t;
        if (files.length > 0) {
            this.setFlashMessage('info', t('uploadingCountFile', {count: files.length}));
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
                .catch(res => this.setFlashMessage('danger', t('fileUploadFailed') + ' ' + res.message));
        } else {
            this.setFlashMessage('info', t('noFilesToUpload'));
        }
    }

    deleteFile(fileId, fileName) {
        this.setState({fileToDeleteId: fileId, fileToDeleteName: fileName})
    }

    async hideDeleteFile() {
        this.setState({fileToDeleteId: null, fileToDeleteName: null})
    }

    async performDeleteFile() {
        const t = this.props.t;
        const fileToDeleteId = this.state.fileToDeleteId;
        await this.hideDeleteFile();

        try {
            this.setFlashMessage('info', t('deletingFile'));
            await axios.delete(getUrl(`rest/files/${this.props.entityTypeId}/${this.props.entitySubTypeId}/${fileToDeleteId}`));
            this.filesTable.refresh();
            this.setFlashMessage('info', t('fileDeleted'));
        } catch (err) {
            this.filesTable.refresh();
            this.setFlashMessage('danger', t('deleteFileFailed') + ' ' + err.message);
        }
    }

    render() {
        const t = this.props.t;

        const columns = [
            { data: 1, title: t('name') },
            { data: 3, title: t('size') },
            {
                actions: data => {
                    const actions = [];

                    let downloadUrl;
                    if (this.props.usePublicDownloadUrls) {
                        downloadUrl = getPublicUrl(`files/${this.props.entityTypeId}/${this.props.entitySubTypeId}/${this.props.entity.id}/${data[2]}`);
                    } else {
                        downloadUrl = getUrl(`rest/files/${this.props.entityTypeId}/${this.props.entitySubTypeId}/${data[0]}`);
                    }

                    actions.push({
                        label: <Icon icon="download" title={t('download')}/>,
                        href: downloadUrl
                    });

                    if (this.props.entity.permissions.includes(this.props.managePermission)) {
                        actions.push({
                            label: <Icon icon="trash-alt" title={t('delete')}/>,
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
                    title={t('confirmFileDeletion')}
                    onCloseAsync={::this.hideDeleteFile}
                    buttons={[
                        { label: t('no'), className: 'btn-primary', onClickAsync: ::this.hideDeleteFile },
                        { label: t('yes'), className: 'btn-danger', onClickAsync: ::this.performDeleteFile }
                    ]}>
                    {t('areYouSureYouWantToDeleteTheFile?', {name: this.state.fileToDeleteName})}
                </ModalDialog>

                {this.props.title && <Title>{this.props.title}</Title>}

                {this.props.help && <p>{this.props.help}</p>}

                {
                    this.props.entity.permissions.includes(this.props.managePermission) &&
                    <Dropzone onDrop={::this.onDrop}>
                        {({getRootProps, getInputProps, isDragActive, draggedFiles}) => (
                            <div {...getRootProps()} className={styles.dropZone + (isDragActive ? ' ' + styles.dropZoneActive : '')}>
                                <input {...getInputProps()} />
                                <p>{isDragActive ? t('dropCountFile', {count: draggedFiles.length}) : t('dropFilesHere')}</p>
                            </div>
                        )}
                    </Dropzone>
                }

                <Table withHeader ref={node => this.filesTable = node} dataUrl={`rest/files-table/${this.props.entityTypeId}/${this.props.entitySubTypeId}/${this.props.entity.id}`} columns={columns} />
            </div>
        );
    }
}
