'use strict';

import React, { Component } from 'react';
import ReactDOMServer from 'react-dom/server';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';

import jQuery from 'jquery';
import '../../public/jquery/jquery-ui-1.12.1.min.js';

import 'datatables.net';
import 'datatables.net-bs';
import 'datatables.net-bs/css/dataTables.bootstrap.css';

import './table.css';
import axios from './axios';

import { withPageHelpers } from '../lib/page'
import { withErrorHandling, withAsyncErrorHandler } from './error-handling';

//dtFactory();
//dtSelectFactory();


const TableSelectMode = {
    NONE: 0,
    SINGLE: 1,
    MULTI: 2
};


@translate()
@withPageHelpers
@withErrorHandling
class Table extends Component {
    constructor(props) {
        super(props);
        this.selectionMap = this.getSelectionMap(props);
    }

    static propTypes = {
        dataUrl: PropTypes.string,
        data: PropTypes.array,
        columns: PropTypes.array,
        selectMode: PropTypes.number,
        selection: PropTypes.oneOfType([PropTypes.array, PropTypes.string, PropTypes.number]),
        selectionKeyIndex: PropTypes.number,
        onSelectionChangedAsync: PropTypes.func,
        onSelectionDataAsync: PropTypes.func,
        actionLinks: PropTypes.array,
        withHeader: PropTypes.bool
    }

    static defaultProps = {
        selectMode: TableSelectMode.NONE,
        selectionKeyIndex: 0
    }

    getSelectionMap(props) {
        let selArray = [];
        if (props.selectMode === TableSelectMode.SINGLE) {
            if (props.selection !== null && props.selection !== undefined) {
                selArray = [props.selection];
            } else {
                selArray = [];
            }
        } else if (props.selectMode === TableSelectMode.MULTI) {
            selArray = props.selection;
        }

        const selMap = new Map();

        for (const elem of selArray) {
            selMap.set(elem, undefined);
        }

        if (this.table) {
            const self = this;
            this.table.rows().every(function() {
                const data = this.data();
                const key = data[self.props.selectionKeyIndex];
                if (selMap.has(key)) {
                    selMap.set(key, data);
                }
            });
        }

        return selMap;
    }

    updateSelectInfo() {
        const t = this.props.t;

        const count = this.selectionMap.size;
        if (this.selectionMap.size > 0) {
            const jqInfo = jQuery('<span>' + t('{{ count }} entries selected.', { count }) + ' </span>');
            const jqDeselectLink = jQuery('<a href="">Deselect all.</a>').on('click', ::this.deselectAll);

            this.jqSelectInfo.empty().append(jqInfo).append(jqDeselectLink);
        } else {
            this.jqSelectInfo.empty();
        }
    }

    @withAsyncErrorHandler
    async fetchData(data, callback) {
        // This custom ajax fetch function allows us to properly handle the case when the user is not authenticated.
        const response = await axios.post(this.props.dataUrl, data);
        callback(response.data);
    }

    @withAsyncErrorHandler
    async fetchSelectionData() {
        if (this.props.onSelectionDataAsync) {
            const keysToFetch = [];
            for (const pair of this.selectionMap.entries()) {
                if (!pair[1]) {
                    keysToFetch.push(pair[0]);
                }
            }

            if (keysToFetch.length > 0) {
                const response = await axios.post(this.props.dataUrl, {
                    operation: 'getBy',
                    column: this.props.selectionKeyIndex,
                    values: keysToFetch
                });

                console.log(response.data);

                for (const row of response.data) {
                    const key = row[this.props.selectionKeyIndex];
                    if (this.selectionMap.has(key)) {
                        this.selectionMap.set(key, row);
                    }
                }
            }

            this.notifySelection(this.props.onSelectionDataAsync, this.selectionMap);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        const nextSelectionMap = this.getSelectionMap(nextProps);

        let updateDueToSelectionChange = false;
        if (nextSelectionMap.size !== this.selectionMap.size) {
            updateDueToSelectionChange = true;
        } else {
            for (const key of this.selectionMap.keys()) {
                if (!nextSelectionMap.has(key)) {
                    updateDueToSelectionChange = true;
                    break;
                }
            }
        }

        this.selectionMap = nextSelectionMap;

        return updateDueToSelectionChange || this.props.data != nextProps.data || this.props.dataUrl != nextProps.dataUrl;
    }

    componentDidMount() {
        const columns = this.props.columns.slice();

        if (this.props.actionLinks) {
            const actionLinks = this.props.actionLinks;

            const createdCellFn = (td, data) => {
                const linksContainer = jQuery('<span class="mt-action-links"/>');
                for (const {label, link} of actionLinks) {
                    const dest = link(data);
                    const lnkHtml = ReactDOMServer.renderToStaticMarkup(<a href={dest}>{label}</a>);
                    const lnk = jQuery(lnkHtml);
                    lnk.click((evt) => { evt.preventDefault(); this.navigateTo(dest) });
                    linksContainer.append(lnk);
                }

                jQuery(td).html(linksContainer);
            };

            columns.push({
                data: null,
                orderable: false,
                searchable: false,
                type: 'html',
                createdCell: createdCellFn
            });
        }

        const dtOptions = {
            columns
        };

        const self = this;
        dtOptions.createdRow = function(row, data) {
            const rowKey = data[self.props.selectionKeyIndex];

            if (self.selectionMap.has(rowKey)) {
                jQuery(row).addClass('selected');
            }

            jQuery(row).on('click', () => {
                const selectionMap = self.selectionMap;

                if (self.props.selectMode === TableSelectMode.SINGLE) {
                    if (selectionMap.size !== 1 || !selectionMap.has(rowKey)) {
                        self.notifySelection(self.props.onSelectionChangedAsync, new Map([[rowKey, data]]));
                    }

                } else if (self.props.selectMode === TableSelectMode.MULTI) {
                    const newSelMap = new Map(selectionMap);

                    if (selectionMap.has(rowKey)) {
                        newSelMap.delete(rowKey);
                    } else {
                        newSelMap.set(rowKey, data);
                    }

                    self.notifySelection(self.props.onSelectionChangedAsync, newSelMap);
                }
            });
        };

        dtOptions.initComplete = function() {
            self.jqSelectInfo = jQuery('<div class="dataTable_selection_info"/>');
            const jqWrapper = jQuery(self.domTable).parents('.dataTables_wrapper');
            jQuery('.dataTables_info', jqWrapper).after(self.jqSelectInfo);

            self.updateSelectInfo();
        };

        if (this.props.data) {
            dtOptions.data = this.props.data;
        } else {
            dtOptions.serverSide = true;
            dtOptions.ajax = ::this.fetchData;
        }

        this.table = jQuery(this.domTable).DataTable(dtOptions);

        this.fetchSelectionData();
    }

    componentDidUpdate() {
        if (this.props.data) {
            this.table.clear();
            this.table.rows.add(this.props.data);

        } else {
            const self = this;
            this.table.rows().every(function() {
                const key = this.data()[self.props.selectionKeyIndex];
                if (self.selectionMap.has(key)) {
                    jQuery(this.node()).addClass('selected');
                } else {
                    jQuery(this.node()).removeClass('selected');
                }
            });
        }

        this.updateSelectInfo();
        this.fetchSelectionData();
    }

    async notifySelection(eventCallback, newSelectionMap) {
        if (eventCallback) {
            const selPairs = Array.from(newSelectionMap).sort((l, r) => l[0] - r[0]);

            let data = selPairs.map(entry => entry[1]);
            let sel = selPairs.map(entry => entry[0]);

            if (this.props.selectMode === TableSelectMode.SINGLE) {
                if (sel.length) {
                    sel = sel[0];
                    data = data[0];
                } else {
                    sel = null;
                    data = null;
                }
            }

            await eventCallback(sel, data);
        }
    }

    async deselectAll(evt) {
        evt.preventDefault();
        this.notifySelection(this.props.onSelectionChangedAsync, new Map());
    }

    render() {
        const t = this.props.t;
        const props = this.props;

        let className = 'table table-striped table-bordered';

        if (this.props.selectMode !== TableSelectMode.NONE) {
            className += ' table-hover';
        }

        return (
            <div>
                <table ref={(domElem) => { this.domTable = domElem; }} className={className} cellSpacing="0" width="100%" />
            </div>
        );
    }
}

export {
    Table,
    TableSelectMode
}