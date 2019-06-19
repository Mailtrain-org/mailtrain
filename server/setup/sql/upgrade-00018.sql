# Header section
# Define incrementing schema version number
SET @schema_version = '18';

# Add template field for group elements
ALTER TABLE `campaigns` ADD COLUMN `tracking_disabled` tinyint(4) unsigned NOT NULL DEFAULT '0' AFTER `status`;
ALTER TABLE `confirmations` ADD COLUMN `opt_in_ip` varchar(100) DEFAULT NULL AFTER `email`;

# Footer section
LOCK TABLES `settings` WRITE;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
UNLOCK TABLES;
