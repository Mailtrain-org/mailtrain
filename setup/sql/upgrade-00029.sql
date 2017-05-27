# Header section
# Define incrementing schema version number
SET @schema_version = '29';

# Rename column tracking_disabled
ALTER TABLE `campaigns` ADD COLUMN `open_tracking_disabled` tinyint(4) unsigned DEFAULT 0 NOT NULL, ADD COLUMN `click_tracking_disabled` tinyint(4) unsigned DEFAULT 0 NOT NULL;
UPDATE `campaigns` SET `open_tracking_disabled` = `tracking_disabled`, `click_tracking_disabled` = `tracking_disabled`;
ALTER TABLE `campaigns` DROP COLUMN `tracking_disabled`;

# Footer section
LOCK TABLES `settings` WRITE;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
UNLOCK TABLES;
