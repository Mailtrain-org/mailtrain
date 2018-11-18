# Header section
# Define incrementing schema version number
SET @schema_version = '30';

# Upgrade script section
#### INSERT YOUR UPGRADE SCRIPT BELOW THIS LINE ######

ALTER TABLE `lists` ADD COLUMN `listunsubscribe_disabled` tinyint(4) unsigned DEFAULT 0 NOT NULL;

#### INSERT YOUR UPGRADE SCRIPT ABOVE THIS LINE ######

# Footer section. Updates schema version in settings
LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;
