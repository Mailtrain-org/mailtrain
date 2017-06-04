'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';

import jQuery from 'jquery';
import '../../public/jquery/jquery-ui-1.12.1.min.js';
import '../../public/fancytree/jquery.fancytree-all.min.js';
import '../../public/fancytree/skin-bootstrap/ui.fancytree.min.css';
import axios from 'axios';

@translate()
export default class NamespacesTreeTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            treeData: []
        };

        axios.get('/namespaces/rest/namespacesTree')
            .then(response => {
                this.setState({
                    treeData: response.data
                });

            });
    }

    componentDidMount() {
        const history = this.props.history;

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
            },
            createNode: (event, data) => {
                const node = data.node;
                const tdList = jQuery(node.tr).find(">td");
                tdList.eq(1).html('<a href="#">Edit</a>').click(() => {
                    history.push('/namespaces/edit/' + node.key);
                });
            }
        }).fancytree("getTree");
    }

    componentDidUpdate() {
        this.tree.reload(this.state.treeData);
    }

    render() {
        const t = this.props.t;

        const container =
            <div ref={(domElem) => { this.domTableContainer = domElem; }} style={{ height: '100px', overflow: 'auto'}}>
                <table ref={(domElem) => { this.domTable = domElem; }} className="table table-hover table-striped table-condensed">
                    <thead>
                    <tr>
                        <th>{t('Name')}</th>
                        <th></th>
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