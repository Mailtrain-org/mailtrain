'use strict';

import React from 'react';
import {ImportSource, ImportStatus, MappingType, RunStatus} from '../../../../shared/imports';

export function getImportLabels(t) {

    const importSourceLabels = {
        [ImportSource.CSV_FILE]: t('csvFile'),
        [ImportSource.LIST]: t('list'),
    };

    const importStatusLabels = {
        [ImportStatus.PREP_SCHEDULED]: t('created'),
        [ImportStatus.PREP_RUNNING]: t('preparing'),
        [ImportStatus.PREP_STOPPING]: t('stopping'),
        [ImportStatus.PREP_FINISHED]: t('ready'),
        [ImportStatus.PREP_FAILED]: t('preparationFailed'),
        [ImportStatus.RUN_SCHEDULED]: t('scheduled'),
        [ImportStatus.RUN_RUNNING]: t('running'),
        [ImportStatus.RUN_STOPPING]: t('stopping'),
        [ImportStatus.RUN_FINISHED]: t('finished'),
        [ImportStatus.RUN_FAILED]: t('failed')
    };

    const runStatusLabels = {
        [RunStatus.SCHEDULED]: t('starting'),
        [RunStatus.RUNNING]: t('running'),
        [RunStatus.STOPPING]: t('stopping'),
        [RunStatus.FINISHED]: t('finished'),
        [RunStatus.FAILED]: t('failed')
    };

    const mappingTypeLabels = {
        [MappingType.BASIC_SUBSCRIBE]: t('basicImportOfSubscribers'),
        [MappingType.BASIC_UNSUBSCRIBE]: t('unsubscribeEmails'),
    }

    return {
        importStatusLabels,
        mappingTypeLabels,
        importSourceLabels,
        runStatusLabels
    };
}

