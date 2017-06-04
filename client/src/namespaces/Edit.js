'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import csfrToken from 'csfrToken';
import { withForm, Form, InputField, TextArea, ButtonRow, Button } from '../lib/form';
import { Title } from "../lib/page";

@translate()
@withForm
export default class Edit extends Component {
    constructor(props) {
        super(props);

        this.nsId = parseInt(this.props.match.params.nsId);

        this.initFormState();
        this.populateFormStateFromURL(`/namespaces/rest/namespaces/${this.nsId}`);
    }


    validateFormState(state) {
        const t = this.props.t;

        if (!state.getIn(['name','value']).trim()) {
            state.setIn(['name', 'error'], t('Name must not be empty'));
        } else {
            state.setIn(['name', 'error'], null);
        }
    }

    submitHandler(evt) {
        evt.preventDefault();
        this.showFormValidation();
    }

    deleteHandler() {
        this.hideFormValidation();
    }

    render() {
        const t = this.props.t;

        return (
            <div>
                <Title>{t('Edit Namespace')}</Title>

                <Form stateOwner={this} onSubmit={::this.submitHandler}>
                    <InputField id="name" label={t('Name')} description={t('Namespace Name')}/>
                    <TextArea id="description" label={t('Description')} description={t('Description')}/>

                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="ok" label={t('Update')}/>
                        <Button className="btn-danger" icon="remove" label={t('Delete Namespace')} onClick={::this.deleteHandler}/>
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}
