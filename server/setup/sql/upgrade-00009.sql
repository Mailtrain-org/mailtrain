# Header section
# Define incrementing schema version number
SET @schema_version = '9';

# Adds a column for static access tokens to be used in API authentication
ALTER TABLE `users` ADD COLUMN `access_token` varchar(40) NULL DEFAULT NULL AFTER `email`;
CREATE INDEX token_index ON `users` (`access_token`);

# Footer section
LOCK TABLES `settings` WRITE;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
UNLOCK TABLES;
