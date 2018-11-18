# Header section
# Define incrementing schema version number
SET @schema_version = '25';

# Create table to store global blacklist
CREATE TABLE `blacklist` (
  `email` varchar(191) NOT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

#Alter table campaigns
ALTER TABLE `campaigns` ADD COLUMN `blacklisted` int(11) unsigned NOT NULL DEFAULT '0' AFTER `delivered`;

# Footer section
LOCK TABLES `settings` WRITE;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
UNLOCK TABLES;
