# Header section
# Define incrementing schema version number
SET @schema_version = '34';

# Add template field for group elements
ALTER TABLE `custom_fields` ADD COLUMN `description` text AFTER `name`;

# Footer section
LOCK TABLES `settings` WRITE;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
UNLOCK TABLES;
