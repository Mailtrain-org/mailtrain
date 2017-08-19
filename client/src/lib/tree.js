'use strict';

import React, { Component } from 'react';
import ReactDOMServer from 'react-dom/server';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';

import jQuery from 'jquery';
import '../../public/jquery/jquery-ui-1.12.1.min.js';
import '../../public/fancytree/jquery.fancytree-all.min.js';
import '../../public/fancytree/skin-bootstrap/ui.fancytree.min.css';
import './tree.css';
import axios from './axios';

import { withPageHelpers } from '../lib/page'
import { withErrorHandling, withAsyncErrorHandler } from './error-handling';
import styles from "./styles.scss";

const TreeSelectMode = {
    NONE: 0,
    SINGLE: 1,
    MULTI: 2
};

@translate()
@withPageHelpers
@withErrorHandling
class TreeTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            treeData: []
        };

        if (props.data) {
            this.state.treeData = props.data;
        }

        // Select Mode simply cannot be changed later. This is just to make sure we avoid inconsistencies if someone changes it anyway.
        this.selectMode = this.props.selectMode;
    }

    static defaultProps = {
        selectMode: TreeSelectMode.NONE 
    }

    @withAsyncErrorHandler
    async loadData(dataUrl) {
        const response = await axios.get(dataUrl);
        const treeData = response.data;

        for (const root of treeData) {
            root.expanded = true;
            for (const child of root.children) {
                child.expanded = true;
            }
        }

        this.setState({
            treeData
        });
    }

    static propTypes = {
        dataUrl: PropTypes.string,
        data: PropTypes.array,
        selectMode: PropTypes.number,
        selection: PropTypes.oneOfType([PropTypes.array, PropTypes.string, PropTypes.number]),
        onSelectionChangedAsync: PropTypes.func,
        actions: PropTypes.func,
        withHeader: PropTypes.bool,
        withDescription: PropTypes.bool,
        noTable: PropTypes.bool,
        withIcons: PropTypes.bool
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data) {
            this.setState({
                treeData: nextProps.data
            });
        } else if (nextProps.dataUrl && this.props.dataUrl !== nextProps.dataUrl) {
            this.loadData(next.props.dataUrl);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.selection !== nextProps.selection || this.state.treeData != nextState.treeData;
    }

    // XSS protection
    sanitizeTreeData(unsafeData) {
        const data = [];
        for (const unsafeEntry of unsafeData) {
            const entry = Object.assign({}, unsafeEntry);
            entry.title = ReactDOMServer.renderToStaticMarkup(<div>{entry.title}</div>);
            entry.description = ReactDOMServer.renderToStaticMarkup(<div>{entry.description}</div>);
            if (entry.children) {
                entry.children = this.sanitizeTreeData(entry.children);
            }
            data.push(entry);
        }
        return data;
    }

    componentDidMount() {
        if (!this.props.data && this.props.dataUrl) {
            this.loadData(this.props.dataUrl);
        }

        let createNodeFn;
        createNodeFn = (event, data) => {
            const node = data.node;
            const tdList = jQuery(node.tr).find(">td");

            let tdIdx = 1;

            if (this.props.withDescription) {
                const descHtml = node.data.description; // This was already sanitized in sanitizeTreeData when the data was loaded
                tdList.eq(tdIdx).html(descHtml);
                tdIdx += 1;
            }

            if (this.props.actions) {
                const linksContainer = jQuery(`<span class="${styles.actionLinks}"/>`);

                const actions = this.props.actions(node);
                for (const {label, link} of actions) {
                    const lnkHtml = ReactDOMServer.renderToStaticMarkup(<a href={link}>{label}</a>);
                    const lnk = jQuery(lnkHtml);
                    lnk.click((evt) => {
                        evt.preventDefault();
                        this.navigateTo(link)
                    });
                    linksContainer.append(lnk);
                }
                tdList.eq(tdIdx).html(linksContainer);
                tdIdx += 1;
            }
        };

        const treeOpts = {
            extensions: ['glyph'],
            glyph: {
                map: {
                    expanderClosed: 'glyphicon glyphicon-menu-right',
                    expanderLazy: 'glyphicon glyphicon-menu-right',  // glyphicon-plus-sign
                    expanderOpen: 'glyphicon glyphicon-menu-down',  // glyphicon-collapse-down
                    checkbox: 'glyphicon glyphicon-unchecked',
                    checkboxSelected: 'glyphicon glyphicon-check',
                    checkboxUnknown: 'glyphicon glyphicon-share',

                    folder: 'glyphicon glyphicon-folder-close',
                    folderOpen: 'glyphicon glyphicon-folder-open',
                    doc: 'glyphicon glyphicon-file',
                    docOpen: 'glyphicon glyphicon-file'
                }
            },
            selectMode: (this.selectMode === TreeSelectMode.MULTI ? 2 : 1),
            icon: !!this.props.withIcons,
            autoScroll: true,
            scrollParent: jQuery(this.domTableContainer),
            source: this.sanitizeTreeData(this.state.treeData),
            toggleEffect: false,
            createNode: createNodeFn,
            checkbox: this.selectMode === TreeSelectMode.MULTI,
            activate: (this.selectMode === TreeSelectMode.SINGLE ? ::this.onActivate : null),
            select: (this.selectMode === TreeSelectMode.MULTI ? ::this.onSelect : null),
        };

        if (!this.props.noTable) {
            treeOpts.extensions.push('table');
            treeOpts.table = {
                nodeColumnIdx: 0
            };
        }

        this.tree = jQuery(this.domTable).fancytree(treeOpts).fancytree("getTree");

        this.updateSelection();
    }

    componentDidUpdate() {
        this.tree.reload(this.sanitizeTreeData(this.state.treeData));
        this.updateSelection();
    }

    updateSelection() {
        const tree = this.tree;
        if (this.selectMode === TreeSelectMode.MULTI) {
            const selectSet = new Set(this.props.selection.map(key => this.stringifyKey(key)));

            tree.enableUpdate(false);
            tree.visit(node => node.setSelected(selectSet.has(node.key)));
            tree.enableUpdate(true);

        } else if (this.selectMode === TreeSelectMode.SINGLE) {
            this.tree.activateKey(this.stringifyKey(this.props.selection));
        }
    }

    @withAsyncErrorHandler
    async onSelectionChanged(sel) {
        if (this.props.onSelectionChangedAsync) {
            await this.props.onSelectionChangedAsync(sel);
        }
    }

    stringifyKey(key) {
        if (key !== null && key !== undefined) {
            return key.toString();
        } else {
            return key;
        }
    }

    destringifyKey(key) {
        if (/^(\-|\+)?([0-9]+|Infinity)$/.test(key)) {
            return Number(key);
        } else {
            return key;
        }
    }

    // Single-select
    onActivate(event, data) {
        const selection = this.destringifyKey(this.tree.getActiveNode().key);

        if (selection !== this.props.selection) {
            this.onSelectionChanged(selection);
        }
    }

    // Multi-select
    onSelect(event, data) {
        const newSel = this.tree.getSelectedNodes().map(node => this.destringifyKey(node.key)).sort();
        const oldSel = this.props.selection;

        let updated = false;
        const length = oldSel.length;
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
            this.onSelectionChanged(selection);
        }
    }

    render() {
        const t = this.props.t;
        const props = this.props;
        const actions = props.actions;
        const withHeader = props.withHeader;
        const withDescription = props.withDescription;

        let containerClass = 'mt-treetable-container';
        if (this.selectMode === TreeSelectMode.NONE) {
            containerClass += ' mt-treetable-inactivable';
        } else {
            if (!props.noTable) {
                containerClass += ' table-hover';
            }
        }

        if (!this.withHeader) {
            containerClass += ' mt-treetable-noheader';
        }

        // FIXME: style={{ height: '100px', overflow: 'auto'}}

        if (props.noTable) {
            return (
                <div className={containerClass} ref={(domElem) => { this.domTableContainer = domElem; }} >
                    <div ref={(domElem) => { this.domTable = domElem; }}>
                    </div>
                </div>
            );

        } else {
            let tableClass = 'table table-striped table-condensed';
            if (this.selectMode !== TreeSelectMode.NONE) {
                tableClass += ' table-hover';
            }

            return (
                <div className={containerClass} ref={(domElem) => { this.domTableContainer = domElem; }} >
                    <table ref={(domElem) => { this.domTable = domElem; }} className={tableClass}>
                        {props.withHeader &&
                        <thead>
                        <tr>
                            <th className="mt-treetable-title">{t('Name')}</th>
                            {withDescription && <th>{t('Description')}</th>}
                            {actions && <th></th>}
                        </tr>
                        </thead>
                        }
                        <tbody>
                        <tr>
                            <td></td>
                            {withDescription && <td></td>}
                            {actions && <td></td>}
                        </tr>
                        </tbody>
                    </table>
                </div>
            );
        }

    }
}

export {
    TreeTable,
    TreeSelectMode
}