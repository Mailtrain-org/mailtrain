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
        this.getFormValuesFromURL(`/namespaces/rest/namespaces/${this.nsId}`, data => {
            if (data.parent) data.parent = data.parent.toString();
        });
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
        const t = this.props.t;

        await this.validateAndPutFormValuesToURL(`/namespaces/rest/namespaces/${this.nsId}`, data => {
            if (data.parent) data.parent = parseInt(data.parent);
        });

        this.navigateToWithFlashMessage('/namespaces', 'success', t('Namespace saved'));

        // FIXME - the enable form in form.js gets called. This causes a warning. Check there whether the component is still mounted.
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
