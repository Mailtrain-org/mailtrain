'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from '../lib/i18n';
import {requiresAuthenticatedUser, Title, withPageHelpers} from '../lib/page';
import {
    Button,
    ButtonRow,
    filterData,
    Form,
    FormSendMethod,
    TreeTableSelect,
    withForm,
    withFormErrorHandlers
} from '../lib/form';
import axios from '../lib/axios';
import {withAsyncErrorHandler, withErrorHandling} from '../lib/error-handling';
import {getGlobalNamespaceId} from "../../../shared/namespaces";
import {getUrl} from "../lib/urls";
import {withComponentMixins} from "../lib/decorator-helpers";
import {getDefaultNamespace} from "../lib/namespace";
import mailtrainConfig from 'mailtrainConfig';

@withComponentMixins([
    withTranslation,
    withForm,
    withErrorHandling,
    withPageHelpers,
    requiresAuthenticatedUser
])
export default class Filter extends Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.initForm();
    }

    static propTypes = {
        action: PropTypes.string.isRequired,
        entity: PropTypes.object,
        permissions: PropTypes.object
    }

    submitFormValuesMutator(data) {
        return filterData(data, ['name', 'description', 'namespace']);
    }

    isEditGlobal() {
        return this.props.entity && this.props.entity.id === getGlobalNamespaceId();
    }

    removeNsIdSubtree(data) {
        for (let idx = 0; idx < data.length; idx++) {
            const entry = data[idx];

            if (entry.key === this.props.entity.id) {
                data.splice(idx, 1);
                return true;
            }

            if (this.removeNsIdSubtree(entry.children)) {
                return true;
            }
        }
    }

    @withAsyncErrorHandler
    async loadTreeData() {
        if (!this.isEditGlobal()) {
            const response = await axios.get(getUrl('rest/namespaces-tree'));
            const data = response.data;
            for (const root of data) {
                root.expanded = true;
            }

            if (this.props.entity && !this.isEditGlobal()) {
                this.removeNsIdSubtree(data);
            }

            if (this.isComponentMounted()) {
                this.setState({
                    treeData: data
                });
            }
        }
    }

    componentDidMount() {
        if (this.props.entity) {
            this.getFormValuesFromEntity(this.props.entity);
        } else {
            this.populateFormValues({
                name: '',
                description: '',
                namespace: getDefaultNamespace(this.props.permissions)
            });
        }

        // noinspection JSIgnoredPromiseFromCall
        this.loadTreeData();
    }

    localValidateFormValues(state) {
        const t = this.props.t;

        if (!state.getIn(['namespace', 'value'])) {
            state.setIn(['namespace', 'error'], t('namespaceMustBeSelected'));
        } else {
            state.setIn(['namespace', 'error'], null);
        }      
    }

    @withFormErrorHandlers
    async submitHandler(leave, disallow) {

        if(disallow){
            document.cookie = 'namespaceFilterId' + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';//Delete namespaceFilter cookies
            document.cookie = 'namespaceFilterName' + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';  
            location.reload();
        }else{
            const t = this.props.t;

            let sendMethod, url;
            sendMethod = FormSendMethod.GET;
                
            if(this.getFormValue('namespace')){
                url = 'rest/namespaces/' + this.getFormValue('namespace');
                this.disableForm();
                this.setFormStatusMessage('info', t('selecting'));
                const submitResult = await this.validateAndSendFormValuesToURL(sendMethod, url);
                document.cookie = "namespaceFilterId=" + this.getFormValue('namespace') + ";";
                document.cookie = "namespaceFilterName=" + submitResult.name + ";";
            
                if (submitResult) {
                    if(leave) {
                        history.back();
                    }else{
                        location.reload();
                    }
                }else {
                    this.enableForm();
                    this.setFormStatusMessage('warning', t('thereAreErrorsInTheFormPleaseFixThemAnd'));
                }
            }else{
                this.setFormStatusMessage('warning', t('namespaceMustBeSelected'));
            }
        }
    }

    render() {
        const t = this.props.t;

        return (
            <div>

                <Title>{t('namespaceFilter')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
 
                    <TreeTableSelect id="namespace" label={t('namespace')} data={this.state.treeData}/>
            
                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="check" label={t('select')} onClickAsync={async () => await this.submitHandler(false,false)}/>
                        <Button type="submit" className="btn-primary" icon="check" label={t('selectAndReturn')} onClickAsync={async () => await this.submitHandler(true, false)}/>
                        <Button type="submit" className="btn-danger" icon="times" label={t('disallow')} onClickAsync={async () => await this.submitHandler(null,true)}/>
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}
