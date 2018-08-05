'use strict';

import React from 'react';
import {ImportType, ImportStatus} from '../../../../shared/imports';

export function getImportTypes(t) {

    const importTypeLabels = {
        [ImportType.CSV_FILE]: t('CSV file'),
        [ImportType.LIST]: t('List'),
    };

    const importStatusLabels = {
        [ImportStatus.NOT_READY]: t('Preparing'),
        [ImportStatus.RUNNING]: t('Running'),
        [ImportStatus.SCHEDULED]: t('Scheduled'),
        [ImportStatus.FINISHED]: t('Finished')
    };

    return {
        importStatusLabels,
        importTypeLabels
    };
}

