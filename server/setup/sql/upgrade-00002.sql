# Header section
# Define incrementing schema version number
SET @schema_version = '2';

# Adds new column 'failed' to importer table. Includes the count of failed addresses for an import
ALTER TABLE importer ADD COLUMN `failed` INT(11) UNSIGNED NOT NULL DEFAULT '0' AFTER `processed`;
ALTER TABLE importer ADD COLUMN `new` INT(11) UNSIGNED NOT NULL DEFAULT '0' AFTER `processed`;

# Footer section
LOCK TABLES `settings` WRITE;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
UNLOCK TABLES;
