'use strict';

const knex = require('../lib/knex');
const permissions = require('../lib/permissions');

async function ajaxListTx(tx, params, queryFun, columns, options) {
    options = options || {};

    const columnsNames = [];
    const columnsSelect = [];

    for (const col of columns) {
        if (typeof col === 'string') {
            columnsNames.push(col);
            columnsSelect.push(col);
        } else {
            columnsNames.push(col.name);

            if (col.raw) {
                columnsSelect.push(tx.raw(col.raw));
            } else if (col.query) {
                columnsSelect.push(function () { return col.query(this); });
            }
        }
    }

    if (params.operation === 'getBy') {
        const query = queryFun(tx);
        query.whereIn(columnsNames[parseInt(params.column)], params.values);
        query.select(columnsSelect);
        query.options({rowsAsArray:true});

        const rows = await query;
        const rowsOfArray = rows.map(row => Object.keys(row).map(key => row[key]));
        return rowsOfArray;

    } else {
        const whereFun = function() {
            let searchVal = '%' + params.search.value.replace(/\\/g, '\\\\').replace(/([%_])/g, '\\$1') + '%';
            for (let colIdx = 0; colIdx < params.columns.length; colIdx++) {
                const col = params.columns[colIdx];
                if (col.searchable) {
                    this.orWhere(columnsNames[parseInt(col.data)], 'like', searchVal);
                }
            }
        }

        /* There are a few SQL peculiarities that make this query a bit weird:
           - Group by (which is used in getting permissions) don't go well with count(*). Thus we run the actual query
             as a sub-query and then count the number of results.
           - SQL does not like if it have columns with the same name in the subquery. This happens multiple tables are joined.
             To circumvent this, we select only the first column (whatever it is). Since this is not "distinct", it is supposed
             to give us the right number of rows anyway.
         */
        const recordsTotalQuery = tx.count('* as recordsTotal').from(function () { return queryFun(this).select(columnsSelect[0]).as('records'); }).first();
        const recordsTotal = (await recordsTotalQuery).recordsTotal;

        const recordsFilteredQuery = tx.count('* as recordsFiltered').from(function () { return queryFun(this).select(columnsSelect[0]).where(whereFun).as('records'); }).first();
        const recordsFiltered = (await recordsFilteredQuery).recordsFiltered;

        const query = queryFun(tx);
        query.where(whereFun);

        query.offset(parseInt(params.start));

        const limit = parseInt(params.length);
        if (limit >= 0) {
            query.limit(limit);
        }

        query.select([...columnsSelect, ...options.extraColumns || [] ]);

        for (const order of params.order) {
            if (options.orderByBuilder) {
                options.orderByBuilder(query, columnsNames[params.columns[order.column].data], order.dir);
            } else {
                query.orderBy(columnsNames[params.columns[order.column].data], order.dir);
            }
        }

        query.options({rowsAsArray:true});

        const rows = await query;
        const rowsOfArray = rows.map(row => {
            const arr = Object.keys(row).map(field => row[field]);

            if (options.mapFun) {
                const result = options.mapFun(arr);
                return result || arr;
            } else {
                return arr;
            }
        });

        const result = {
            draw: params.draw,
            recordsTotal,
            recordsFiltered,
            data: rowsOfArray
        };

        return result;
    }
}

async function ajaxListWithPermissionsTx(tx, context, fetchSpecs, params, queryFun, columns, options) {
    options = options || {};

    const permCols = [];
    for (const fetchSpec of fetchSpecs) {
        const entityType = permissions.getEntityType(fetchSpec.entityTypeId);
        permCols.push({
            name: `permissions_${fetchSpec.entityTypeId}`,
            query: builder => builder
                .from(entityType.permissionsTable)
                .select(knex.raw('GROUP_CONCAT(operation SEPARATOR \';\')'))
                .whereRaw(`${entityType.permissionsTable}.entity = ${entityType.entitiesTable}.id`)
                .where(`${entityType.permissionsTable}.user`, context.user.id)
                .as(`permissions_${fetchSpec.entityTypeId}`)
        });
    }

    return await ajaxListTx(
        tx,
        params,
        builder => {
            let query = queryFun(builder);

            for (const fetchSpec of fetchSpecs) {
                const entityType = permissions.getEntityType(fetchSpec.entityTypeId);

                if (fetchSpec.requiredOperations) {
                    query = query.innerJoin(
                        function () {
                            return this.from(entityType.permissionsTable).select('entity').where('user', context.user.id).whereIn('operation', fetchSpec.requiredOperations).as(`permitted__${fetchSpec.entityTypeId}`);
                        },
                        `permitted__${fetchSpec.entityTypeId}.entity`, `${entityType.entitiesTable}.id`)
                }
            }

            return query;
        },
        [
            ...columns,
            ...permCols
        ],
        {
            mapFun: data => {
                for (let idx = 0; idx < fetchSpecs.length; idx++) {
                    data[columns.length + idx] = data[columns.length + idx].split(';');
                }

                if (options.mapFun) {
                    const result = options.mapFun(data);
                    return result || data;
                } else {
                    return data;
                }
            },

            orderByBuilder: options.orderByBuilder,
            extraColumns: options.extraColumns
        }
    );
}

async function ajaxList(params, queryFun, columns, options) {
    return await knex.transaction(async tx => {
        return ajaxListTx(tx, params, queryFun, columns, options)
    });
}

async function ajaxListWithPermissions(context, fetchSpecs, params, queryFun, columns, options) {
    return await knex.transaction(async tx => {
        return ajaxListWithPermissionsTx(tx, context, fetchSpecs, params, queryFun, columns, options)
    });
}

module.exports = {
    ajaxListTx,
    ajaxList,
    ajaxListWithPermissionsTx,
    ajaxListWithPermissions
};