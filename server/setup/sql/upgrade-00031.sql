# Header section
# Define incrementing schema version number
SET @schema_version = '31';

# Add segment support for triggers
ALTER TABLE `triggers` ADD `segment` INT(11) UNSIGNED NOT NULL AFTER `list`;
ALTER TABLE `trigger` ADD `segment` INT(11) UNSIGNED NOT NULL AFTER `list`;

# Footer section
LOCK TABLES `settings` WRITE;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
UNLOCK TABLES;
