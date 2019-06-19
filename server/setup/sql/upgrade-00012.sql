# Header section
# Define incrementing schema version number
SET @schema_version = '12';

# Message source could include inlined images which might overflow on the default 65k field length
ALTER TABLE `campaigns` MODIFY `html` LONGTEXT;
ALTER TABLE `campaigns` MODIFY `html_prepared` LONGTEXT;
ALTER TABLE `campaigns` MODIFY `text` LONGTEXT;

ALTER TABLE `templates` MODIFY `html` LONGTEXT;
ALTER TABLE `templates` MODIFY `text` LONGTEXT;

# Footer section
LOCK TABLES `settings` WRITE;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
UNLOCK TABLES;
