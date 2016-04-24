SET UNIQUE_CHECKS=0;
SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE `campaign` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `list` int(11) unsigned NOT NULL,
  `segment` int(11) unsigned NOT NULL,
  `subscription` int(11) unsigned NOT NULL,
  `status` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `response` varchar(255) DEFAULT NULL,
  `response_id` varchar(255) CHARACTER SET ascii DEFAULT NULL,
  `updated` timestamp NULL DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `list` (`list`,`segment`,`subscription`),
  KEY `created` (`created`),
  KEY `response_id` (`response_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `campaign_tracker` (
  `list` int(11) unsigned NOT NULL,
  `subscriber` int(11) unsigned NOT NULL,
  `link` int(11) NOT NULL,
  `ip` varchar(100) CHARACTER SET ascii DEFAULT NULL,
  `country` varchar(2) CHARACTER SET ascii DEFAULT NULL,
  `count` int(11) unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY (`list`,`subscriber`,`link`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `campaigns` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `cid` varchar(255) CHARACTER SET ascii NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT '',
  `description` text,
  `list` int(11) unsigned NOT NULL,
  `segment` int(11) unsigned DEFAULT NULL,
  `template` int(11) unsigned NOT NULL,
  `from` varchar(255) DEFAULT '',
  `address` varchar(255) DEFAULT '',
  `subject` varchar(255) DEFAULT '',
  `html` text,
  `text` text,
  `status` tinyint(4) unsigned NOT NULL DEFAULT '1',
  `status_change` timestamp NULL DEFAULT NULL,
  `delivered` int(11) unsigned NOT NULL DEFAULT '0',
  `opened` int(11) unsigned NOT NULL DEFAULT '0',
  `clicks` int(11) unsigned NOT NULL DEFAULT '0',
  `unsubscribed` int(11) unsigned NOT NULL DEFAULT '0',
  `bounced` int(1) unsigned NOT NULL DEFAULT '0',
  `complained` int(1) unsigned NOT NULL DEFAULT '0',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cid` (`cid`),
  KEY `name` (`name`(191)),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `confirmations` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `cid` varchar(255) CHARACTER SET ascii NOT NULL,
  `list` int(11) unsigned NOT NULL,
  `email` varchar(255) NOT NULL,
  `data` text NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cid` (`cid`),
  KEY `list` (`list`),
  CONSTRAINT `confirmations_ibfk_1` FOREIGN KEY (`list`) REFERENCES `lists` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `custom_fields` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `list` int(11) unsigned NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 DEFAULT '',
  `key` varchar(100) CHARACTER SET ascii NOT NULL,
  `default_value` varchar(255) CHARACTER SET utf8mb4 DEFAULT NULL,
  `type` varchar(255) CHARACTER SET ascii NOT NULL DEFAULT '',
  `group` int(11) unsigned DEFAULT NULL,
  `column` varchar(255) CHARACTER SET ascii DEFAULT NULL,
  `visible` tinyint(4) unsigned NOT NULL DEFAULT '1',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `list` (`list`,`column`),
  KEY `list_2` (`list`),
  CONSTRAINT `custom_fields_ibfk_1` FOREIGN KEY (`list`) REFERENCES `lists` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `importer` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `list` int(11) unsigned NOT NULL,
  `type` tinyint(4) unsigned NOT NULL DEFAULT '1',
  `path` varchar(255) NOT NULL DEFAULT '',
  `size` int(11) unsigned NOT NULL DEFAULT '0',
  `delimiter` varchar(1) CHARACTER SET ascii NOT NULL DEFAULT ',',
  `status` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `error` varchar(255) DEFAULT NULL,
  `processed` int(11) unsigned NOT NULL DEFAULT '0',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mapping` text CHARACTER SET utf8mb4 NOT NULL,
  `finished` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `list` (`list`),
  CONSTRAINT `importer_ibfk_1` FOREIGN KEY (`list`) REFERENCES `lists` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `links` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `cid` varchar(255) CHARACTER SET ascii NOT NULL DEFAULT '',
  `campaign` int(11) unsigned NOT NULL,
  `url` varchar(255) CHARACTER SET ascii NOT NULL DEFAULT '',
  `clicks` int(11) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `cid` (`cid`),
  UNIQUE KEY `campaign_2` (`campaign`,`url`),
  KEY `campaign` (`campaign`),
  CONSTRAINT `links_ibfk_1` FOREIGN KEY (`campaign`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `lists` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `cid` varchar(255) CHARACTER SET ascii NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT '',
  `description` text,
  `subscribers` int(11) unsigned DEFAULT '0',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cid` (`cid`),
  KEY `name` (`name`(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `segment_rules` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `segment` int(11) unsigned NOT NULL,
  `column` varchar(255) CHARACTER SET ascii NOT NULL DEFAULT '',
  `value` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `segment` (`segment`),
  CONSTRAINT `segment_rules_ibfk_1` FOREIGN KEY (`segment`) REFERENCES `segments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `segments` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `list` int(11) unsigned NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT '',
  `type` tinyint(4) unsigned NOT NULL,
  `created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `list` (`list`),
  KEY `name` (`name`),
  CONSTRAINT `segments_ibfk_1` FOREIGN KEY (`list`) REFERENCES `lists` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `settings` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) CHARACTER SET ascii NOT NULL DEFAULT '',
  `value` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4;

LOCK TABLES `settings` WRITE;
INSERT INTO `settings` VALUES (1,'smtp_hostname','localhost'),(2,'smtp_port','465'),(3,'smtp_encryption','TLS'),(4,'smtp_user','username'),(5,'smtp_pass','password'),(6,'service_url','http://localhost:3000/'),(7,'admin_email','admin@example.com'),(8,'smtp_max_connections','5'),(9,'smtp_max_messages','100'),(10,'smtp_log',''),(11,'default_sender','My Awesome Company'),(12,'default_postaddress','1234 Main Street'),(13,'default_from','My Awesome Company'),(14,'default_address','admin@example.com'),(15,'default_subject','Test message'),(16,'default_homepage','http://localhost:3000/');
UNLOCK TABLES;

CREATE TABLE `subscription` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `cid` varchar(255) CHARACTER SET ascii NOT NULL,
  `email` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `opt_in_ip` varchar(100) DEFAULT NULL,
  `opt_in_country` varchar(2) DEFAULT NULL,
  `imported` int(11) unsigned DEFAULT NULL,
  `status` tinyint(4) unsigned NOT NULL DEFAULT '1',
  `status_change` timestamp NULL DEFAULT NULL,
  `latest_open` timestamp NULL DEFAULT NULL,
  `latest_click` timestamp NULL DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `cid` (`cid`),
  KEY `status` (`status`),
  KEY `first_name` (`first_name`(191)),
  KEY `last_name` (`last_name`(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `templates` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '',
  `description` text,
  `html` text,
  `text` text,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `name` (`name`(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL DEFAULT '',
  `password` varchar(255) NOT NULL DEFAULT '',
  `email` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `reset_token` varchar(255) CHARACTER SET ascii DEFAULT NULL,
  `reset_expire` timestamp NULL DEFAULT NULL,
  `created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `username` (`username`(191)),
  KEY `reset` (`reset_token`),
  KEY `check_reset` (`username`(191),`reset_token`,`reset_expire`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;

LOCK TABLES `users` WRITE;
INSERT INTO `users` VALUES (1,'admin','$2a$10$mzKU71G62evnGB2PvQA4k..Wf9jASk.c7a8zRMHh6qQVjYJ2r/g/K','admin@example.com',NULL,NULL,NOW());
UNLOCK TABLES;

SET UNIQUE_CHECKS=1;
SET FOREIGN_KEY_CHECKS=1;
