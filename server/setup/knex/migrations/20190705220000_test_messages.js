exports.up = (knex, Promise) => (async() => {
    await knex.schema.raw('CREATE TABLE `test_messages` (\n' +
        '  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,\n' +
        '  `campaign` int(10) unsigned NOT NULL,\n' +
        '  `list` int(10) unsigned NOT NULL,\n' +
        '  `subscription` int(10) unsigned NOT NULL,\n' +
        '  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,\n' +
        '  PRIMARY KEY (`id`),\n' +
        '  UNIQUE KEY `cls` (`campaign`, `list`, `subscription`)\n' +
        ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n');
})();

exports.down = (knex, Promise) => (async() => {
})();
