# Header section
# Define incrementing schema version number
SET @schema_version = '33';

# Adds new column 'unsubscribe' to campaign table.
ALTER TABLE campaigns ADD COLUMN `unsubscribe` VARCHAR(255) NOT NULL DEFAULT '' AFTER `subject`;

# Footer section. Updates schema version in settings
LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;
