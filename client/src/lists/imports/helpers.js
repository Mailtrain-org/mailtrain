'use strict';

import React from 'react';
import {ImportType, ImportStatus, RunStatus} from '../../../../shared/imports';

export function getImportTypes(t) {

    const importTypeLabels = {
        [ImportType.CSV_FILE]: t('CSV file'),
        [ImportType.LIST]: t('List'),
    };

    const importStatusLabels = {
        [ImportStatus.PREP_SCHEDULED]: t('Created'),
        [ImportStatus.PREP_RUNNING]: t('Preparing'),
        [ImportStatus.PREP_STOPPING]: t('Stopping'),
        [ImportStatus.PREP_FINISHED]: t('Ready'),
        [ImportStatus.PREP_FAILED]: t('Preparation failed'),
        [ImportStatus.RUN_SCHEDULED]: t('Scheduled'),
        [ImportStatus.RUN_RUNNING]: t('Running'),
        [ImportStatus.RUN_STOPPING]: t('Stopping'),
        [ImportStatus.RUN_FINISHED]: t('Finished'),
        [ImportStatus.RUN_FAILED]: t('Failed')
    };

    const runStatusLabels = {
        [RunStatus.SCHEDULED]: t('Starting'),
        [RunStatus.RUNNING]: t('Running'),
        [RunStatus.STOPPING]: t('Stopping'),
        [RunStatus.FINISHED]: t('Finished')
    };

    return {
        importStatusLabels,
        importTypeLabels,
        runStatusLabels
    };
}

