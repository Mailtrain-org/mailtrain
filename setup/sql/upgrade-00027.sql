# Header section
# Define incrementing schema version number
SET @schema_version = '27';

# Create table to report templates
CREATE TABLE `report_templates` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT '',
  `mime_type` varchar(255) DEFAULT 'text/html' NOT NULL,
  `description` text,
  `user_fields` longtext,
  `js` longtext,
  `hbs` longtext,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

# Create table to store reports
CREATE TABLE `reports` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT '',
  `description` text,
  `report_template` int(11) unsigned NOT NULL,
  `params` longtext,
  `state`  int(11) unsigned NOT NULL DEFAULT 0,
  `last_run` DATETIME DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `report_template` (`report_template`),
  CONSTRAINT `report_template_ibfk_1` FOREIGN KEY (`report_template`) REFERENCES `report_templates` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


# Footer section
LOCK TABLES `settings` WRITE;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
UNLOCK TABLES;
