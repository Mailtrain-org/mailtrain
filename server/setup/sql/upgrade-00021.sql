# Header section
# Define incrementing schema version number
SET @schema_version = '21';

# Add fields editor_name, editor_data to templates
ALTER TABLE `templates` ADD COLUMN `editor_name` varchar(50) DEFAULT '' AFTER `description`;
ALTER TABLE `templates` ADD COLUMN `editor_data` longtext AFTER `editor_name`;

# Add fields editor_name, editor_data to campaigns
ALTER TABLE `campaigns` ADD COLUMN `editor_name` varchar(50) DEFAULT '' AFTER `source_url`;
ALTER TABLE `campaigns` ADD COLUMN `editor_data` longtext AFTER `editor_name`;

# Footer section
LOCK TABLES `settings` WRITE;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
UNLOCK TABLES;
