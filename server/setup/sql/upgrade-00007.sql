# Header section
# Define incrementing schema version number
SET @schema_version = '7';

# Rename template_url to source_url in order to use this field for different kind of urls, eg. for RSS url
ALTER TABLE `campaigns` CHANGE COLUMN `template_url` `source_url` varchar(255) CHARACTER SET ascii DEFAULT NULL;
# Add new column type that defines what kind of campaign is it. A normal campaign, (1), RSS (2) or drip (3)
ALTER TABLE `campaigns` ADD COLUMN `type` tinyint(4) unsigned NOT NULL DEFAULT '1' AFTER `cid`;
CREATE INDEX type_index ON `campaigns` (`type`);

# Footer section
LOCK TABLES `settings` WRITE;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
UNLOCK TABLES;
