exports.up = (knex, Promise) => (async() => {
    await knex.schema.raw('CREATE TABLE `file_cache` (\n' +
        '  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,\n' +
        '  `type` varchar(255) NOT NULL,\n' +
        '  `key` varchar(255) NOT NULL,\n' +
        '  `mimetype` varchar(255) DEFAULT NULL,\n' +
        '  `size` int(11) DEFAULT NULL,\n' +
        '  `created` timestamp NOT NULL DEFAULT current_timestamp(),\n' +
        '  PRIMARY KEY (`id`),\n' +
        '  KEY `key` (`key`(191))\n' +
        ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;');
})();

exports.down = (knex, Promise) => (async() => {
})();
