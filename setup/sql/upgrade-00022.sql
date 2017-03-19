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
  `layout` mediumtext,
  `form_input_style` mediumtext,
  `mail_confirm_html` text,
  `mail_confirm_text` text,
  `mail_subscription_confirmed_html` text,
  `mail_subscription_confirmed_text` text,
  `mail_unsubscribe_confirmed_html` text,
  `mail_unsubscribe_confirmed_text` text,
  `web_confirm_notice` text,
  `web_manage_address` text,
  `web_manage` text,
  `web_subscribe` text,
  `web_subscribed` text,
  `web_unsubscribe_notice` text,
  `web_unsubscribe` text,
  `web_updated_notice` text,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `list` (`list`),
  CONSTRAINT `custom_forms_ibfk_1` FOREIGN KEY (`list`) REFERENCES `lists` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4;

# Add default_form to lists
ALTER TABLE `lists` ADD COLUMN `default_form` int(11) unsigned DEFAULT NULL AFTER `cid`;

# Footer section
LOCK TABLES `settings` WRITE;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
UNLOCK TABLES;
