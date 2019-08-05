'use strict';

import React, {Component} from 'react';
import {withTranslation} from '../../lib/i18n';
import {LinkButton, requiresAuthenticatedUser, Title, Toolbar, withPageHelpers} from '../../lib/page';
import {withErrorHandling} from '../../lib/error-handling';
import {Table} from '../../lib/table';
import {Icon} from "../../lib/bootstrap-components";
import {tableAddDeleteButton, tableRestActionDialogInit, tableRestActionDialogRender} from "../../lib/modals";
import {withComponentMixins} from "../../lib/decorator-helpers";
import PropTypes from 'prop-types';

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
        permissions: PropTypes.object
    }

    render() {
        const t = this.props.t;

        const permissions = this.props.permissions;
        const createPermitted = permissions.createCustomForm;

        const columns = [
            { data: 1, title: t('name') },
            { data: 2, title: t('description') },
            { data: 3, title: t('namespace') },
            {
                actions: data => {
                    const actions = [];
                    const perms = data[4];

                    if (perms.includes('edit')) {
                        actions.push({
                            label: <Icon icon="edit" title={t('edit')}/>,
                            link: `/lists/forms/${data[0]}/edit`
                        });
                    }
                    if (perms.includes('share')) {
                        actions.push({
                            label: <Icon icon="share" title={t('share')}/>,
                            link: `/lists/forms/${data[0]}/share`
                        });
                    }

                    tableAddDeleteButton(actions, this, perms, `rest/forms/${data[0]}`, data[1], t('deletingForm'), t('formDeleted'));

                    return actions;
                }
            }
        ];

        return (
            <div>
                {tableRestActionDialogRender(this)}
                {createPermitted &&
                    <Toolbar>
                        <LinkButton to="/lists/forms/create" className="btn-primary" icon="plus" label={t('createCustomForm')}/>
                    </Toolbar>
                }

                <Title>{t('forms')}</Title>

                <Table ref={node => this.table = node} withHeader dataUrl="rest/forms-table" columns={columns} />
            </div>
        );
    }
}