# Header section
# Define incrementing schema version number
SET @schema_version = '24';

# Add field 
ALTER TABLE `importer` ADD COLUMN `emailcheck` tinyint(4) unsigned DEFAULT 1 NOT NULL AFTER `delimiter`;

# Footer section
LOCK TABLES `settings` WRITE;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
UNLOCK TABLES;
