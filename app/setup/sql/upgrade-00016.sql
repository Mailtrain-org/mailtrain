# Header section
# Define incrementing schema version number
SET @schema_version = '16';

ALTER TABLE `triggers` ADD COLUMN `count` int(11) unsigned NOT NULL DEFAULT '0' AFTER `dest_campaign`;

# Footer section
LOCK TABLES `settings` WRITE;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
UNLOCK TABLES;
