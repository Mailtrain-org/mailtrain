# Header section
# Define incrementing schema version number
SET @schema_version = '22';

# Create table to store custom forms
CREATE TABLE `custom_forms` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `list` int(11) unsigned NOT NULL,
  `name` varchar(255) DEFAULT '',
  `description` text,
  `fields_shown_on_subscribe` varchar(255) DEFAULT '',
  `fields_shown_on_manage` varchar(255) DEFAULT '',
  `layout` longtext,
  `form_input_style` longtext,
  `mail_confirm_html` int(11) unsigned DEFAULT NULL,
  `mail_confirm_text` int(11) unsigned DEFAULT NULL,
  `mail_subscription_confirmed_html` int(11) unsigned DEFAULT NULL,
  `mail_subscription_confirmed_text` int(11) unsigned DEFAULT NULL,
  `mail_unsubscribe_confirmed_html` int(11) unsigned DEFAULT NULL,
  `mail_unsubscribe_confirmed_text` int(11) unsigned DEFAULT NULL,
  `web_confirm_notice` int(11) unsigned DEFAULT NULL,
  `web_manage_address` int(11) unsigned DEFAULT NULL,
  `web_manage` int(11) unsigned DEFAULT NULL,
  `web_subscribe` int(11) unsigned DEFAULT NULL,
  `web_subscribed` int(11) unsigned DEFAULT NULL,
  `web_unsubscribe_notice` int(11) unsigned DEFAULT NULL,
  `web_unsubscribe` int(11) unsigned DEFAULT NULL,
  `web_updated_notice` int(11) unsigned DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `list` (`list`),
  CONSTRAINT `custom_forms_ibfk_1` FOREIGN KEY (`list`) REFERENCES `lists` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

# Create table to store custom form data
CREATE TABLE `custom_forms_data` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `form` int(11) unsigned NOT NULL,
  `data_key` varchar(255) DEFAULT '',
  `data_value` longtext,
  PRIMARY KEY (`id`),
  KEY `form` (`form`),
  CONSTRAINT `custom_forms_data_ibfk_1` FOREIGN KEY (`form`) REFERENCES `custom_forms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

# Add default_form to lists
ALTER TABLE `lists` ADD COLUMN `default_form` int(11) unsigned DEFAULT NULL AFTER `cid`;

# Footer section
LOCK TABLES `settings` WRITE;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
UNLOCK TABLES;
