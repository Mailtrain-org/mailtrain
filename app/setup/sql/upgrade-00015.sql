# Header section
# Define incrementing schema version number
SET @schema_version = '15';

# table for trigger definitions
CREATE TABLE `triggers` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '',
  `description` text,
  `enabled` tinyint(4) unsigned NOT NULL DEFAULT '1',
  `list` int(11) unsigned NOT NULL,
  `source_campaign` int(11) unsigned DEFAULT NULL,
  `rule` varchar(255) CHARACTER SET ascii NOT NULL DEFAULT 'column',
  `column` varchar(255) CHARACTER SET ascii DEFAULT NULL,
  `seconds` int(11) NOT NULL DEFAULT '0',
  `dest_campaign` int(11) unsigned DEFAULT NULL,
  `last_check` timestamp NULL DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `name` (`name`(191)),
  KEY `source_campaign` (`source_campaign`),
  KEY `dest_campaign` (`dest_campaign`),
  KEY `list` (`list`),
  KEY `column` (`column`),
  KEY `active` (`enabled`),
  KEY `last_check` (`last_check`),
  CONSTRAINT `triggers_ibfk_1` FOREIGN KEY (`list`) REFERENCES `lists` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

# base table for triggered matches
CREATE TABLE `trigger` (
  `list` int(11) unsigned NOT NULL,
  `subscription` int(11) unsigned NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`list`,`subscription`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

# table for yet queued messages ready to be sent
CREATE TABLE `queued` (
  `campaign` int(11) unsigned NOT NULL,
  `list` int(11) unsigned NOT NULL,
  `subscriber` int(11) unsigned NOT NULL,
  `source` varchar(255) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`campaign`,`list`,`subscriber`),
  KEY `created` (`created`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- {{#each tables.subscription}}
    # Adds indexes for triggers
    CREATE INDEX latest_open ON `{{this}}` (`latest_open`);
    CREATE INDEX latest_click ON `{{this}}` (`latest_click`);
    CREATE INDEX created ON `{{this}}` (`created`);
-- {{/each}}

# Footer section
LOCK TABLES `settings` WRITE;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
UNLOCK TABLES;
