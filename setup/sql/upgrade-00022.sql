# Header section
# Define incrementing schema version number
SET @schema_version = '22';

# Add field device_type to campaign_tracker
ALTER TABLE `campaign_tracker` ADD COLUMN `device_type` varchar(50) DEFAULT NULL AFTER `ip`;

# Footer section
LOCK TABLES `settings` WRITE;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
UNLOCK TABLES;
