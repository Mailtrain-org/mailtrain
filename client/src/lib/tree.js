'use strict';

import React, { Component } from 'react';
import ReactDOMServer from 'react-dom/server';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';

import jQuery from 'jquery';
import '../../public/jquery/jquery-ui-1.12.1.min.js';
import '../../public/fancytree/jquery.fancytree-all.js';
import '../../public/fancytree/skin-bootstrap/ui.fancytree.min.css';
import './tree.css';
import axios from 'axios';

import { withSectionHelpers } from '../lib/page'
import { withErrorHandling, withAsyncErrorHandler } from './error-handling';


@translate()
@withSectionHelpers
@withErrorHandling
class TreeTable extends Component {
    constructor(props) {
        super(props);

        this.selectMode = this.props.selectMode || TreeTable.SelectMode.NONE;

        let selection = props.selection;
        if (this.selectMode == TreeTable.SelectMode.MULTI) {
            selection = selection.slice().sort();
        }

        this.state = {
            treeData: [],
            selection: selection
        };

        this.loadData();
    }

    @withAsyncErrorHandler
    async loadData() {
        axios.get(this.props.dataUrl)
            .then(response => {
                this.setState({
                    treeData: [ response.data ]
                });
            });
    }

    static propTypes = {
        dataUrl: PropTypes.string.isRequired,
        selectMode: PropTypes.number,
        selection: PropTypes.oneOfType([PropTypes.array, PropTypes.string, PropTypes.number]),
        onSelectionChangedAsync: PropTypes.func,
        actionLinks: PropTypes.array,
        withHeader: PropTypes.bool
    }

    static SelectMode = {
        NONE: 0,
        SINGLE: 1,
        MULTI: 2
    }

    componentDidMount() {
        const glyphOpts = {
            map: {
                expanderClosed: 'glyphicon glyphicon-menu-right',
                expanderLazy: 'glyphicon glyphicon-menu-right',  // glyphicon-plus-sign
                expanderOpen: 'glyphicon glyphicon-menu-down',  // glyphicon-collapse-down
                checkbox: 'glyphicon glyphicon-unchecked',
                checkboxSelected: 'glyphicon glyphicon-check',
                checkboxUnknown: 'glyphicon glyphicon-share',                
            }
        };

        let createNodeFn;
        if (this.props.actionLinks) {
            const actionLinks = this.props.actionLinks;

            createNodeFn = (event, data) => {
                const node = data.node;
                const tdList = jQuery(node.tr).find(">td");

                const linksContainer = jQuery('<span class="mt-action-links"/>');
                const links = actionLinks.map(({label, link}) => {
                    const lnkHtml = ReactDOMServer.renderToStaticMarkup(<a href="#">{label}</a>);
                    const lnk = jQuery(lnkHtml);
                    lnk.click(() => this.navigateTo(link(node.key)));
                    linksContainer.append(lnk);
                });

                tdList.eq(1).html(linksContainer);
            };
        } else {
            createNodeFn = (event, data) => {};
        }

        this.tree = jQuery(this.domTable).fancytree({
            extensions: ['glyph', 'table'],
            glyph: glyphOpts,
            selectMode: (this.selectMode == TreeTable.SelectMode.MULTI ? 2 : 1),
            icon: false,
            autoScroll: true,
            scrollParent: jQuery(this.domTableContainer),
            source: this.state.treeData,
            table: {
                nodeColumnIdx: 0
            },
            createNode: createNodeFn,
            checkbox: this.selectMode == TreeTable.SelectMode.MULTI,
            activate: (this.selectMode == TreeTable.SelectMode.SINGLE ? ::this.onActivate : null),
            select: (this.selectMode == TreeTable.SelectMode.MULTI ? ::this.onSelect : null)
        }).fancytree("getTree");

        this.updateSelection();
    }

    componentDidUpdate() {
        this.tree.reload(this.state.treeData);
        this.updateSelection();
    }

    updateSelection() {
        const tree = this.tree;
        if (this.selectMode == TreeTable.SelectMode.MULTI) {
            const selectSet = new Set(this.state.selection);

            tree.enableUpdate(false);
            tree.visit(node => node.setSelected(selectSet.has(node.key)));
            tree.enableUpdate(true);

        } else if (this.selectMode == TreeTable.SelectMode.SINGLE) {
            this.tree.activateKey(this.state.selection);
        }
    }

    @withAsyncErrorHandler
    async onSelectionChanged(sel) {
        if (this.props.onSelectionChangedAsync) {
            await this.props.onSelectionChangedAsync(sel);
        }
    }

    // Single-select
    onActivate(event, data) {
        const selection = this.tree.getActiveNode().key;
        if (selection !== this.state.selection) {
            this.setState({
                selection
            });

            this.onSelectionChanged(selection);
        }
    }

    // Multi-select
    onSelect(event, data) {
        const newSel = this.tree.getSelectedNodes().map(node => node.key).sort();
        const oldSel = this.state.selection;

        let updated = false;
        const length = oldSel.length
        if (length === newSel.length) {
            for (let i = 0; i < length; i++) {
                if (oldSel[i] !== newSel[i]) {
                    updated = true;
                    break;
                }
            }
        } else {
            updated = true;
        }

        if (updated) {
            this.setState({
                selection: newSel
            });

            this.onSelectionChanged(selection);
        }
    }

    render() {
        const t = this.props.t;
        const props = this.props;
        const actionLinks = props.actionLinks;
        const withHeader = props.withHeader;

        let containerClass = 'mt-treetable-container';
        if (this.selectMode == TreeTable.SelectMode.NONE) {
            containerClass += ' mt-treetable-inactivable';
        }

        if (!this.withHeader) {
            containerClass += ' mt-treetable-noheader';
        }

        const container =
            <div className={containerClass} ref={(domElem) => { this.domTableContainer = domElem; }} style={{ height: '100px', overflow: 'auto'}}>
                <table ref={(domElem) => { this.domTable = domElem; }} className="table table-hover table-striped table-condensed">
                    {props.withHeader &&
                        <thead>
                            <tr>
                                <th>{t('Name')}</th>
                                {actionLinks && <th></th>}
                            </tr>
                        </thead>
                    }
                    <tbody>
                    <tr>
                        <td></td>
                        {actionLinks && <td></td>}
                    </tr>
                    </tbody>
                </table>
            </div>;

        return (
            container
        );
    }
}

export {
    TreeTable
}