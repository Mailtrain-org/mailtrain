'use strict';

import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import {
    BrowserRouter as Router,
    Route,
    Link
} from 'react-router-dom'

import { I18nextProvider, translate } from 'react-i18next';
import i18n from './i18n';

import NamespacesTreeTable from './namespaces/NamespacesTreeTable';


@translate()
class List extends Component {
    render() {
        console.log(this.props);
        console.log(this.props.routes);
        const t = this.props.t;

        return (
            <div>
                <h2>{t('Namespaces')}</h2>

                <hr />

                <NamespacesTreeTable />
            </div>
        );
    }
}


@translate()
class Create extends Component {
    render() {
        console.log(this.props);
        console.log(this.props.routes);
        const t = this.props.t;
        return (
            <div>
                <h2>{t('Create Namespace')}</h2>

                <hr />
            </div>
        );
    }
}


@translate()
class Namespaces extends Component {
    render() {
        const t = this.props.t;

        return (
            <Router>
                <div>
                    <ol className="breadcrumb">
                        <li><a href="/">{t('Home')}</a></li>
                        <li className="active">{t('Namespaces')}</li>
                    </ol>

                    <div className="pull-right">
                        <Link to="/namespaces/create"><span className="btn btn-primary" role="button"><i className="glyphicon glyphicon-plus"></i> {t('Create Namespace')}</span></Link>
                    </div>

                    <Route exact path="/namespaces" component={List} />
                    <Route exact path="/namespaces/create" component={Create} />
                </div>
            </Router>
        );
    }
}

export default function() {
    ReactDOM.render(
        <I18nextProvider i18n={ i18n }><Namespaces/></I18nextProvider>,
        document.getElementById('root')
    );
};


