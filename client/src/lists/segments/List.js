'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from '../../lib/i18n';
import {LinkButton, requiresAuthenticatedUser, Title, Toolbar, withPageHelpers} from '../../lib/page';
import {withErrorHandling} from '../../lib/error-handling';
import {Table} from '../../lib/table';
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
    }

    static propTypes = {
        list: PropTypes.object
    }

    componentDidMount() {
    }

    render() {
        const t = this.props.t;

        const columns = [
            { data: 1, title: t('name') },
            {
                actions: data => {
                    const actions = [];

                    if (this.props.list.permissions.includes('manageSegments')) {
                        actions.push({
                            label: <Icon icon="edit" title={t('edit')}/>,
                            link: `/lists/${this.props.list.id}/segments/${data[0]}/edit`
                        });

                        tableAddDeleteButton(actions, this, null, `rest/segments/${this.props.list.id}/${data[0]}`, data[1], t('deletingSegment'), t('segmentDeleted'));
                    }

                    return actions;
                }
            }
        ];

        return (
            <div>
                {tableRestActionDialogRender(this)}
                {this.props.list.permissions.includes('manageSegments') &&
                    <Toolbar>
                        <LinkButton to={`/lists/${this.props.list.id}/segments/create`} className="btn-primary" icon="plus" label={t('createSegment')}/>
                    </Toolbar>
                }

                <Title>{t('segments')}</Title>

                <Table ref={node => this.table = node} withHeader dataUrl={`rest/segments-table/${this.props.list.id}`} columns={columns} />
            </div>
        );
    }
}