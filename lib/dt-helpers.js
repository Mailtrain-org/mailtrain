'use strict';

const knex = require('../lib/knex');

async function ajaxList(params, queryFun, columns) {
    return await knex.transaction(async (tx) => {
        const query = queryFun(tx);

        const recordsTotalQuery = query.clone().count('* as recordsTotal').first();
        const recordsTotal = (await recordsTotalQuery).recordsTotal;

        query.where(function() {
            let searchVal = '%' + params.search.value.replace(/\\/g, '\\\\').replace(/([%_])/g, '\\$1') + '%';
            for (let colIdx = 0; colIdx < params.columns.length; colIdx++) {
                const col = params.columns[colIdx];
                if (col.searchable === 'true') {
                    this.orWhere(columns[parseInt(col.data)], 'like', searchVal);
                }
            }
        });

        const recordsFilteredQuery = query.clone().count('* as recordsFiltered').first();
        const recordsFiltered = (await recordsFilteredQuery).recordsFiltered;

        query.offset(parseInt(params.start));

        const limit = parseInt(params.length);
        if (limit >= 0) {
            query.limit(limit);
        }

        query.select(columns);

        for (const order of params.order) {
            query.orderBy(columns[params.columns[order.column].data], order.dir);
        }

        const rows = await query;
        const rowsOfArray = rows.map(row => Object.keys(row).map(key => row[key]));

        const result = {
            draw: params.draw,
            recordsTotal,
            recordsFiltered,
            data: rowsOfArray
        };

        return result;
    });
}

module.exports = {
    ajaxList
};