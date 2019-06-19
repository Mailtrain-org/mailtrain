# Header section
# Define incrementing schema version number
SET @schema_version = '20';

# Add reply_to field
ALTER TABLE `campaigns` ADD COLUMN `reply_to` varchar(255) DEFAULT '' AFTER `address`;

# Footer section
LOCK TABLES `settings` WRITE;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
UNLOCK TABLES;
