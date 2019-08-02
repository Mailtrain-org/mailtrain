exports.up = (knex, Promise) => (async() => {
    const queued = await knex('queued');

    for (const queuedEntry of queued) {
        const data = JSON.parse(queuedEntry.data);

        data.listId = queuedEntry.list;
        data.subscriptionId = queuedEntry.subscription;

        await knex('queued')
            .where('id', queuedEntry.id)
            .update({
                data: JSON.stringify(data)
            });
    }

    await knex.schema.table('queued', table => {
        table.dropColumn('list');
        table.dropColumn('subscription');
    });

})();

exports.down = (knex, Promise) => (async() => {
})();
