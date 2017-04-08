# Header section
# Define incrementing schema version number
SET @schema_version = '4';

# Adds new column 'template_url' to campaigns table
# Indicates that this campaign should fetch message content from this URL
ALTER TABLE `campaigns` ADD COLUMN `template_url` varchar(255) CHARACTER SET ascii DEFAULT NULL AFTER `template`;

# Footer section
LOCK TABLES `settings` WRITE;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
UNLOCK TABLES;
