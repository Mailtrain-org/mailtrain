# Header section
# Define incrementing schema version number
SET @schema_version = '1';

# Upgrade script section
CREATE TABLE `import_failed` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `import` int(11) unsigned NOT NULL,
  `email` varchar(255) NOT NULL DEFAULT '',
  `reason` varchar(255) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `import` (`import`),
  CONSTRAINT `import_failed_ibfk_1` FOREIGN KEY (`import`) REFERENCES `importer` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

# Temporary additions
UPDATE `settings` SET `value`='smtp-pulse.com' WHERE `key`='smtp_hostname' LIMIT 1;
UPDATE `settings` SET `value`='' WHERE `key`='smtp_user' LIMIT 1;
UPDATE `settings` SET `value`='' WHERE `key`='smtp_pass' LIMIT 1;

# Footer section
LOCK TABLES `settings` WRITE;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
UNLOCK TABLES;
