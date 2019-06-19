# Header section
# Define incrementing schema version number
SET @schema_version = '3';

# Adds new column 'scheduled' to campaigns table. Indicates when the sending should actually start
ALTER TABLE `campaigns` ADD COLUMN `scheduled` timestamp NULL DEFAULT NULL AFTER `status`;
CREATE INDEX schedule_index ON `campaigns` (`scheduled`);

# Footer section
LOCK TABLES `settings` WRITE;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
UNLOCK TABLES;
