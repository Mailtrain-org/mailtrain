'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { withSectionHelpers } from '../lib/page'
import { withForm, Form, InputField, TextArea, ButtonRow, Button, TreeTableSelect } from '../lib/form';
import { Title } from "../lib/page";
import axios from '../lib/axios';

@translate()
@withForm
@withSectionHelpers
export default class Edit extends Component {
    constructor(props) {
        super(props);

        this.nsId = parseInt(this.props.match.params.nsId);

        console.log('Constructing Edit');
        this.initFormState();
        this.populateFormValuesFromURL(`/namespaces/rest/namespaces/${this.nsId}`);
    }

    validateFormValues(state) {
        const t = this.props.t;

        if (!state.getIn(['name','value']).trim()) {
            state.setIn(['name', 'error'], t('Name must not be empty'));
        } else {
            state.setIn(['name', 'error'], null);
        }
    }

    async submitHandler() {
        if (this.isFormWithoutErrors()) {
            const data = this.getFormValues();
            console.log(data);

            await axios.put(`/namespaces/rest/namespaces/${this.nsId}`, data);
        } else {
            this.showFormValidation();
        }
    }

    async deleteHandler() {
        this.setFormStatusMessage('Deleting namespace');
        this.setFormStatusMessage();
    }

    render() {
        const t = this.props.t;

        return (
            <div>
                <Title>{t('Edit Namespace')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <InputField id="name" label={t('Name')}/>
                    <TextArea id="description" label={t('Description')}/>

                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="ok" label={t('Update')}/>
                        <Button className="btn-danger" icon="remove" label={t('Delete Namespace')} onClickAsync={::this.deleteHandler}/>
                    </ButtonRow>

                    {this.nsId !== 1 && <TreeTableSelect id="parent" label={t('Parent Namespace')} dataUrl="/namespaces/rest/namespacesTree"/>}
                </Form>
            </div>
        );
    }
}
