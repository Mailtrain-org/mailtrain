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
import 'datatables.net-select';
import 'datatables.net-select-bs/css/select.bootstrap.css';

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

        // Select Mode simply cannot be changed later. This is just to make sure we avoid inconsistencies if someone changes it anyway.
        this.selectMode = this.props.selectMode;
    }

    static defaultProps = {
        selectMode: TableSelectMode.NONE 
    }

    static propTypes = {
        dataUrl: PropTypes.string,
        data: PropTypes.array,
        columns: PropTypes.array,
        selectMode: PropTypes.number,
        selection: PropTypes.oneOfType([PropTypes.array, PropTypes.string, PropTypes.number]),
        onSelectionChangedAsync: PropTypes.func,
        actionLinks: PropTypes.array,
        withHeader: PropTypes.bool
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.selection !== nextProps.selection || this.props.data != nextProps.data || this.props.dataUrl != nextProps.dataUrl;
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

        if (this.selectMode === TableSelectMode.MULTI) {
            dtOptions.select = {
                style: 'os'
            }
        } else if (this.selectMode === TableSelectMode.SINGLE) {
            dtOptions.select = {
                style: 'single'
            }
        }

        if (this.props.data) {
            dtOptions.data = this.props.data;
        } else {
            dtOptions.serverSide = true;
            dtOptions.ajax = {
                url: this.props.dataUrl,
                type: 'POST'
            };
        }

        this.table = jQuery(this.domTable).DataTable(dtOptions);

        this.table.on('select.dt', ::this.onSelect);
        this.table.on('deselect.dt', ::this.onSelect);

        this.updateSelection();
    }

    componentDidUpdate() {
        if (this.props.data) {
            this.table.clear();
            this.table.rows.add(this.props.data);
        }

        this.updateSelection();
    }

    updateSelection() {
        /*
        const tree = this.tree;
        if (this.selectMode === TableSelectMode.MULTI) {
            const selectSet = new Set(this.props.selection);

            tree.enableUpdate(false);
            tree.visit(node => node.setSelected(selectSet.has(node.key)));
            tree.enableUpdate(true);

        } else if (this.selectMode === TableSelectMode.SINGLE) {
            this.tree.activateKey(this.props.selection);
        }
        */
    }

    async onSelect(event, data) {
        const sel = this.table.rows( { selected: true } ).data();

        if (this.props.onSelectionChangedAsync) {
            await this.props.onSelectionChangedAsync(sel);
        }
    }

    render() {
        const t = this.props.t;
        const props = this.props;

        return (
            <table ref={(domElem) => { this.domTable = domElem; }} className="table table-striped table-bordered" cellSpacing="0" width="100%" />
        );
    }
}

export {
    Table,
    TableSelectMode
}