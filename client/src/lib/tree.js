'use strict';

import React, {Component} from 'react';
import ReactDOMServer
    from 'react-dom/server';
import {withTranslation} from './i18n';
import PropTypes
    from 'prop-types';

import jQuery
    from 'jquery';
import '../../static/jquery/jquery-ui-1.12.1.min.js';
import '../../static/fancytree/jquery.fancytree-all.min.js';
import '../../static/fancytree/skin-bootstrap/ui.fancytree.min.css';
import './tree.scss';
import axios
    from './axios';

import {withPageHelpers} from './page'
import {
    withAsyncErrorHandler,
    withErrorHandling
} from './error-handling';
import styles
    from "./styles.scss";
import {getUrl} from "./urls";
import {withComponentMixins} from "./decorator-helpers";

const TreeSelectMode = {
    NONE: 0,
    SINGLE: 1,
    MULTI: 2
};

@withComponentMixins([
    withTranslation,
    withErrorHandling,
    withPageHelpers
], ['refresh'])
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

    refresh() {
        if (this.tree) {
            this.tree.reload(this.sanitizeTreeData(this.state.treeData));
            this.updateSelection();
        }
    }

    @withAsyncErrorHandler
    async loadData() {
        const response = await axios.get(getUrl(this.props.dataUrl));
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
        withIcons: PropTypes.bool,
        className: PropTypes.string
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.selection !== nextProps.selection || this.state.treeData != nextState.treeData || this.props.className !== nextProps.className;
    }

    // XSS protection
    sanitizeTreeData(unsafeData) {
        const data = [];
        for (const unsafeEntry of unsafeData) {
            const entry = Object.assign({}, unsafeEntry);
            entry.unsanitizedTitle = entry.title;
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
            // noinspection JSIgnoredPromiseFromCall
            this.loadData();
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

                for (const action of actions) {
                    if (action.action) {
                        const html = ReactDOMServer.renderToStaticMarkup(<a href="">{action.label}</a>);
                        const elem = jQuery(html);
                        elem.click((evt) => { evt.preventDefault(); action.action(this) });
                        linksContainer.append(elem);

                    } else if (action.link) {
                        const html = ReactDOMServer.renderToStaticMarkup(<a href={action.link}>{action.label}</a>);
                        const elem = jQuery(html);
                        elem.click((evt) => { evt.preventDefault(); this.navigateTo(action.link) });
                        linksContainer.append(elem);

                    } else if (action.href) {
                        const html = ReactDOMServer.renderToStaticMarkup(<a href={action.href}>{action.label}</a>);
                        const elem = jQuery(html);
                        linksContainer.append(elem);

                    } else {
                        const html = ReactDOMServer.renderToStaticMarkup(<span>{action.label}</span>);
                        const elem = jQuery(html);
                        linksContainer.append(elem);
                    }
                }

                tdList.eq(tdIdx).html(linksContainer);
                tdIdx += 1;
            }
        };

        const treeOpts = {
            extensions: ['glyph'],
            glyph: {
                map: {
                    expanderClosed: 'fas fa-angle-right',
                    expanderLazy: 'fas fa-angle-right',  // glyphicon-plus-sign
                    expanderOpen: 'fas fa-angle-down',  // glyphicon-collapse-down
                    checkbox: 'fas fa-square',
                    checkboxSelected: 'fas fa-check-square',

                    folder: 'fas fa-folder',
                    folderOpen: 'fas fa-folder-open',
                    doc: 'fas fa-file',
                    docOpen: 'fas fa-file'
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

    componentDidUpdate(prevProps, prevState) {
        if (this.props.data) {
            this.setState({
                treeData: this.props.data
            });
        } else if (this.props.dataUrl && prevProps.dataUrl !== this.props.dataUrl) {
            // noinspection JSIgnoredPromiseFromCall
            this.loadData();
        }

        if (this.props.selection !== prevProps.selection || this.state.treeData != prevState.treeData) {
            if (this.state.treeData != prevState.treeData) {
                this.tree.reload(this.sanitizeTreeData(this.state.treeData));
            }

            this.updateSelection();
        }
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
            // noinspection JSIgnoredPromiseFromCall
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
            // noinspection JSIgnoredPromiseFromCall
            this.onSelectionChanged(selection);
        }
    }

    render() {
        const t = this.props.t;
        const props = this.props;
        const actions = props.actions;
        const withHeader = props.withHeader;
        const withDescription = props.withDescription;

        let containerClass = 'mt-treetable-container ' + (this.props.className || '');
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
                            <th className="mt-treetable-title">{t('name')}</th>
                            {withDescription && <th>{t('description')}</th>}
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