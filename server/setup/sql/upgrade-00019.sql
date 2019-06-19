# Header section
# Define incrementing schema version number
SET @schema_version = '19';

CREATE TABLE `attachments` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `campaign` int(11) unsigned NOT NULL,
  `filename` varchar(255) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `content_type` varchar(100) CHARACTER SET ascii NOT NULL DEFAULT '',
  `content` longblob,
  `size` int(11) NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `campaign` (`campaign`),
  CONSTRAINT `attachments_ibfk_1` FOREIGN KEY (`campaign`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

# Footer section
LOCK TABLES `settings` WRITE;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
UNLOCK TABLES;
