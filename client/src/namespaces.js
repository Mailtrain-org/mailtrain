'use strict';

import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import jQuery from 'jquery';
import '../public/jquery/jquery-ui-1.12.1.min.js';
import '../public/fancytree/jquery.fancytree-all.min.js';
import '../public/fancytree/skin-bootstrap/ui.fancytree.min.css';

import { I18nextProvider, translate } from 'react-i18next';
import i18n from './i18n';

class TestTreeTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            treeData: [
                {title: 'A', key: '1', expanded: true},
                {title: 'B', key: '2', expanded: true, folder: true, children: [
                    {title: 'BA', key: '3', expanded: true, folder: true, children: [
                        {title: 'BAA', key: '4', expanded: true},
                        {title: 'BAB', key: '5', expanded: true}
                    ]},
                    {title: 'BB', key: '6', expanded: true, folder: true, children: [
                        {title: 'BBA', key: '7', expanded: true},
                        {title: 'BBB', key: '8', expanded: true}
                    ]}
                ]}
            ]
        };
    }

    componentDidMount() {
        const glyphOpts = {
            map: {
                expanderClosed: 'glyphicon glyphicon-menu-right',
                expanderLazy: 'glyphicon glyphicon-menu-right',  // glyphicon-plus-sign
                expanderOpen: 'glyphicon glyphicon-menu-down',  // glyphicon-collapse-down
            }
        };

        this.tree = jQuery(this.domTable).fancytree({
            extensions: ['glyph', 'table'],
            glyph: glyphOpts,
            selectMode: 1,
            icon: false,
            autoScroll: true,
            scrollParent: jQuery(this.domTableContainer),
            source: this.state.treeData,
            table: {
                nodeColumnIdx: 0
            }
        });
    }

    componentDidUpdate() {
        this.tree.reload(this.state.treeData);
    }

    render() {
        const container =
            <div ref={(domElem) => { this.domTableContainer = domElem; }} style={{ height: '100px', overflow: 'auto'}}>
                <table ref={(domElem) => { this.domTable = domElem; }} className="table table-hover table-striped table-condensed">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>B</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td></td>
                        <td></td>
                    </tr>
                    </tbody>
                </table>
            </div>;

        return (
            container
        );
    }

}

@translate()
class Namespaces extends Component {
    render() {
        const t = this.props.t;

        return (
            <div>
                <ol className="breadcrumb">
                    <li><a href="/">{t('Home')}</a></li>
                    <li className="active">{t('Namespaces')}</li>
                </ol>

                <div className="pull-right">
                    <a className="btn btn-primary" href="/reports/create" role="button"><i className="glyphicon glyphicon-plus"></i> {t('Create Namespace')}</a>
                </div>

                <h2>{t('Namespaces')}</h2>

                <hr />

                <TestTreeTable />
            </div>
        );
    }
}

export default function() {
    ReactDOM.render(
        <I18nextProvider i18n={ i18n }><Namespaces/></I18nextProvider>,
        document.getElementById('root')
    );
};


