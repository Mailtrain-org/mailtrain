SET UNIQUE_CHECKS=0;
SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE `attachments` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `campaign` int(10) unsigned NOT NULL,
  `filename` varchar(255) CHARACTER SET utf8mb4 NOT NULL DEFAULT '',
  `content_type` varchar(100) CHARACTER SET ascii NOT NULL DEFAULT '',
  `content` longblob,
  `size` int(11) NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `campaign` (`campaign`),
  CONSTRAINT `attachments_ibfk_1` FOREIGN KEY (`campaign`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TABLE `blacklist` (
  `email` varchar(191) NOT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `campaign` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `list` int(10) unsigned NOT NULL,
  `segment` int(10) unsigned NOT NULL,
  `subscription` int(10) unsigned NOT NULL,
  `status` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `response` varchar(255) DEFAULT NULL,
  `response_id` varchar(255) CHARACTER SET ascii DEFAULT NULL,
  `updated` timestamp NULL DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `list` (`list`,`segment`,`subscription`),
  KEY `created` (`created`),
  KEY `response_id` (`response_id`),
  KEY `status_index` (`status`),
  KEY `subscription_index` (`subscription`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `campaign__1` (
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
  KEY `response_id` (`response_id`),
  KEY `status_index` (`status`),
  KEY `subscription_index` (`subscription`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `campaign_tracker` (
  `list` int(10) unsigned NOT NULL,
  `subscriber` int(10) unsigned NOT NULL,
  `link` int(11) NOT NULL,
  `ip` varchar(100) CHARACTER SET ascii DEFAULT NULL,
  `device_type` varchar(50) DEFAULT NULL,
  `country` varchar(2) CHARACTER SET ascii DEFAULT NULL,
  `count` int(11) unsigned NOT NULL DEFAULT '1',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`list`,`subscriber`,`link`),
  KEY `created_index` (`created`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `campaign_tracker__1` (
  `list` int(11) unsigned NOT NULL,
  `subscriber` int(11) unsigned NOT NULL,
  `link` int(11) NOT NULL,
  `ip` varchar(100) CHARACTER SET ascii DEFAULT NULL,
  `device_type` varchar(50) DEFAULT NULL,
  `country` varchar(2) CHARACTER SET ascii DEFAULT NULL,
  `count` int(11) unsigned NOT NULL DEFAULT '1',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`list`,`subscriber`,`link`),
  KEY `created_index` (`created`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `campaigns` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `cid` varchar(255) CHARACTER SET ascii NOT NULL,
  `type` tinyint(4) unsigned NOT NULL DEFAULT '1',
  `parent` int(10) unsigned DEFAULT NULL,
  `name` varchar(255) NOT NULL DEFAULT '',
  `description` text,
  `list` int(10) unsigned NOT NULL,
  `segment` int(10) unsigned DEFAULT NULL,
  `template` int(10) unsigned NOT NULL,
  `source_url` varchar(255) CHARACTER SET ascii DEFAULT NULL,
  `editor_name` varchar(50) DEFAULT '',
  `editor_data` longtext,
  `last_check` timestamp NULL DEFAULT NULL,
  `check_status` varchar(255) DEFAULT NULL,
  `from` varchar(255) DEFAULT '',
  `address` varchar(255) DEFAULT '',
  `reply_to` varchar(255) DEFAULT '',
  `subject` varchar(255) DEFAULT '',
  `html` longtext,
  `html_prepared` longtext,
  `text` longtext,
  `status` tinyint(4) unsigned NOT NULL DEFAULT '1',
  `scheduled` timestamp NULL DEFAULT NULL,
  `status_change` timestamp NULL DEFAULT NULL,
  `delivered` int(11) unsigned NOT NULL DEFAULT '0',
  `blacklisted` int(11) unsigned NOT NULL DEFAULT '0',
  `opened` int(11) unsigned NOT NULL DEFAULT '0',
  `clicks` int(11) unsigned NOT NULL DEFAULT '0',
  `unsubscribed` int(11) unsigned NOT NULL DEFAULT '0',
  `bounced` int(1) unsigned NOT NULL DEFAULT '0',
  `complained` int(1) unsigned NOT NULL DEFAULT '0',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `open_tracking_disabled` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `click_tracking_disabled` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `namespace` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cid` (`cid`),
  KEY `name` (`name`(191)),
  KEY `status` (`status`),
  KEY `schedule_index` (`scheduled`),
  KEY `type_index` (`type`),
  KEY `parent_index` (`parent`),
  KEY `check_index` (`last_check`),
  KEY `campaigns_namespace_foreign` (`namespace`),
  CONSTRAINT `campaigns_namespace_foreign` FOREIGN KEY (`namespace`) REFERENCES `namespaces` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;
INSERT INTO `campaigns` (`id`, `cid`, `type`, `parent`, `name`, `description`, `list`, `segment`, `template`, `source_url`, `editor_name`, `editor_data`, `last_check`, `check_status`, `from`, `address`, `reply_to`, `subject`, `html`, `html_prepared`, `text`, `status`, `scheduled`, `status_change`, `delivered`, `blacklisted`, `opened`, `clicks`, `unsubscribed`, `bounced`, `complained`, `created`, `open_tracking_disabled`, `click_tracking_disabled`, `namespace`) VALUES (1,'BkwHWgCWb',1,NULL,'Merge Tags','',1,0,0,'','codeeditor',NULL,NULL,NULL,'My Awesome Company','admin@example.com','','Test message','<style>dt { margin-top: 10px; }</style>\r\n<dl>\r\n    <dt>LINK_UNSUBSCRIBE</dt>\r\n    <dd id=\"LINK_UNSUBSCRIBE\">[LINK_UNSUBSCRIBE]</dd>\r\n    <dt>LINK_PREFERENCES</dt>\r\n    <dd id=\"LINK_PREFERENCES\">[LINK_PREFERENCES]</dd>\r\n    <dt>LINK_BROWSER</dt>\r\n    <dd id=\"LINK_BROWSER\">[LINK_BROWSER]</dd>\r\n    <dt>EMAIL</dt>\r\n    <dd id=\"EMAIL\">[EMAIL]</dd>\r\n    <dt>FIRST_NAME</dt>\r\n    <dd id=\"FIRST_NAME\">[FIRST_NAME]</dd>\r\n    <dt>LAST_NAME</dt>\r\n    <dd id=\"LAST_NAME\">[LAST_NAME]</dd>\r\n    <dt>FULL_NAME</dt>\r\n    <dd id=\"FULL_NAME\">[FULL_NAME]</dd>\r\n    <dt>SUBSCRIPTION_ID</dt>\r\n    <dd id=\"SUBSCRIPTION_ID\">[SUBSCRIPTION_ID]</dd>\r\n    <dt>LIST_ID</dt>\r\n    <dd id=\"LIST_ID\">[LIST_ID]</dd>\r\n    <dt>CAMPAIGN_ID</dt>\r\n    <dd id=\"CAMPAIGN_ID\">[CAMPAIGN_ID]</dd>\r\n    <dt>MERGE_TEXT</dt>\r\n    <dd id=\"MERGE_TEXT\">[MERGE_TEXT]</dd>\r\n    <dt>MERGE_NUMBER</dt>\r\n    <dd id=\"MERGE_NUMBER\">[MERGE_NUMBER]</dd>\r\n    <dt>MERGE_WEBSITE</dt>\r\n    <dd id=\"MERGE_WEBSITE\">[MERGE_WEBSITE]</dd>\r\n    <dt>MERGE_GPG_PUBLIC_KEY</dt>\r\n    <dd id=\"MERGE_GPG_PUBLIC_KEY\">[MERGE_GPG_PUBLIC_KEY/GPG Fallback Text]</dd>\r\n    <dt>MERGE_MULTILINE_TEXT</dt>\r\n    <dd id=\"MERGE_MULTILINE_TEXT\">[MERGE_MULTILINE_TEXT]</dd>\r\n    <dt>MERGE_JSON</dt>\r\n    <dd id=\"MERGE_JSON\">[MERGE_JSON]</dd>\r\n    <dt>MERGE_DATE_MMDDYYYY</dt>\r\n    <dd id=\"MERGE_DATE_MMDDYY\">[MERGE_DATE_MMDDYYYY]</dd>\r\n    <dt>MERGE_DATE_DDMMYYYY</dt>\r\n    <dd id=\"MERGE_DATE_DDMMYY\">[MERGE_DATE_DDMMYYYY]</dd>\r\n    <dt>MERGE_BIRTHDAY_MMDD</dt>\r\n    <dd id=\"MERGE_BIRTHDAY_MMDD\">[MERGE_BIRTHDAY_MMDD]</dd>\r\n    <dt>MERGE_BIRTHDAY_DDMM</dt>\r\n    <dd id=\"MERGE_BIRTHDAY_DDMM\">[MERGE_BIRTHDAY_DDMM]</dd>\r\n    <dt>MERGE_DROP_DOWNS</dt>\r\n    <dd id=\"MERGE_DROP_DOWNS\">[MERGE_DROP_DOWNS]</dd>\r\n    <dt>MERGE_CHECKBOXES</dt>\r\n    <dd id=\"MERGE_CHECKBOXES\">[MERGE_CHECKBOXES]</dd>\r\n</dl>','<!doctype html><html><head>\n<meta charset=\"utf-8\"></head><body><dl>\n    <dt style=\"margin-top: 10px;\">LINK_UNSUBSCRIBE</dt>\n    <dd id=\"LINK_UNSUBSCRIBE\">[LINK_UNSUBSCRIBE]</dd>\n    <dt style=\"margin-top: 10px;\">LINK_PREFERENCES</dt>\n    <dd id=\"LINK_PREFERENCES\">[LINK_PREFERENCES]</dd>\n    <dt style=\"margin-top: 10px;\">LINK_BROWSER</dt>\n    <dd id=\"LINK_BROWSER\">[LINK_BROWSER]</dd>\n    <dt style=\"margin-top: 10px;\">EMAIL</dt>\n    <dd id=\"EMAIL\">[EMAIL]</dd>\n    <dt style=\"margin-top: 10px;\">FIRST_NAME</dt>\n    <dd id=\"FIRST_NAME\">[FIRST_NAME]</dd>\n    <dt style=\"margin-top: 10px;\">LAST_NAME</dt>\n    <dd id=\"LAST_NAME\">[LAST_NAME]</dd>\n    <dt style=\"margin-top: 10px;\">FULL_NAME</dt>\n    <dd id=\"FULL_NAME\">[FULL_NAME]</dd>\n    <dt style=\"margin-top: 10px;\">SUBSCRIPTION_ID</dt>\n    <dd id=\"SUBSCRIPTION_ID\">[SUBSCRIPTION_ID]</dd>\n    <dt style=\"margin-top: 10px;\">LIST_ID</dt>\n    <dd id=\"LIST_ID\">[LIST_ID]</dd>\n    <dt style=\"margin-top: 10px;\">CAMPAIGN_ID</dt>\n    <dd id=\"CAMPAIGN_ID\">[CAMPAIGN_ID]</dd>\n    <dt style=\"margin-top: 10px;\">MERGE_TEXT</dt>\n    <dd id=\"MERGE_TEXT\">[MERGE_TEXT]</dd>\n    <dt style=\"margin-top: 10px;\">MERGE_NUMBER</dt>\n    <dd id=\"MERGE_NUMBER\">[MERGE_NUMBER]</dd>\n    <dt style=\"margin-top: 10px;\">MERGE_WEBSITE</dt>\n    <dd id=\"MERGE_WEBSITE\">[MERGE_WEBSITE]</dd>\n    <dt style=\"margin-top: 10px;\">MERGE_GPG_PUBLIC_KEY</dt>\n    <dd id=\"MERGE_GPG_PUBLIC_KEY\">[MERGE_GPG_PUBLIC_KEY/GPG Fallback Text]</dd>\n    <dt style=\"margin-top: 10px;\">MERGE_MULTILINE_TEXT</dt>\n    <dd id=\"MERGE_MULTILINE_TEXT\">[MERGE_MULTILINE_TEXT]</dd>\n    <dt style=\"margin-top: 10px;\">MERGE_JSON</dt>\n    <dd id=\"MERGE_JSON\">[MERGE_JSON]</dd>\n    <dt style=\"margin-top: 10px;\">MERGE_DATE_MMDDYYYY</dt>\n    <dd id=\"MERGE_DATE_MMDDYY\">[MERGE_DATE_MMDDYYYY]</dd>\n    <dt style=\"margin-top: 10px;\">MERGE_DATE_DDMMYYYY</dt>\n    <dd id=\"MERGE_DATE_DDMMYY\">[MERGE_DATE_DDMMYYYY]</dd>\n    <dt style=\"margin-top: 10px;\">MERGE_BIRTHDAY_MMDD</dt>\n    <dd id=\"MERGE_BIRTHDAY_MMDD\">[MERGE_BIRTHDAY_MMDD]</dd>\n    <dt style=\"margin-top: 10px;\">MERGE_BIRTHDAY_DDMM</dt>\n    <dd id=\"MERGE_BIRTHDAY_DDMM\">[MERGE_BIRTHDAY_DDMM]</dd>\n    <dt style=\"margin-top: 10px;\">MERGE_DROP_DOWNS</dt>\n    <dd id=\"MERGE_DROP_DOWNS\">[MERGE_DROP_DOWNS]</dd>\n    <dt style=\"margin-top: 10px;\">MERGE_CHECKBOXES</dt>\n    <dd id=\"MERGE_CHECKBOXES\">[MERGE_CHECKBOXES]</dd>\n</dl></body></html>','',1,NOW(),NULL,0,0,0,0,0,0,0,NOW(),0,0,1);
CREATE TABLE `confirmations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `cid` varchar(255) CHARACTER SET ascii NOT NULL,
  `list` int(10) unsigned NOT NULL,
  `action` varchar(100) NOT NULL,
  `ip` varchar(100) DEFAULT NULL,
  `data` text NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cid` (`cid`),
  KEY `list` (`list`),
  CONSTRAINT `confirmations_ibfk_1` FOREIGN KEY (`list`) REFERENCES `lists` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `custom_fields` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `list` int(10) unsigned NOT NULL,
  `name` varchar(255) DEFAULT '',
  `key` varchar(100) CHARACTER SET ascii NOT NULL,
  `default_value` varchar(255) DEFAULT NULL,
  `type` varchar(255) CHARACTER SET ascii NOT NULL DEFAULT '',
  `group` int(10) unsigned DEFAULT NULL,
  `column` varchar(255) CHARACTER SET ascii DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `order_subscribe` int(11) DEFAULT NULL,
  `order_manage` int(11) DEFAULT NULL,
  `order_list` int(11) DEFAULT NULL,
  `settings` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `list` (`list`,`column`),
  KEY `list_2` (`list`),
  CONSTRAINT `custom_fields_list_foreign` FOREIGN KEY (`list`) REFERENCES `lists` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4;
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (1,1,'Text','MERGE_TEXT',NULL,'text',NULL,'custom_text_field_byiiqjrw',NOW(),3,3,3,'{}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (2,1,'Number','MERGE_NUMBER',NULL,'number',NULL,'custom_number_field_r1dd91awb',NOW(),4,4,NULL,'{}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (3,1,'Website','MERGE_WEBSITE',NULL,'website',NULL,'custom_website_field_rkq991cw',NOW(),5,5,NULL,'{}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (4,1,'GPG Public Key','MERGE_GPG_PUBLIC_KEY',NULL,'gpg',NULL,'custom_gpg_public_key_ryvj51cz',NOW(),6,6,NULL,'{}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (5,1,'Multiline Text','MERGE_MULTILINE_TEXT',NULL,'longtext',NULL,'custom_multiline_text_bjbfojawb',NOW(),7,7,NULL,'{}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (6,1,'JSON','MERGE_JSON',NULL,'json',NULL,'custom_json_skqjkcb',NOW(),8,8,NULL,'{\"groupTemplate\":null}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (7,1,'Date (MM/DD/YYYY)','MERGE_DATE_MMDDYYYY',NULL,'date',NULL,'custom_date_mmddyy_rjkeojrzz',NOW(),9,9,NULL,'{\"dateFormat\":\"us\"}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (8,1,'Date (DD/MM/YYYY)','MERGE_DATE_DDMMYYYY',NULL,'date',NULL,'custom_date_ddmmyy_ryedsk0wz',NOW(),10,10,NULL,'{\"dateFormat\":\"eur\"}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (9,1,'Birthday (MM/DD)','MERGE_BIRTHDAY_MMDD',NULL,'birthday',NULL,'custom_birthday_mmdd_h18coj0zz',NOW(),11,11,NULL,'{\"dateFormat\":\"us\"}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (10,1,'Birthday (DD/MM)','MERGE_BIRTHDAY_DDMM',NULL,'birthday',NULL,'custom_birthday_ddmm_r1g3s1czz',NOW(),12,12,NULL,'{\"dateFormat\":\"eur\"}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (11,1,'Drop Downs','MERGE_DROP_DOWNS',NULL,'dropdown-grouped',NULL,NULL,NOW(),13,13,NULL,'{\"groupTemplate\":null}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (12,1,'Drop Down Opt 1','MERGE_DROP_DOWN_OPT_1',NULL,'option',11,'custom_dd_option_1_b1wwn1rzw',NOW(),NULL,NULL,NULL,'{}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (13,1,'Drop Down Opt 2','MERGE_DROP_DOWN_OPT_2',NULL,'option',11,'custom_drop_down_opt_2_hkzd2jcww',NOW(),NULL,NULL,NULL,'{}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (14,1,'Drop Down Opt 3','MERGE_DROP_DOWN_OPT_3',NULL,'option',11,'custom_drop_down_opt_3_rjghnyrz',NOW(),NULL,NULL,NULL,'{}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (15,1,'Checkboxes','MERGE_CHECKBOXES',NULL,'checkbox-grouped',NULL,NULL,NOW(),14,14,NULL,'{\"groupTemplate\":null}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (16,1,'Checkbox Option 1','MERGE_CHECKBOX_OPTION_1',NULL,'option',15,'custom_checkbox_option_1_by_l0jcwz',NOW(),NULL,NULL,NULL,'{}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (17,1,'Checkbox Option 2','MERGE_CHECKBOX_OPTION_2',NULL,'option',15,'custom_checkbox_option_2_sjdprj0zz',NOW(),NULL,NULL,NULL,'{}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (18,1,'Checkbox Option 3','MERGE_CHECKBOX_OPTION_3',NULL,'option',15,'custom_checkbox_option_3_bk2drjabz',NOW(),NULL,NULL,NULL,'{}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (20,1,'First Name','FIRST_NAME',NULL,'text',NULL,'first_name',NOW(),1,1,1,'{}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (21,1,'Last Name','LAST_NAME',NULL,'text',NULL,'last_name',NOW(),2,2,2,'{}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (22,2,'First Name','FIRST_NAME',NULL,'text',NULL,'first_name',NOW(),0,0,0,'{}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (23,2,'Last Name','LAST_NAME',NULL,'text',NULL,'last_name',NOW(),1,1,1,'{}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (24,3,'First Name','FIRST_NAME',NULL,'text',NULL,'first_name',NOW(),0,0,0,'{}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (25,3,'Last Name','LAST_NAME',NULL,'text',NULL,'last_name',NOW(),1,1,1,'{}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (26,4,'First Name','FIRST_NAME',NULL,'text',NULL,'first_name',NOW(),0,0,0,'{}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (27,4,'Last Name','LAST_NAME',NULL,'text',NULL,'last_name',NOW(),1,1,1,'{}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (28,5,'First Name','FIRST_NAME',NULL,'text',NULL,'first_name',NOW(),0,0,0,'{}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (29,5,'Last Name','LAST_NAME',NULL,'text',NULL,'last_name',NOW(),1,1,1,'{}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (30,6,'First Name','FIRST_NAME',NULL,'text',NULL,'first_name',NOW(),0,0,0,'{}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (31,6,'Last Name','LAST_NAME',NULL,'text',NULL,'last_name',NOW(),1,1,1,'{}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (33,1,'Radios','MERGE_RADIOS',NULL,'radio-grouped',NULL,NULL,NOW(),15,15,NULL,'{\"renderTemplate\":\"\"}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (34,1,'Radio Opt 1','MERGE_RADIO_OPT_1',NULL,'option',33,'custom_radio_opt_1_skbbynihz',NOW(),NULL,NULL,NULL,'{}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (35,1,'Radio Opt 2','MERGE_RADIO_OPT_2',NULL,'option',33,'custom_radio_opt_2_rygfy2ibm',NOW(),NULL,NULL,NULL,'{}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (36,1,'Radio Opt 3','MERGE_RADIO_OPT_3',NULL,'option',33,'custom_radio_opt_3_h1ofynobg',NOW(),NULL,NULL,NULL,'{}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (37,1,'Dropdown Enum','MERGE_DROPDOWN_ENUM',NULL,'dropdown-enum',NULL,'custom_dropdown_enum_rk59y2ibm',NOW(),16,16,NULL,'{\"options\":[{\"key\":\"au\",\"label\":\"Australia\"},{\"key\":\"at\",\"label\":\"Austria\"}],\"renderTemplate\":\"\"}');
INSERT INTO `custom_fields` (`id`, `list`, `name`, `key`, `default_value`, `type`, `group`, `column`, `created`, `order_subscribe`, `order_manage`, `order_list`, `settings`) VALUES (38,1,'Radios Enum','MERGE_RADIOS_ENUM',NULL,'radio-enum',NULL,'custom_radios_enum_b1n3knobf',NOW(),17,17,NULL,'{\"options\":[{\"key\":\"au\",\"label\":\"Australia\"},{\"key\":\"at\",\"label\":\"Austria\"}],\"renderTemplate\":\"\"}');
CREATE TABLE `custom_forms` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT '',
  `description` text,
  `layout` longtext,
  `form_input_style` longtext,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `namespace` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `custom_forms_namespace_foreign` (`namespace`),
  CONSTRAINT `custom_forms_namespace_foreign` FOREIGN KEY (`namespace`) REFERENCES `namespaces` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `custom_forms_data` (
  `form` int(10) unsigned NOT NULL,
  `data_key` varchar(128) NOT NULL DEFAULT '',
  `data_value` longtext,
  PRIMARY KEY (`form`,`data_key`),
  KEY `form` (`form`),
  CONSTRAINT `custom_forms_data_ibfk_1` FOREIGN KEY (`form`) REFERENCES `custom_forms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `generated_role_names` (
  `entity_type` varchar(32) NOT NULL,
  `role` varchar(128) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`entity_type`,`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO `generated_role_names` (`entity_type`, `role`, `name`, `description`) VALUES ('campaign','editor','Editor','XXX');
INSERT INTO `generated_role_names` (`entity_type`, `role`, `name`, `description`) VALUES ('campaign','master','Master','All permissions');
INSERT INTO `generated_role_names` (`entity_type`, `role`, `name`, `description`) VALUES ('customForm','editor','Editor','All permissions');
INSERT INTO `generated_role_names` (`entity_type`, `role`, `name`, `description`) VALUES ('customForm','master','Master','All permissions');
INSERT INTO `generated_role_names` (`entity_type`, `role`, `name`, `description`) VALUES ('global','editor','Editor','XXX');
INSERT INTO `generated_role_names` (`entity_type`, `role`, `name`, `description`) VALUES ('global','master','Master','All permissions');
INSERT INTO `generated_role_names` (`entity_type`, `role`, `name`, `description`) VALUES ('list','editor','Editor','XXX');
INSERT INTO `generated_role_names` (`entity_type`, `role`, `name`, `description`) VALUES ('list','master','Master','All permissions');
INSERT INTO `generated_role_names` (`entity_type`, `role`, `name`, `description`) VALUES ('namespace','editor','Editor','XXX');
INSERT INTO `generated_role_names` (`entity_type`, `role`, `name`, `description`) VALUES ('namespace','master','Master','All permissions');
INSERT INTO `generated_role_names` (`entity_type`, `role`, `name`, `description`) VALUES ('report','editor','Editor','XXX');
INSERT INTO `generated_role_names` (`entity_type`, `role`, `name`, `description`) VALUES ('report','master','Master','All permissions');
INSERT INTO `generated_role_names` (`entity_type`, `role`, `name`, `description`) VALUES ('reportTemplate','editor','Editor','XXX');
INSERT INTO `generated_role_names` (`entity_type`, `role`, `name`, `description`) VALUES ('reportTemplate','master','Master','All permissions');
INSERT INTO `generated_role_names` (`entity_type`, `role`, `name`, `description`) VALUES ('template','editor','Editor','XXX');
INSERT INTO `generated_role_names` (`entity_type`, `role`, `name`, `description`) VALUES ('template','master','Master','All permissions');
CREATE TABLE `import_failed` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `import` int(10) unsigned NOT NULL,
  `email` varchar(255) NOT NULL DEFAULT '',
  `reason` varchar(255) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `import` (`import`),
  CONSTRAINT `import_failed_ibfk_1` FOREIGN KEY (`import`) REFERENCES `importer` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `importer` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `list` int(10) unsigned NOT NULL,
  `type` tinyint(4) unsigned NOT NULL DEFAULT '1',
  `path` varchar(255) NOT NULL DEFAULT '',
  `size` int(11) unsigned NOT NULL DEFAULT '0',
  `delimiter` varchar(1) CHARACTER SET ascii NOT NULL DEFAULT ',',
  `emailcheck` tinyint(4) unsigned NOT NULL DEFAULT '1',
  `status` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `error` varchar(255) DEFAULT NULL,
  `processed` int(11) unsigned NOT NULL DEFAULT '0',
  `new` int(11) unsigned NOT NULL DEFAULT '0',
  `failed` int(11) unsigned NOT NULL DEFAULT '0',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mapping` text NOT NULL,
  `finished` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `list` (`list`),
  CONSTRAINT `importer_ibfk_1` FOREIGN KEY (`list`) REFERENCES `lists` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `knex_migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `batch` int(11) DEFAULT NULL,
  `migration_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4;
INSERT INTO `knex_migrations` (`id`, `name`, `batch`, `migration_time`) VALUES (1,'20170506102634_base.js',1,NOW());
INSERT INTO `knex_migrations` (`id`, `name`, `batch`, `migration_time`) VALUES (2,'20170507083345_create_namespaces.js',1,NOW());
INSERT INTO `knex_migrations` (`id`, `name`, `batch`, `migration_time`) VALUES (3,'20170507084114_create_permissions.js',1,NOW());
INSERT INTO `knex_migrations` (`id`, `name`, `batch`, `migration_time`) VALUES (4,'20170617123450_create_user_name.js',1,NOW());
INSERT INTO `knex_migrations` (`id`, `name`, `batch`, `migration_time`) VALUES (5,'20170726155118_create_user_role.js',1,NOW());
INSERT INTO `knex_migrations` (`id`, `name`, `batch`, `migration_time`) VALUES (6,'20170728220422_drop_id_in_custom_forms_data.js',1,NOW());
INSERT INTO `knex_migrations` (`id`, `name`, `batch`, `migration_time`) VALUES (7,'20170729160135_make_custom_forms_independent_of_list.js',1,NOW());
INSERT INTO `knex_migrations` (`id`, `name`, `batch`, `migration_time`) VALUES (8,'20170729160422_move_form_field_order_to_custom_fields_and_make_all_fields_configurable.js',1,NOW());
INSERT INTO `knex_migrations` (`id`, `name`, `batch`, `migration_time`) VALUES (9,'20170731072050_upgrade_custom_fields.js',1,NOW());
INSERT INTO `knex_migrations` (`id`, `name`, `batch`, `migration_time`) VALUES (10,'20170814174051_upgrade_segments.js',1,NOW());
INSERT INTO `knex_migrations` (`id`, `name`, `batch`, `migration_time`) VALUES (11,'20170814180643_remove_cascading_delete_in_reports.js',1,NOW());
INSERT INTO `knex_migrations` (`id`, `name`, `batch`, `migration_time`) VALUES (12,'20171230134232_convert_settings_to_camel_case.js',1,NOW());
INSERT INTO `knex_migrations` (`id`, `name`, `batch`, `migration_time`) VALUES (13,'20171230172244_delete_schema_version.js',1,NOW());
CREATE TABLE `knex_migrations_lock` (
  `is_locked` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO `knex_migrations_lock` (`is_locked`) VALUES (0);
CREATE TABLE `links` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `cid` varchar(255) CHARACTER SET ascii NOT NULL DEFAULT '',
  `campaign` int(10) unsigned NOT NULL,
  `url` varchar(255) CHARACTER SET ascii NOT NULL DEFAULT '',
  `clicks` int(11) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `cid` (`cid`),
  UNIQUE KEY `campaign_2` (`campaign`,`url`),
  KEY `campaign` (`campaign`),
  CONSTRAINT `links_ibfk_1` FOREIGN KEY (`campaign`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `lists` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `cid` varchar(255) CHARACTER SET ascii NOT NULL,
  `default_form` int(11) unsigned DEFAULT NULL,
  `name` varchar(255) NOT NULL DEFAULT '',
  `description` text,
  `subscribers` int(11) unsigned DEFAULT '0',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `public_subscribe` tinyint(1) unsigned NOT NULL DEFAULT '1',
  `unsubscription_mode` int(11) unsigned NOT NULL DEFAULT '0',
  `namespace` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cid` (`cid`),
  KEY `name` (`name`(191)),
  KEY `lists_namespace_foreign` (`namespace`),
  CONSTRAINT `lists_namespace_foreign` FOREIGN KEY (`namespace`) REFERENCES `namespaces` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4;
INSERT INTO `lists` (`id`, `cid`, `default_form`, `name`, `description`, `subscribers`, `created`, `public_subscribe`, `unsubscription_mode`, `namespace`) VALUES (1,'Hkj1vCoJb',NULL,'#1 (one-step, no form)','',1,NOW(),1,0,1);
INSERT INTO `lists` (`id`, `cid`, `default_form`, `name`, `description`, `subscribers`, `created`, `public_subscribe`, `unsubscription_mode`, `namespace`) VALUES (2,'SktV4HDZ-',NULL,'#2 (one-step, with form)','',0,NOW(),1,1,1);
INSERT INTO `lists` (`id`, `cid`, `default_form`, `name`, `description`, `subscribers`, `created`, `public_subscribe`, `unsubscription_mode`, `namespace`) VALUES (3,'BkdvNBw-W',NULL,'#3 (two-step, no form)','',0,NOW(),1,2,1);
INSERT INTO `lists` (`id`, `cid`, `default_form`, `name`, `description`, `subscribers`, `created`, `public_subscribe`, `unsubscription_mode`, `namespace`) VALUES (4,'rJMKVrDZ-',NULL,'#4 (two-step, with form)','',0,NOW(),1,3,1);
INSERT INTO `lists` (`id`, `cid`, `default_form`, `name`, `description`, `subscribers`, `created`, `public_subscribe`, `unsubscription_mode`, `namespace`) VALUES (5,'SJgoNSw-W',NULL,'#5 (manual unsubscribe)','',0,NOW(),1,4,1);
INSERT INTO `lists` (`id`, `cid`, `default_form`, `name`, `description`, `subscribers`, `created`, `public_subscribe`, `unsubscription_mode`, `namespace`) VALUES (6,'HyveEPvWW',NULL,'#6 (non-public)','',0,NOW(),0,0,1);
CREATE TABLE `namespaces` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `description` text,
  `namespace` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `namespaces_namespace_foreign` (`namespace`),
  CONSTRAINT `namespaces_namespace_foreign` FOREIGN KEY (`namespace`) REFERENCES `namespaces` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;
INSERT INTO `namespaces` (`id`, `name`, `description`, `namespace`) VALUES (1,'Root','Root namespace',NULL);
CREATE TABLE `permissions_campaign` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `operation` varchar(128) NOT NULL,
  PRIMARY KEY (`entity`,`user`,`operation`),
  KEY `permissions_campaign_user_foreign` (`user`),
  CONSTRAINT `permissions_campaign_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE,
  CONSTRAINT `permissions_campaign_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO `permissions_campaign` (`entity`, `user`, `operation`) VALUES (1,1,'delete');
INSERT INTO `permissions_campaign` (`entity`, `user`, `operation`) VALUES (1,1,'edit');
INSERT INTO `permissions_campaign` (`entity`, `user`, `operation`) VALUES (1,1,'share');
INSERT INTO `permissions_campaign` (`entity`, `user`, `operation`) VALUES (1,1,'view');
CREATE TABLE `permissions_custom_form` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `operation` varchar(128) NOT NULL,
  PRIMARY KEY (`entity`,`user`,`operation`),
  KEY `permissions_custom_form_user_foreign` (`user`),
  CONSTRAINT `permissions_custom_form_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `custom_forms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `permissions_custom_form_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `permissions_list` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `operation` varchar(128) NOT NULL,
  PRIMARY KEY (`entity`,`user`,`operation`),
  KEY `permissions_list_user_foreign` (`user`),
  CONSTRAINT `permissions_list_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `lists` (`id`) ON DELETE CASCADE,
  CONSTRAINT `permissions_list_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (1,1,'delete');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (1,1,'edit');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (1,1,'manageFields');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (1,1,'manageSegments');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (1,1,'manageSubscriptions');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (1,1,'share');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (1,1,'view');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (1,1,'viewSubscriptions');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (2,1,'delete');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (2,1,'edit');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (2,1,'manageFields');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (2,1,'manageSegments');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (2,1,'manageSubscriptions');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (2,1,'share');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (2,1,'view');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (2,1,'viewSubscriptions');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (3,1,'delete');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (3,1,'edit');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (3,1,'manageFields');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (3,1,'manageSegments');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (3,1,'manageSubscriptions');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (3,1,'share');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (3,1,'view');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (3,1,'viewSubscriptions');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (4,1,'delete');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (4,1,'edit');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (4,1,'manageFields');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (4,1,'manageSegments');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (4,1,'manageSubscriptions');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (4,1,'share');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (4,1,'view');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (4,1,'viewSubscriptions');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (5,1,'delete');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (5,1,'edit');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (5,1,'manageFields');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (5,1,'manageSegments');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (5,1,'manageSubscriptions');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (5,1,'share');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (5,1,'view');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (5,1,'viewSubscriptions');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (6,1,'delete');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (6,1,'edit');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (6,1,'manageFields');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (6,1,'manageSegments');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (6,1,'manageSubscriptions');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (6,1,'share');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (6,1,'view');
INSERT INTO `permissions_list` (`entity`, `user`, `operation`) VALUES (6,1,'viewSubscriptions');
CREATE TABLE `permissions_namespace` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `operation` varchar(128) NOT NULL,
  PRIMARY KEY (`entity`,`user`,`operation`),
  KEY `permissions_namespace_user_foreign` (`user`),
  CONSTRAINT `permissions_namespace_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `namespaces` (`id`) ON DELETE CASCADE,
  CONSTRAINT `permissions_namespace_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO `permissions_namespace` (`entity`, `user`, `operation`) VALUES (1,1,'createCustomForm');
INSERT INTO `permissions_namespace` (`entity`, `user`, `operation`) VALUES (1,1,'createList');
INSERT INTO `permissions_namespace` (`entity`, `user`, `operation`) VALUES (1,1,'createNamespace');
INSERT INTO `permissions_namespace` (`entity`, `user`, `operation`) VALUES (1,1,'createReport');
INSERT INTO `permissions_namespace` (`entity`, `user`, `operation`) VALUES (1,1,'createReportTemplate');
INSERT INTO `permissions_namespace` (`entity`, `user`, `operation`) VALUES (1,1,'delete');
INSERT INTO `permissions_namespace` (`entity`, `user`, `operation`) VALUES (1,1,'edit');
INSERT INTO `permissions_namespace` (`entity`, `user`, `operation`) VALUES (1,1,'manageUsers');
INSERT INTO `permissions_namespace` (`entity`, `user`, `operation`) VALUES (1,1,'share');
INSERT INTO `permissions_namespace` (`entity`, `user`, `operation`) VALUES (1,1,'view');
CREATE TABLE `permissions_report` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `operation` varchar(128) NOT NULL,
  PRIMARY KEY (`entity`,`user`,`operation`),
  KEY `permissions_report_user_foreign` (`user`),
  CONSTRAINT `permissions_report_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `reports` (`id`) ON DELETE CASCADE,
  CONSTRAINT `permissions_report_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `permissions_report_template` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `operation` varchar(128) NOT NULL,
  PRIMARY KEY (`entity`,`user`,`operation`),
  KEY `permissions_report_template_user_foreign` (`user`),
  CONSTRAINT `permissions_report_template_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `report_templates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `permissions_report_template_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `permissions_template` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `operation` varchar(128) NOT NULL,
  PRIMARY KEY (`entity`,`user`,`operation`),
  KEY `permissions_template_user_foreign` (`user`),
  CONSTRAINT `permissions_template_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `templates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `permissions_template_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `queued` (
  `campaign` int(10) unsigned NOT NULL,
  `list` int(10) unsigned NOT NULL,
  `subscriber` int(10) unsigned NOT NULL,
  `source` varchar(255) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`campaign`,`list`,`subscriber`),
  KEY `created` (`created`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TABLE `report_templates` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT '',
  `mime_type` varchar(255) NOT NULL DEFAULT 'text/html',
  `description` text,
  `user_fields` longtext,
  `js` longtext,
  `hbs` longtext,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `namespace` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `report_templates_namespace_foreign` (`namespace`),
  CONSTRAINT `report_templates_namespace_foreign` FOREIGN KEY (`namespace`) REFERENCES `namespaces` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `reports` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT '',
  `description` text,
  `report_template` int(10) unsigned NOT NULL,
  `params` longtext,
  `state` int(11) unsigned NOT NULL DEFAULT '0',
  `last_run` datetime DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `namespace` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `report_template` (`report_template`),
  KEY `reports_namespace_foreign` (`namespace`),
  CONSTRAINT `reports_namespace_foreign` FOREIGN KEY (`namespace`) REFERENCES `namespaces` (`id`),
  CONSTRAINT `reports_report_template_foreign` FOREIGN KEY (`report_template`) REFERENCES `report_templates` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `rss` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `parent` int(10) unsigned NOT NULL,
  `guid` varchar(255) NOT NULL DEFAULT '',
  `pubdate` timestamp NULL DEFAULT NULL,
  `campaign` int(10) unsigned DEFAULT NULL,
  `found` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `parent_2` (`parent`,`guid`),
  KEY `parent` (`parent`),
  CONSTRAINT `rss_ibfk_1` FOREIGN KEY (`parent`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TABLE `segments` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `list` int(10) unsigned NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT '',
  `created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `settings` text,
  PRIMARY KEY (`id`),
  KEY `list` (`list`),
  KEY `name` (`name`(191)),
  CONSTRAINT `segments_list_foreign` FOREIGN KEY (`list`) REFERENCES `lists` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `settings` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) CHARACTER SET ascii NOT NULL DEFAULT '',
  `value` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=148 DEFAULT CHARSET=utf8mb4;
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (1,'smtpHostname','localhost');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (2,'smtpPort','5587');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (3,'smtpEncryption','NONE');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (4,'smtpUser','testuser');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (5,'smtpPass','testpass');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (6,'serviceUrl','http://localhost:3000/');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (7,'adminEmail','keep.admin@mailtrain.org');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (8,'smtpMaxConnections','5');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (9,'smtpMaxMessages','100');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (10,'smtpLog','');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (11,'defaultSender','My Awesome Company');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (12,'defaultPostaddress','1234 Main Street');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (13,'defaultFrom','My Awesome Company');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (14,'defaultAddress','keep.admin@mailtrain.org');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (15,'defaultSubject','Test message');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (16,'defaultHomepage','https://mailtrain.org');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (46,'uaCode','');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (47,'shoutout','');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (54,'mailTransport','smtp');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (60,'sesKey','');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (61,'sesSecret','');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (62,'sesRegion','us-east-1');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (65,'smtpThrottling','');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (66,'pgpPassphrase','');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (67,'pgpPrivateKey','');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (68,'dkimApiKey','');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (69,'dkimDomain','');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (70,'dkimSelector','');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (71,'dkimPrivateKey','');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (73,'smtpSelfSigned','');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (74,'smtpDisableAuth','');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (75,'verpUse','');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (76,'disableWysiwyg','');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (77,'disableConfirmations','');
CREATE TABLE `shares_campaign` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `role` varchar(128) NOT NULL,
  `auto` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`entity`,`user`),
  KEY `shares_campaign_user_foreign` (`user`),
  CONSTRAINT `shares_campaign_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shares_campaign_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `shares_custom_form` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `role` varchar(128) NOT NULL,
  `auto` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`entity`,`user`),
  KEY `shares_custom_form_user_foreign` (`user`),
  CONSTRAINT `shares_custom_form_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `custom_forms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shares_custom_form_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `shares_list` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `role` varchar(128) NOT NULL,
  `auto` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`entity`,`user`),
  KEY `shares_list_user_foreign` (`user`),
  CONSTRAINT `shares_list_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `lists` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shares_list_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `shares_namespace` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `role` varchar(128) NOT NULL,
  `auto` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`entity`,`user`),
  KEY `shares_namespace_user_foreign` (`user`),
  CONSTRAINT `shares_namespace_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `namespaces` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shares_namespace_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO `shares_namespace` (`entity`, `user`, `role`, `auto`) VALUES (1,1,'master',1);
CREATE TABLE `shares_report` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `role` varchar(128) NOT NULL,
  `auto` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`entity`,`user`),
  KEY `shares_report_user_foreign` (`user`),
  CONSTRAINT `shares_report_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `reports` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shares_report_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `shares_report_template` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `role` varchar(128) NOT NULL,
  `auto` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`entity`,`user`),
  KEY `shares_report_template_user_foreign` (`user`),
  CONSTRAINT `shares_report_template_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `report_templates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shares_report_template_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `shares_template` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `role` varchar(128) NOT NULL,
  `auto` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`entity`,`user`),
  KEY `shares_template_user_foreign` (`user`),
  CONSTRAINT `shares_template_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `templates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shares_template_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `subscription` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `cid` varchar(255) CHARACTER SET ascii NOT NULL,
  `email` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `opt_in_ip` varchar(100) DEFAULT NULL,
  `opt_in_country` varchar(2) DEFAULT NULL,
  `tz` varchar(100) CHARACTER SET ascii DEFAULT NULL,
  `imported` int(11) unsigned DEFAULT NULL,
  `status` tinyint(4) unsigned NOT NULL DEFAULT '1',
  `is_test` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `status_change` timestamp NULL DEFAULT NULL,
  `latest_open` timestamp NULL DEFAULT NULL,
  `latest_click` timestamp NULL DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `cid` (`cid`),
  KEY `status` (`status`),
  KEY `subscriber_tz` (`tz`),
  KEY `is_test` (`is_test`),
  KEY `latest_open` (`latest_open`),
  KEY `latest_click` (`latest_click`),
  KEY `created` (`created`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `subscription__1` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `cid` varchar(255) CHARACTER SET ascii NOT NULL,
  `email` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `opt_in_ip` varchar(100) DEFAULT NULL,
  `opt_in_country` varchar(2) DEFAULT NULL,
  `tz` varchar(100) CHARACTER SET ascii DEFAULT NULL,
  `imported` int(11) unsigned DEFAULT NULL,
  `status` tinyint(4) unsigned NOT NULL DEFAULT '1',
  `is_test` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `status_change` timestamp NULL DEFAULT NULL,
  `latest_open` timestamp NULL DEFAULT NULL,
  `latest_click` timestamp NULL DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `custom_text_field_byiiqjrw` varchar(255) DEFAULT NULL,
  `custom_number_field_r1dd91awb` int(11) DEFAULT NULL,
  `custom_website_field_rkq991cw` varchar(255) DEFAULT NULL,
  `custom_gpg_public_key_ryvj51cz` text,
  `custom_multiline_text_bjbfojawb` text,
  `custom_json_skqjkcb` text,
  `custom_date_mmddyy_rjkeojrzz` timestamp NULL DEFAULT NULL,
  `custom_date_ddmmyy_ryedsk0wz` timestamp NULL DEFAULT NULL,
  `custom_birthday_mmdd_h18coj0zz` timestamp NULL DEFAULT NULL,
  `custom_birthday_ddmm_r1g3s1czz` timestamp NULL DEFAULT NULL,
  `custom_dd_option_1_b1wwn1rzw` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `custom_drop_down_opt_2_hkzd2jcww` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `custom_drop_down_opt_3_rjghnyrz` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `custom_checkbox_option_1_by_l0jcwz` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `custom_checkbox_option_2_sjdprj0zz` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `custom_checkbox_option_3_bk2drjabz` tinyint(4) unsigned NOT NULL DEFAULT '0',
  `custom_radio_opt_1_skbbynihz` tinyint(1) DEFAULT NULL,
  `custom_radio_opt_2_rygfy2ibm` tinyint(1) DEFAULT NULL,
  `custom_radio_opt_3_h1ofynobg` tinyint(1) DEFAULT NULL,
  `custom_dropdown_enum_rk59y2ibm` varchar(255) DEFAULT NULL,
  `custom_radios_enum_b1n3knobf` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `cid` (`cid`),
  KEY `status` (`status`),
  KEY `first_name` (`first_name`(191)),
  KEY `last_name` (`last_name`(191)),
  KEY `subscriber_tz` (`tz`),
  KEY `is_test` (`is_test`),
  KEY `latest_open` (`latest_open`),
  KEY `latest_click` (`latest_click`),
  KEY `created` (`created`),
  KEY `subscription__1_custom_radio_opt_1_skbbynihz_index` (`custom_radio_opt_1_skbbynihz`),
  KEY `subscription__1_custom_radio_opt_2_rygfy2ibm_index` (`custom_radio_opt_2_rygfy2ibm`),
  KEY `subscription__1_custom_radio_opt_3_h1ofynobg_index` (`custom_radio_opt_3_h1ofynobg`),
  KEY `subscription__1_custom_dropdown_enum_rk59y2ibm_index` (`custom_dropdown_enum_rk59y2ibm`(191)),
  KEY `subscription__1_custom_radios_enum_b1n3knobf_index` (`custom_radios_enum_b1n3knobf`(191))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;
INSERT INTO `subscription__1` (`id`, `cid`, `email`, `opt_in_ip`, `opt_in_country`, `tz`, `imported`, `status`, `is_test`, `status_change`, `latest_open`, `latest_click`, `created`, `first_name`, `last_name`, `custom_text_field_byiiqjrw`, `custom_number_field_r1dd91awb`, `custom_website_field_rkq991cw`, `custom_gpg_public_key_ryvj51cz`, `custom_multiline_text_bjbfojawb`, `custom_json_skqjkcb`, `custom_date_mmddyy_rjkeojrzz`, `custom_date_ddmmyy_ryedsk0wz`, `custom_birthday_mmdd_h18coj0zz`, `custom_birthday_ddmm_r1g3s1czz`, `custom_dd_option_1_b1wwn1rzw`, `custom_drop_down_opt_2_hkzd2jcww`, `custom_drop_down_opt_3_rjghnyrz`, `custom_checkbox_option_1_by_l0jcwz`, `custom_checkbox_option_2_sjdprj0zz`, `custom_checkbox_option_3_bk2drjabz`, `custom_radio_opt_1_skbbynihz`, `custom_radio_opt_2_rygfy2ibm`, `custom_radio_opt_3_h1ofynobg`, `custom_dropdown_enum_rk59y2ibm`, `custom_radios_enum_b1n3knobf`) VALUES (1,'SJDW9J0Wb','keep.john.doe@mailtrain.org',NULL,NULL,'europe/zurich',NULL,1,1,NOW(),NOW(),NULL,NOW(),'John','Doe','Lorem Ipsum',42,'https://mailtrain.org','','Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.','',NOW(),NOW(),NOW(),NOW(),0,1,0,0,1,0,0,1,0,'at','at');
CREATE TABLE `subscription__2` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `cid` varchar(255) CHARACTER SET ascii NOT NULL,
  `email` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `opt_in_ip` varchar(100) DEFAULT NULL,
  `opt_in_country` varchar(2) DEFAULT NULL,
  `tz` varchar(100) CHARACTER SET ascii DEFAULT NULL,
  `imported` int(11) unsigned DEFAULT NULL,
  `status` tinyint(4) unsigned NOT NULL DEFAULT '1',
  `is_test` tinyint(4) unsigned NOT NULL DEFAULT '0',
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
  KEY `last_name` (`last_name`(191)),
  KEY `subscriber_tz` (`tz`),
  KEY `is_test` (`is_test`),
  KEY `latest_open` (`latest_open`),
  KEY `latest_click` (`latest_click`),
  KEY `created` (`created`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `subscription__3` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `cid` varchar(255) CHARACTER SET ascii NOT NULL,
  `email` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `opt_in_ip` varchar(100) DEFAULT NULL,
  `opt_in_country` varchar(2) DEFAULT NULL,
  `tz` varchar(100) CHARACTER SET ascii DEFAULT NULL,
  `imported` int(11) unsigned DEFAULT NULL,
  `status` tinyint(4) unsigned NOT NULL DEFAULT '1',
  `is_test` tinyint(4) unsigned NOT NULL DEFAULT '0',
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
  KEY `last_name` (`last_name`(191)),
  KEY `subscriber_tz` (`tz`),
  KEY `is_test` (`is_test`),
  KEY `latest_open` (`latest_open`),
  KEY `latest_click` (`latest_click`),
  KEY `created` (`created`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `subscription__4` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `cid` varchar(255) CHARACTER SET ascii NOT NULL,
  `email` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `opt_in_ip` varchar(100) DEFAULT NULL,
  `opt_in_country` varchar(2) DEFAULT NULL,
  `tz` varchar(100) CHARACTER SET ascii DEFAULT NULL,
  `imported` int(11) unsigned DEFAULT NULL,
  `status` tinyint(4) unsigned NOT NULL DEFAULT '1',
  `is_test` tinyint(4) unsigned NOT NULL DEFAULT '0',
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
  KEY `last_name` (`last_name`(191)),
  KEY `subscriber_tz` (`tz`),
  KEY `is_test` (`is_test`),
  KEY `latest_open` (`latest_open`),
  KEY `latest_click` (`latest_click`),
  KEY `created` (`created`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `subscription__5` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `cid` varchar(255) CHARACTER SET ascii NOT NULL,
  `email` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `opt_in_ip` varchar(100) DEFAULT NULL,
  `opt_in_country` varchar(2) DEFAULT NULL,
  `tz` varchar(100) CHARACTER SET ascii DEFAULT NULL,
  `imported` int(11) unsigned DEFAULT NULL,
  `status` tinyint(4) unsigned NOT NULL DEFAULT '1',
  `is_test` tinyint(4) unsigned NOT NULL DEFAULT '0',
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
  KEY `last_name` (`last_name`(191)),
  KEY `subscriber_tz` (`tz`),
  KEY `is_test` (`is_test`),
  KEY `latest_open` (`latest_open`),
  KEY `latest_click` (`latest_click`),
  KEY `created` (`created`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `subscription__6` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `cid` varchar(255) CHARACTER SET ascii NOT NULL,
  `email` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `opt_in_ip` varchar(100) DEFAULT NULL,
  `opt_in_country` varchar(2) DEFAULT NULL,
  `tz` varchar(100) CHARACTER SET ascii DEFAULT NULL,
  `imported` int(11) unsigned DEFAULT NULL,
  `status` tinyint(4) unsigned NOT NULL DEFAULT '1',
  `is_test` tinyint(4) unsigned NOT NULL DEFAULT '0',
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
  KEY `last_name` (`last_name`(191)),
  KEY `subscriber_tz` (`tz`),
  KEY `is_test` (`is_test`),
  KEY `latest_open` (`latest_open`),
  KEY `latest_click` (`latest_click`),
  KEY `created` (`created`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `templates` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '',
  `description` text,
  `editor_name` varchar(50) DEFAULT '',
  `editor_data` longtext,
  `html` longtext,
  `text` longtext,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `namespace` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `name` (`name`(191)),
  KEY `templates_namespace_foreign` (`namespace`),
  CONSTRAINT `templates_namespace_foreign` FOREIGN KEY (`namespace`) REFERENCES `namespaces` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `trigger` (
  `list` int(10) unsigned NOT NULL,
  `subscription` int(10) unsigned NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`list`,`subscription`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TABLE `triggers` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '',
  `description` text,
  `enabled` tinyint(4) unsigned NOT NULL DEFAULT '1',
  `list` int(10) unsigned NOT NULL,
  `source_campaign` int(10) unsigned DEFAULT NULL,
  `rule` varchar(255) CHARACTER SET ascii NOT NULL DEFAULT 'column',
  `column` varchar(255) CHARACTER SET ascii DEFAULT NULL,
  `seconds` int(11) NOT NULL DEFAULT '0',
  `dest_campaign` int(10) unsigned DEFAULT NULL,
  `count` int(11) unsigned NOT NULL DEFAULT '0',
  `last_check` timestamp NULL DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `name` (`name`(191)),
  KEY `source_campaign` (`source_campaign`),
  KEY `dest_campaign` (`dest_campaign`),
  KEY `list` (`list`),
  KEY `column` (`column`),
  KEY `active` (`enabled`),
  KEY `last_check` (`last_check`),
  CONSTRAINT `triggers_ibfk_1` FOREIGN KEY (`list`) REFERENCES `lists` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `tzoffset` (
  `tz` varchar(100) NOT NULL DEFAULT '',
  `offset` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`tz`)
) ENGINE=InnoDB DEFAULT CHARSET=ascii;
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/abidjan',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/accra',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/addis_ababa',180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/algiers',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/asmara',180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/asmera',180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/bamako',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/bangui',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/banjul',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/bissau',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/blantyre',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/brazzaville',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/bujumbura',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/cairo',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/casablanca',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/ceuta',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/conakry',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/dakar',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/dar_es_salaam',180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/djibouti',180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/douala',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/el_aaiun',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/freetown',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/gaborone',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/harare',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/johannesburg',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/juba',180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/kampala',180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/khartoum',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/kigali',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/kinshasa',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/lagos',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/libreville',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/lome',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/luanda',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/lubumbashi',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/lusaka',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/malabo',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/maputo',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/maseru',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/mbabane',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/mogadishu',180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/monrovia',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/nairobi',180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/ndjamena',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/niamey',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/nouakchott',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/ouagadougou',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/porto-novo',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/sao_tome',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/timbuktu',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/tripoli',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/tunis',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/windhoek',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/adak',-600);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/anchorage',-540);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/anguilla',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/antigua',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/araguaina',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/argentina/buenos_aires',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/argentina/catamarca',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/argentina/comodrivadavia',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/argentina/cordoba',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/argentina/jujuy',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/argentina/la_rioja',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/argentina/mendoza',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/argentina/rio_gallegos',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/argentina/salta',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/argentina/san_juan',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/argentina/san_luis',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/argentina/tucuman',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/argentina/ushuaia',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/aruba',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/asuncion',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/atikokan',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/atka',-600);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/bahia',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/bahia_banderas',-360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/barbados',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/belem',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/belize',-360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/blanc-sablon',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/boa_vista',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/bogota',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/boise',-420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/buenos_aires',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/cambridge_bay',-420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/campo_grande',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/cancun',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/caracas',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/catamarca',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/cayenne',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/cayman',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/chicago',-360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/chihuahua',-420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/coral_harbour',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/cordoba',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/costa_rica',-360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/creston',-420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/cuiaba',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/curacao',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/danmarkshavn',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/dawson',-480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/dawson_creek',-420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/denver',-420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/detroit',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/dominica',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/edmonton',-420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/eirunepe',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/el_salvador',-360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/ensenada',-480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/fortaleza',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/fort_nelson',-420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/fort_wayne',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/glace_bay',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/godthab',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/goose_bay',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/grand_turk',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/grenada',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/guadeloupe',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/guatemala',-360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/guayaquil',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/guyana',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/halifax',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/havana',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/hermosillo',-420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/indiana/indianapolis',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/indiana/knox',-360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/indiana/marengo',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/indiana/petersburg',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/indiana/tell_city',-360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/indiana/vevay',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/indiana/vincennes',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/indiana/winamac',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/indianapolis',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/inuvik',-420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/iqaluit',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/jamaica',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/jujuy',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/juneau',-540);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/kentucky/louisville',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/kentucky/monticello',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/knox_in',-360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/kralendijk',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/la_paz',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/lima',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/los_angeles',-480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/louisville',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/lower_princes',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/maceio',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/managua',-360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/manaus',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/marigot',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/martinique',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/matamoros',-360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/mazatlan',-420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/mendoza',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/menominee',-360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/merida',-360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/metlakatla',-540);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/mexico_city',-360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/miquelon',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/moncton',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/monterrey',-360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/montevideo',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/montreal',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/montserrat',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/nassau',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/new_york',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/nipigon',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/nome',-540);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/noronha',-120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/north_dakota/beulah',-360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/north_dakota/center',-360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/north_dakota/new_salem',-360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/ojinaga',-420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/panama',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/pangnirtung',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/paramaribo',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/phoenix',-420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/port-au-prince',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/porto_acre',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/porto_velho',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/port_of_spain',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/puerto_rico',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/punta_arenas',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/rainy_river',-360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/rankin_inlet',-360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/recife',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/regina',-360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/resolute',-360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/rio_branco',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/rosario',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/santarem',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/santa_isabel',-480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/santiago',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/santo_domingo',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/sao_paulo',-120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/scoresbysund',-60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/shiprock',-420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/sitka',-540);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/st_barthelemy',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/st_johns',-210);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/st_kitts',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/st_lucia',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/st_thomas',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/st_vincent',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/swift_current',-360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/tegucigalpa',-360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/thule',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/thunder_bay',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/tijuana',-480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/toronto',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/tortola',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/vancouver',-480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/virgin',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/whitehorse',-480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/winnipeg',-360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/yakutat',-540);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/yellowknife',-420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('antarctica/casey',660);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('antarctica/davis',420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('antarctica/dumontdurville',600);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('antarctica/macquarie',660);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('antarctica/mawson',300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('antarctica/mcmurdo',780);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('antarctica/palmer',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('antarctica/rothera',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('antarctica/south_pole',780);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('antarctica/syowa',180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('antarctica/troll',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('antarctica/vostok',360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('arctic/longyearbyen',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/aden',180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/almaty',360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/amman',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/anadyr',720);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/aqtau',300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/aqtobe',300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/ashgabat',300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/ashkhabad',300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/atyrau',300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/baghdad',180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/bahrain',180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/baku',240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/bangkok',420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/barnaul',420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/beirut',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/bishkek',360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/brunei',480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/calcutta',330);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/chita',540);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/choibalsan',480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/chongqing',480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/chungking',480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/colombo',330);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/dacca',360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/damascus',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/dhaka',360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/dili',540);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/dubai',240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/dushanbe',300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/famagusta',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/gaza',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/harbin',480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/hebron',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/hong_kong',480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/hovd',420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/ho_chi_minh',420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/irkutsk',480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/istanbul',180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/jakarta',420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/jayapura',540);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/jerusalem',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/kabul',270);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/kamchatka',720);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/karachi',300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/kashgar',360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/kathmandu',345);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/katmandu',345);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/khandyga',540);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/kolkata',330);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/krasnoyarsk',420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/kuala_lumpur',480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/kuching',480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/kuwait',180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/macao',480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/macau',480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/magadan',660);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/makassar',480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/manila',480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/muscat',240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/nicosia',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/novokuznetsk',420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/novosibirsk',420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/omsk',360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/oral',300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/phnom_penh',420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/pontianak',420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/pyongyang',510);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/qatar',180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/qyzylorda',360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/rangoon',390);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/riyadh',180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/saigon',420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/sakhalin',660);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/samarkand',300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/seoul',540);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/shanghai',480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/singapore',480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/srednekolymsk',660);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/taipei',480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/tashkent',300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/tbilisi',240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/tehran',210);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/tel_aviv',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/thimbu',360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/thimphu',360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/tokyo',540);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/tomsk',420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/ujung_pandang',480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/ulaanbaatar',480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/ulan_bator',480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/urumqi',360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/ust-nera',600);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/vientiane',420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/vladivostok',600);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/yakutsk',540);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/yangon',390);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/yekaterinburg',300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/yerevan',240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('atlantic/azores',-60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('atlantic/bermuda',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('atlantic/canary',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('atlantic/cape_verde',-60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('atlantic/faeroe',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('atlantic/faroe',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('atlantic/jan_mayen',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('atlantic/madeira',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('atlantic/reykjavik',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('atlantic/south_georgia',-120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('atlantic/stanley',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('atlantic/st_helena',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('australia/act',660);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('australia/adelaide',630);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('australia/brisbane',600);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('australia/broken_hill',630);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('australia/canberra',660);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('australia/currie',660);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('australia/darwin',570);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('australia/eucla',525);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('australia/hobart',660);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('australia/lhi',660);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('australia/lindeman',600);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('australia/lord_howe',660);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('australia/melbourne',660);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('australia/north',570);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('australia/nsw',660);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('australia/perth',480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('australia/queensland',600);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('australia/south',630);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('australia/sydney',660);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('australia/tasmania',660);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('australia/victoria',660);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('australia/west',480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('australia/yancowinna',630);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('brazil/acre',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('brazil/denoronha',-120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('brazil/east',-120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('brazil/west',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('canada/atlantic',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('canada/central',-360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('canada/east-saskatchewan',-360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('canada/eastern',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('canada/mountain',-420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('canada/newfoundland',-210);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('canada/pacific',-480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('canada/saskatchewan',-360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('canada/yukon',-480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('cet',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('chile/continental',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('chile/easterisland',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('cst6cdt',-360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('cuba',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('eet',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('egypt',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('eire',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('est',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('est5edt',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/gmt',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/gmt+0',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/gmt+1',-60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/gmt+10',-600);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/gmt+11',-660);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/gmt+12',-720);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/gmt+2',-120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/gmt+3',-180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/gmt+4',-240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/gmt+5',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/gmt+6',-360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/gmt+7',-420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/gmt+8',-480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/gmt+9',-540);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/gmt-0',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/gmt-1',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/gmt-10',600);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/gmt-11',660);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/gmt-12',720);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/gmt-13',780);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/gmt-14',840);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/gmt-2',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/gmt-3',180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/gmt-4',240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/gmt-5',300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/gmt-6',360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/gmt-7',420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/gmt-8',480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/gmt-9',540);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/gmt0',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/greenwich',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/uct',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/universal',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/utc',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('etc/zulu',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/amsterdam',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/andorra',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/astrakhan',240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/athens',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/belfast',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/belgrade',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/berlin',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/bratislava',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/brussels',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/bucharest',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/budapest',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/busingen',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/chisinau',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/copenhagen',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/dublin',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/gibraltar',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/guernsey',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/helsinki',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/isle_of_man',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/istanbul',180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/jersey',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/kaliningrad',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/kiev',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/kirov',180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/lisbon',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/ljubljana',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/london',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/luxembourg',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/madrid',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/malta',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/mariehamn',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/minsk',180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/monaco',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/moscow',180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/nicosia',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/oslo',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/paris',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/podgorica',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/prague',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/riga',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/rome',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/samara',240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/san_marino',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/sarajevo',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/saratov',240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/simferopol',180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/skopje',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/sofia',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/stockholm',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/tallinn',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/tirane',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/tiraspol',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/ulyanovsk',240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/uzhgorod',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/vaduz',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/vatican',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/vienna',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/vilnius',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/volgograd',180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/warsaw',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/zagreb',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/zaporozhye',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/zurich',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('gb',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('gb-eire',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('gmt',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('gmt+0',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('gmt-0',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('gmt0',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('greenwich',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('hongkong',480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('hst',-600);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('iceland',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('indian/antananarivo',180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('indian/chagos',360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('indian/christmas',420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('indian/cocos',390);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('indian/comoro',180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('indian/kerguelen',300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('indian/mahe',240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('indian/maldives',300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('indian/mauritius',240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('indian/mayotte',180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('indian/reunion',240);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('iran',210);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('israel',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('jamaica',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('japan',540);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('kwajalein',720);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('libya',120);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('met',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('mexico/bajanorte',-480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('mexico/bajasur',-420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('mexico/general',-360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('mst',-420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('mst7mdt',-420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('navajo',-420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('nz',780);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('nz-chat',825);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/apia',840);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/auckland',780);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/bougainville',660);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/chatham',825);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/chuuk',600);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/easter',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/efate',660);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/enderbury',780);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/fakaofo',780);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/fiji',720);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/funafuti',720);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/galapagos',-360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/gambier',-540);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/guadalcanal',660);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/guam',600);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/honolulu',-600);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/johnston',-600);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/kiritimati',840);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/kosrae',660);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/kwajalein',720);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/majuro',720);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/marquesas',-570);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/midway',-660);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/nauru',720);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/niue',-660);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/norfolk',660);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/noumea',660);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/pago_pago',-660);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/palau',540);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/pitcairn',-480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/pohnpei',660);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/ponape',660);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/port_moresby',600);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/rarotonga',-600);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/saipan',600);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/samoa',-660);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/tahiti',-600);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/tarawa',720);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/tongatapu',780);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/truk',600);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/wake',720);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/wallis',720);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/yap',600);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('poland',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('portugal',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('prc',480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pst8pdt',-480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('roc',480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('rok',540);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('singapore',480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('turkey',180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('uct',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('universal',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('us/alaska',-540);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('us/aleutian',-600);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('us/arizona',-420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('us/central',-360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('us/east-indiana',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('us/eastern',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('us/hawaii',-600);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('us/indiana-starke',-360);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('us/michigan',-300);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('us/mountain',-420);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('us/pacific',-480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('us/pacific-new',-480);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('us/samoa',-660);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('utc',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('w-su',180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('wet',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('zulu',0);
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL DEFAULT '',
  `password` varchar(255) DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `access_token` varchar(40) DEFAULT NULL,
  `reset_token` varchar(255) CHARACTER SET ascii DEFAULT NULL,
  `reset_expire` timestamp NULL DEFAULT NULL,
  `created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `namespace` int(10) unsigned NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `username` (`username`(191)),
  KEY `reset` (`reset_token`),
  KEY `check_reset` (`username`(191),`reset_token`,`reset_expire`),
  KEY `token_index` (`access_token`),
  KEY `users_namespace_foreign` (`namespace`),
  CONSTRAINT `users_namespace_foreign` FOREIGN KEY (`namespace`) REFERENCES `namespaces` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;
INSERT INTO `users` (`id`, `username`, `password`, `email`, `access_token`, `reset_token`, `reset_expire`, `created`, `namespace`, `name`, `role`) VALUES (1,'admin','$2a$10$mzKU71G62evnGB2PvQA4k..Wf9jASk.c7a8zRMHh6qQVjYJ2r/g/K','keep.admin@mailtrain.org','7833d148e22c85474c314f43ae4591a7c9adec26',NULL,NULL,NOW(),1,'Administrator','master');

SET UNIQUE_CHECKS=1;
SET FOREIGN_KEY_CHECKS=1;
