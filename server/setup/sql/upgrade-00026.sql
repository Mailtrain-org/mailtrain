# Header section
# Define incrementing schema version number
SET @schema_version = '26';

# Add field
ALTER TABLE `lists` ADD COLUMN `public_subscribe` tinyint(1) unsigned DEFAULT 1 NOT NULL AFTER `created`;

# Footer section
LOCK TABLES `settings` WRITE;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
UNLOCK TABLES;
