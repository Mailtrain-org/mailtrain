# Header section
# Define incrementing schema version number
SET @schema_version = '8';

# Create new table to store RSS entries for RSS campaigns
CREATE TABLE `rss` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `parent` int(11) unsigned NOT NULL,
  `guid` varchar(255) NOT NULL DEFAULT '',
  `pubdate` timestamp NULL DEFAULT NULL,
  `campaign` int(11) unsigned DEFAULT NULL,
  `found` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `parent_2` (`parent`,`guid`),
  KEY `parent` (`parent`),
  CONSTRAINT `rss_ibfk_1` FOREIGN KEY (`parent`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
ALTER TABLE `campaigns` ADD COLUMN `parent` int(11) unsigned DEFAULT NULL AFTER `type`;
CREATE INDEX parent_index ON `campaigns` (`parent`);
ALTER TABLE `campaigns` ADD COLUMN `last_check` timestamp NULL DEFAULT NULL AFTER `source_url`;
ALTER TABLE `campaigns` ADD COLUMN `check_status` varchar(255) NULL DEFAULT NULL AFTER `last_check`;
CREATE INDEX check_index ON `campaigns` (`last_check`);
ALTER TABLE `campaigns` ADD COLUMN `html_prepared` text AFTER `html`;

# Footer section
LOCK TABLES `settings` WRITE;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
UNLOCK TABLES;
