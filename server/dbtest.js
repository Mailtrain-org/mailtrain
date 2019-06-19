'use strict';

const config = require('config');
const knex = require('./lib/knex');
const moment = require('moment');
const shortid = require('shortid');

async function run() {
//    const info = await knex('subscription__1').columnInfo();
//    console.log(info);

//    const ts = moment().toDate();
    const ts = new Date(Date.now());
    console.log(ts);

    const cid = shortid.generate();

    await knex('subscription__1')
        .insert({
            email: cid,
            cid,
            custom_date_mmddyy_rjkeojrzz: ts
        });


    const row = await knex('subscription__1').select(['id', 'created', 'custom_date_mmddyy_rjkeojrzz']).where('cid', cid).first();

//    const row = await knex('subscription__1').where('id', 2).first();
    console.log(row);
}

run();