exports.up = (knex, Promise) => (async() =>  {
    await knex.schema.dropTableIfExists('subscription');
})();

exports.down = (knex, Promise) => (async() =>  {
})();
