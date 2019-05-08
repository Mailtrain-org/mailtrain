'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from '../../lib/i18n';
import {LinkButton, requiresAuthenticatedUser, Title, Toolbar, withPageHelpers} from '../../lib/page';
import {withErrorHandling} from '../../lib/error-handling';
import {Table} from '../../lib/table';
import {getFieldTypes} from './helpers';
import {Icon} from "../../lib/bootstrap-components";
import {tableAddDeleteButton, tableRestActionDialogInit, tableRestActionDialogRender} from "../../lib/modals";
import {withComponentMixins} from "../../lib/decorator-helpers";

@withComponentMixins([
    withTranslation,
    withErrorHandling,
    withPageHelpers,
    requiresAuthenticatedUser
])
export default class List extends Component {
    constructor(props) {
        super(props);

        this.state = {};
        tableRestActionDialogInit(this);

        this.fieldTypes = getFieldTypes(props.t);
    }

    static propTypes = {
        list: PropTypes.object
    }

    componentDidMount() {
    }

    render() {
        const t = this.props.t;

        const columns = [
            { data: 4, title: "#" },
            { data: 1, title: t('name'),
                render: (data, cmd, rowData) => rowData[5] !== null ? <span><Icon icon="dot-circle"/> {data}</span> : data
            },
            { data: 2, title: t('type'), render: data => this.fieldTypes[data].label, sortable: false, searchable: false },
            { data: 3, title: t('mergeTag') },
            {
                actions: data => {
                    const actions = [];

                    if (this.props.list.permissions.includes('manageFields')) {
                        actions.push({
                            label: <Icon icon="edit" title={t('edit')}/>,
                            link: `/lists/${this.props.list.id}/fields/${data[0]}/edit`
                        });

                        tableAddDeleteButton(actions, this, null, `rest/fields/${this.props.list.id}/${data[0]}`, data[1], t('deletingField'), t('fieldDeleted'));
                    }

                    return actions;
                }
            }
        ];

        return (
            <div>
                {tableRestActionDialogRender(this)}
                {this.props.list.permissions.includes('manageFields') &&
                    <Toolbar>
                        <LinkButton to={`/lists/${this.props.list.id}/fields/create`} className="btn-primary" icon="plus" label={t('createField')}/>
                    </Toolbar>
                }

                <Title>{t('fields')}</Title>

                <Table ref={node => this.table = node} withHeader dataUrl={`rest/fields-table/${this.props.list.id}`} columns={columns} />
            </div>
        );
    }
}