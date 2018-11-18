# Header section
# Define incrementing schema version number
SET @schema_version = '32';

# Set default X-Mailer header value
LOCK TABLES `settings` WRITE;
INSERT INTO `settings` (`key`, `value`) VALUES ('x_mailer','Mailtrain Mailer (+https://mailtrain.org)') ON DUPLICATE KEY UPDATE `value`='Mailtrain Mailer (+https://mailtrain.org)';
UNLOCK TABLES;

# Footer section. Updates schema version in settings
LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;
