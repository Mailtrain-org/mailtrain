# noinspection SqlNoDataSourceInspectionForFile

/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `blacklist` (
  `email` varchar(191) NOT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `campaign_links` (
  `campaign` int(10) unsigned NOT NULL,
  `list` int(10) unsigned NOT NULL,
  `subscription` int(10) unsigned NOT NULL,
  `link` int(10) NOT NULL,
  `ip` varchar(100) DEFAULT NULL,
  `device_type` varchar(50) DEFAULT NULL,
  `country` varchar(2) DEFAULT NULL,
  `count` int(10) unsigned NOT NULL DEFAULT 1,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`campaign`,`list`,`subscription`,`link`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `campaign_lists` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `campaign` int(10) unsigned NOT NULL,
  `list` int(10) unsigned NOT NULL,
  `segment` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `campaign_lists_list_foreign` (`list`),
  KEY `campaign_lists_segment_foreign` (`segment`),
  KEY `campaign_lists_campaign_foreign` (`campaign`),
  CONSTRAINT `campaign_lists_campaign_foreign` FOREIGN KEY (`campaign`) REFERENCES `campaigns` (`id`),
  CONSTRAINT `campaign_lists_list_foreign` FOREIGN KEY (`list`) REFERENCES `lists` (`id`),
  CONSTRAINT `campaign_lists_segment_foreign` FOREIGN KEY (`segment`) REFERENCES `segments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `campaign_messages` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `campaign` int(10) unsigned NOT NULL,
  `list` int(10) unsigned NOT NULL,
  `subscription` int(10) unsigned NOT NULL,
  `send_configuration` int(10) unsigned NOT NULL,
  `status` tinyint(4) unsigned NOT NULL DEFAULT 0,
  `response` varchar(255) DEFAULT NULL,
  `response_id` varchar(255) DEFAULT NULL,
  `updated` timestamp NULL DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `hash_email` char(88) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cls` (`campaign`,`list`,`subscription`),
  UNIQUE KEY `campaign_hash_email` (`campaign`,`hash_email`),
  KEY `response_id` (`response_id`),
  KEY `status_index` (`status`),
  KEY `subscription_index` (`subscription`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `campaigns` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `cid` varchar(255) NOT NULL,
  `type` tinyint(4) unsigned NOT NULL DEFAULT 1,
  `parent` int(10) unsigned DEFAULT NULL,
  `name` varchar(255) NOT NULL DEFAULT '',
  `description` text DEFAULT NULL,
  `last_check` timestamp NULL DEFAULT NULL,
  `from_name_override` varchar(255) DEFAULT '',
  `from_email_override` varchar(255) DEFAULT '',
  `reply_to_override` varchar(255) DEFAULT '',
  `subject` varchar(255) DEFAULT '',
  `unsubscribe_url` varchar(255) NOT NULL DEFAULT '',
  `status` tinyint(4) unsigned NOT NULL DEFAULT 1,
  `scheduled` timestamp NULL DEFAULT NULL,
  `delivered` int(11) unsigned NOT NULL DEFAULT 0,
  `blacklisted` int(11) unsigned NOT NULL DEFAULT 0,
  `opened` int(11) unsigned NOT NULL DEFAULT 0,
  `clicks` int(11) unsigned NOT NULL DEFAULT 0,
  `unsubscribed` int(11) unsigned NOT NULL DEFAULT 0,
  `bounced` int(1) unsigned NOT NULL DEFAULT 0,
  `complained` int(1) unsigned NOT NULL DEFAULT 0,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `open_tracking_disabled` tinyint(4) unsigned NOT NULL DEFAULT 0,
  `click_tracking_disabled` tinyint(4) unsigned NOT NULL DEFAULT 0,
  `namespace` int(10) unsigned NOT NULL,
  `data` longtext DEFAULT NULL,
  `source` int(10) unsigned NOT NULL,
  `send_configuration` int(10) unsigned NOT NULL,
  `start_at` timestamp NULL DEFAULT NULL,
  `channel` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cid` (`cid`),
  KEY `name` (`name`(191)),
  KEY `status` (`status`),
  KEY `schedule_index` (`scheduled`),
  KEY `type_index` (`type`),
  KEY `parent_index` (`parent`),
  KEY `check_index` (`last_check`),
  KEY `campaigns_namespace_foreign` (`namespace`),
  KEY `campaigns_send_configuration_foreign` (`send_configuration`),
  KEY `campaigns_channel_foreign` (`channel`),
  CONSTRAINT `campaigns_channel_foreign` FOREIGN KEY (`channel`) REFERENCES `channels` (`id`),
  CONSTRAINT `campaigns_namespace_foreign` FOREIGN KEY (`namespace`) REFERENCES `namespaces` (`id`),
  CONSTRAINT `campaigns_send_configuration_foreign` FOREIGN KEY (`send_configuration`) REFERENCES `send_configurations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `channel_lists` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `channel` int(10) unsigned NOT NULL,
  `list` int(10) unsigned NOT NULL,
  `segment` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `channel_lists_channel_foreign` (`channel`),
  KEY `channel_lists_list_foreign` (`list`),
  KEY `channel_lists_segment_foreign` (`segment`),
  CONSTRAINT `channel_lists_channel_foreign` FOREIGN KEY (`channel`) REFERENCES `channels` (`id`),
  CONSTRAINT `channel_lists_list_foreign` FOREIGN KEY (`list`) REFERENCES `lists` (`id`),
  CONSTRAINT `channel_lists_segment_foreign` FOREIGN KEY (`segment`) REFERENCES `segments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `channels` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `cid` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `cpg_name` varchar(255) DEFAULT NULL,
  `cpg_description` text DEFAULT NULL,
  `from_email_override` varchar(255) DEFAULT NULL,
  `from_name_override` varchar(255) DEFAULT NULL,
  `reply_to_override` varchar(255) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `send_configuration` int(10) unsigned DEFAULT NULL,
  `source` int(10) unsigned NOT NULL,
  `data` longtext DEFAULT NULL,
  `click_tracking_disabled` tinyint(1) DEFAULT 0,
  `open_tracking_disabled` tinyint(1) DEFAULT 0,
  `unsubscribe_url` varchar(255) DEFAULT NULL,
  `created` timestamp NULL DEFAULT current_timestamp(),
  `namespace` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `channels_cid_unique` (`cid`),
  KEY `channels_send_configuration_foreign` (`send_configuration`),
  KEY `channels_namespace_foreign` (`namespace`),
  CONSTRAINT `channels_namespace_foreign` FOREIGN KEY (`namespace`) REFERENCES `namespaces` (`id`),
  CONSTRAINT `channels_send_configuration_foreign` FOREIGN KEY (`send_configuration`) REFERENCES `send_configurations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `confirmations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `cid` varchar(255) NOT NULL,
  `list` int(10) unsigned NOT NULL,
  `action` varchar(100) NOT NULL,
  `ip` varchar(100) DEFAULT NULL,
  `data` text NOT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `cid` (`cid`),
  KEY `list` (`list`),
  CONSTRAINT `confirmations_ibfk_1` FOREIGN KEY (`list`) REFERENCES `lists` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `custom_fields` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `list` int(10) unsigned NOT NULL,
  `name` varchar(255) DEFAULT '',
  `help` text DEFAULT NULL,
  `key` varchar(100) NOT NULL,
  `default_value` varchar(255) DEFAULT NULL,
  `required` tinyint(1) NOT NULL DEFAULT 0,
  `type` varchar(255) NOT NULL DEFAULT '',
  `group` int(10) unsigned DEFAULT NULL,
  `column` varchar(255) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `order_subscribe` int(11) DEFAULT NULL,
  `order_manage` int(11) DEFAULT NULL,
  `order_list` int(11) DEFAULT NULL,
  `settings` longtext DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `list` (`list`,`column`),
  KEY `list_2` (`list`),
  CONSTRAINT `custom_fields_list_foreign` FOREIGN KEY (`list`) REFERENCES `lists` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `custom_forms` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT '',
  `description` text DEFAULT NULL,
  `layout` longtext DEFAULT NULL,
  `form_input_style` longtext DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `namespace` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `custom_forms_namespace_foreign` (`namespace`),
  CONSTRAINT `custom_forms_namespace_foreign` FOREIGN KEY (`namespace`) REFERENCES `namespaces` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `custom_forms_data` (
  `form` int(10) unsigned NOT NULL,
  `data_key` varchar(128) NOT NULL,
  `data_value` longtext DEFAULT NULL,
  PRIMARY KEY (`form`,`data_key`),
  KEY `form` (`form`),
  CONSTRAINT `custom_forms_data_ibfk_1` FOREIGN KEY (`form`) REFERENCES `custom_forms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `file_cache` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(255) NOT NULL,
  `key` varchar(255) NOT NULL,
  `mimetype` varchar(255) DEFAULT NULL,
  `size` int(11) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `key` (`key`(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `files_campaign_attachment` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `entity` int(10) unsigned NOT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `originalname` varchar(255) DEFAULT NULL,
  `mimetype` varchar(255) DEFAULT NULL,
  `size` int(11) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `delete_pending` tinyint(1) NOT NULL DEFAULT 0,
  `lock_count` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `files_campaign_attachment_entity_originalname_index` (`entity`,`originalname`),
  CONSTRAINT `files_campaign_attachment_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `campaigns` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `files_campaign_file` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `entity` int(10) unsigned NOT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `originalname` varchar(255) DEFAULT NULL,
  `mimetype` varchar(255) DEFAULT NULL,
  `size` int(11) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `delete_pending` tinyint(1) NOT NULL DEFAULT 0,
  `lock_count` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `files_campaign_file_entity_originalname_index` (`entity`,`originalname`),
  CONSTRAINT `files_campaign_file_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `campaigns` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `files_mosaico_template_block` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `entity` int(10) unsigned NOT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `originalname` varchar(255) DEFAULT NULL,
  `mimetype` varchar(255) DEFAULT NULL,
  `size` int(11) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `delete_pending` tinyint(1) NOT NULL DEFAULT 0,
  `lock_count` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `files_mosaico_template_block_entity_originalname_index` (`entity`,`originalname`),
  CONSTRAINT `files_mosaico_template_block_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `mosaico_templates` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `files_mosaico_template_file` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `entity` int(10) unsigned NOT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `originalname` varchar(255) DEFAULT NULL,
  `mimetype` varchar(255) DEFAULT NULL,
  `size` int(11) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `delete_pending` tinyint(1) NOT NULL DEFAULT 0,
  `lock_count` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `files_mosaico_template_file_entity_originalname_index` (`entity`,`originalname`),
  CONSTRAINT `files_mosaico_template_file_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `mosaico_templates` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `files_template_file` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `entity` int(10) unsigned NOT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `originalname` varchar(255) DEFAULT NULL,
  `mimetype` varchar(255) DEFAULT NULL,
  `size` int(11) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `delete_pending` tinyint(1) NOT NULL DEFAULT 0,
  `lock_count` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `files_template_file_entity_originalname_index` (`entity`,`originalname`),
  CONSTRAINT `files_template_file_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `templates` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `generated_role_names` (
  `entity_type` varchar(32) NOT NULL,
  `role` varchar(128) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`entity_type`,`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `import_failed` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `run` int(10) unsigned DEFAULT NULL,
  `source_id` int(10) unsigned DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `reason` text DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `import_failed_run_foreign` (`run`),
  CONSTRAINT `import_failed_run_foreign` FOREIGN KEY (`run`) REFERENCES `import_runs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `import_runs` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `import` int(10) unsigned DEFAULT NULL,
  `status` int(10) unsigned NOT NULL,
  `mapping` longtext DEFAULT NULL,
  `last_id` int(11) DEFAULT NULL,
  `new` int(11) DEFAULT 0,
  `failed` int(11) DEFAULT 0,
  `processed` int(11) DEFAULT 0,
  `error` text DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `finished` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `import_runs_import_foreign` (`import`),
  CONSTRAINT `import_runs_import_foreign` FOREIGN KEY (`import`) REFERENCES `imports` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `imports` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `list` int(10) unsigned DEFAULT NULL,
  `source` int(10) unsigned NOT NULL,
  `status` int(10) unsigned NOT NULL,
  `settings` longtext DEFAULT NULL,
  `mapping_type` int(10) unsigned NOT NULL,
  `mapping` longtext DEFAULT NULL,
  `last_run` timestamp NULL DEFAULT NULL,
  `error` text DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `imports_list_foreign` (`list`),
  CONSTRAINT `imports_list_foreign` FOREIGN KEY (`list`) REFERENCES `lists` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `knex_migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `batch` int(11) DEFAULT NULL,
  `migration_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

INSERT INTO `knex_migrations` VALUES
(1,'20170506102634_v1_to_v2.js',1,'2024-04-21 12:52:29'),
(2,'20181226090000_verp_header_options_in_send_configurations.js',2,'2024-04-21 12:52:32'),
(3,'20190422084800_file_cache.js',2,'2024-04-21 12:52:32'),
(4,'20190615000000_generalization_of_queued_and_file_locking.js',2,'2024-04-21 12:52:32'),
(5,'20190616000000_drop_subject_in_send_configurations.js',2,'2024-04-21 12:52:32'),
(6,'20190629000000_add_start_at_to_campaigns.js',2,'2024-04-21 12:52:32'),
(7,'20190629170000_generalization_of_queued.js',2,'2024-04-21 12:52:32'),
(8,'20190630210000_tag_language.js',2,'2024-04-21 12:52:33'),
(9,'20190705220000_test_messages.js',2,'2024-04-21 12:52:33'),
(10,'20190722110000_hash_email.js',2,'2024-04-21 12:52:33'),
(11,'20190722150000_ensure_help_column_in_custom_fields.js',2,'2024-04-21 12:52:33'),
(12,'20191007120000_add_updated_to_subscriptions.js',2,'2024-04-21 12:52:33'),
(13,'20200617172500_add_channels.js',2,'2024-04-21 12:52:33'),
(14,'20200824160149_convert_to_utf8mb4.js',2,'2024-04-21 12:52:35'),
(15,'20200830140000_required_custom_fields.js',2,'2024-04-21 12:52:35');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `knex_migrations_lock` (
  `index` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `is_locked` int(11) DEFAULT NULL,
  PRIMARY KEY (`index`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

INSERT INTO `knex_migrations_lock` VALUES
(1,0);
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `links` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `cid` varchar(255) NOT NULL DEFAULT '',
  `campaign` int(10) unsigned NOT NULL,
  `url` varchar(255) NOT NULL DEFAULT '',
  `visits` int(10) unsigned NOT NULL DEFAULT 0,
  `hits` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cid` (`cid`),
  UNIQUE KEY `campaign_2` (`campaign`,`url`),
  KEY `campaign` (`campaign`),
  CONSTRAINT `links_ibfk_1` FOREIGN KEY (`campaign`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lists` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `cid` varchar(255) NOT NULL,
  `default_form` int(11) unsigned DEFAULT NULL,
  `name` varchar(255) NOT NULL DEFAULT '',
  `description` text DEFAULT NULL,
  `subscribers` int(11) unsigned DEFAULT 0,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `public_subscribe` tinyint(1) unsigned NOT NULL DEFAULT 1,
  `unsubscription_mode` int(11) unsigned NOT NULL DEFAULT 0,
  `listunsubscribe_disabled` tinyint(4) unsigned NOT NULL DEFAULT 0,
  `namespace` int(10) unsigned NOT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `homepage` varchar(255) DEFAULT NULL,
  `to_name` varchar(255) DEFAULT NULL,
  `send_configuration` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cid` (`cid`),
  KEY `name` (`name`(191)),
  KEY `lists_namespace_foreign` (`namespace`),
  KEY `lists_send_configuration_foreign` (`send_configuration`),
  CONSTRAINT `lists_namespace_foreign` FOREIGN KEY (`namespace`) REFERENCES `namespaces` (`id`),
  CONSTRAINT `lists_send_configuration_foreign` FOREIGN KEY (`send_configuration`) REFERENCES `send_configurations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mosaico_templates` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `data` longtext DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `namespace` int(10) unsigned DEFAULT NULL,
  `tag_language` varchar(48) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `mosaico_templates_namespace_foreign` (`namespace`),
  KEY `mosaico_templates_tag_language_index` (`tag_language`),
  CONSTRAINT `mosaico_templates_namespace_foreign` FOREIGN KEY (`namespace`) REFERENCES `namespaces` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

INSERT INTO `mosaico_templates` VALUES
(1,'Versafix One','Default Mosaico Template','html','{\"html\":\"<!DOCTYPE html PUBLIC \\\"-//W3C//DTD XHTML 1.0 Transitional//EN\\\" \\\"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\\\">\\n<html xmlns=\\\"http://www.w3.org/1999/xhtml\\\">\\n<head>\\n  <meta http-equiv=\\\"Content-Type\\\" content=\\\"text/html; charset=UTF-8\\\" />\\n  <meta name=\\\"viewport\\\" content=\\\"initial-scale=1.0\\\" />\\n  <meta name=\\\"format-detection\\\" content=\\\"telephone=no\\\" />\\n  <title style=\\\"-ko-bind-text: @titleText\\\">TITLE</title>\\n  <style type=\\\"text/css\\\">\\n    @supports -ko-blockdefs {\\n      id { widget: id }\\n      size { label: Size; widget: select; options: 8|9|10|11|12|13|14|15|16|18|20|22|25|28|31; }\\n      visible { label: Visible?; widget: boolean }\\n      color { label: Color; widget: color }\\n      radius {\\n        label: Corner Radius;\\n        widget: integer;\\n        max: 20;\\n        help: Attention - this property is not supported on all email clients (i.e. Outlook)\\n      }\\n      face { label: Font; widget: select; options: Arial, Helvetica, sans-serif=Arial|Arial Black, Arial Black, Gadget, sans-serif=Arial Black|Comic Sans MS, Comic Sans MS5, cursive=Comic Sans|Courier New, Courier New, monospace=Courier|Georgia, serif=Georgia|Impact, sans-serif=Impact|Lucida Console, Monaco, monospace=Lucida Console|Lucida Sans Unicode, Lucida Grande, sans-serif=Lucida Sans Unicode|Times New Roman, Times, serif=Times New Roman|Verdana, Geneva, sans-serif=Verdana}\\n      decoration { label: Decoration; widget: select; options: none=None|underline=Underline }\\n      linksColor { label: Link Color; extend: color }\\n      linksDecoration { label: Underlined Links?; extend: decoration }\\n      buttonColor { label: Button Color; extend: color }\\n      text { label: Paragraph; widget: text }\\n      url { label: Link; widget: url }\\n      src { label: Image; widget: src }\\n      hrWidth { label: Width; widget: select; options:10|20|30|40|50|60|70|80|90|100; }\\n      hrHeight { label: Line height; widget: integer; max: 80; }\\n\\n      height { label: Height; widget: integer }\\n      imageHeight { label: Image Height; extend: height; }\\n      spacerSize { label: Height; widget: integer; max: 90; min: 4; }\\n      align { label: Alignment; widget: select; options:left=Left|right=Right|center=Center}\\n      alt {\\n        label: Alternative Text;\\n        widget: text;\\n        help: Alternative text will be shown on email clients that does not download image automatically;\\n      }\\n      sponsor { label: Sponsor; properties: visible=true; }\\n      titleText { label: HTML Title; extend: text; }\\n      gutterVisible { label: Show Gutter; extend: visible }\\n      socialIconType { label: Icon Version;widget: select; options:bw=Black and White|colors=Colors; }\\n\\n      preheaderLinkOption {\\n        label: Unsubscribe Link;\\n        widget: select;\\n        options: [LINK_PREFERENCES]=Preferences|[LINK_UNSUBSCRIBE]=Unsubscribe|none=None;\\n        help: If -None- is selected, preHeader text will be shown;\\n      }\\n\\n      hrStyle { label: Separator Style;properties:color hrWidth hrHeight; }\\n      hrStyle:preview { height: 200%; width: 200%; bottom: 20px; -ko-border-bottom: @[hrHeight]px solid @color; }\\n      preheaderVisible { label: Show Preheader; extend: visible; help: Preheader block is the first one on the top of the page. It contains web version link and optionally unsubscribe link or a preheader text that will be shown as a preview on some email clients; }\\n\\n      /* content types */\\n      blocks { label: Blocks; properties: blocks[]; }\\n      link { label: Link; properties: text url }\\n      image { label: Image; properties: src url alt }\\n      backgroundColor { label: Background Color; extend: color }\\n      buttonLink { label: Button; extend: link }\\n\\n      /* texts and links */\\n      textStyle { label: Text; properties: face color size }\\n      textStyle:preview { -ko-bind-text: @[\'AaZz\']; -ko-font-family: @face; -ko-color: @color; -ko-font-size: @[size]px; }\\n      linkStyle { label: Link; properties: face color size decoration=none }\\n      linkStyle:preview { -ko-bind-text: @[\'Link\']; -ko-font-size: @[size]px; -ko-font-family: @face; -ko-color: @color; -ko-text-decoration: @[decoration] }\\n      longTextStyle { label: Paragraph; properties: face color size linksColor   }\\n      longTextStyle:preview { -ko-bind-text: @[\'AaZz\']; -ko-font-family: @face; -ko-color: @color; -ko-font-size: @[size]px; }\\n      bigButtonStyle { label: Big Button; extend: buttonStyle }\\n      titleTextStyle { label: Title; extend: textStyle }\\n      /* background */\\n      externalBackgroundColor { label: External Background; extend: color }\\n\\n      externalTextStyle { label: Alternative Text; extend: textStyle }\\n      externalTextStyle:preview { -ko-bind-text: @[\'AaZz\']; -ko-font-family: @face; -ko-color: @color; -ko-font-size: @[size]px; }\\n\\n      bigTitleStyle { label: Title; properties: face color size align}\\n      bigTitleStyle:preview { -ko-bind-text: @[\'AaZz\']; -ko-font-family: @face; -ko-color: @color; -ko-font-size: @[size]px; }\\n      /* buttons */\\n      buttonStyle color { label: Text Color; extend: color }\\n      buttonStyle size { label: Text Size; extend: size }\\n      buttonStyle { label: Button; properties: face color size buttonColor radius }\\n      buttonStyle:preview { -ko-bind-text: @[\'Button\']; -ko-font-family: @face; -ko-color: @color; -ko-font-size: @[size]px; -ko-background-color: @buttonColor; padding-left: 5px; -ko-border-radius: @[radius]px; }\\n\\n      /* contents */\\n      preheaderText {label: PreHeader Text; extend:text; help: This text will be shown on some email clients as a preview of the email contents;}\\n      leftImage { label: Left Image; extend: image }\\n      leftLongText { label: Left Text; extend: text }\\n      leftButtonLink { label: Left Button; extend: buttonLink }\\n      middleImage { label: Central Image; extend: image }\\n      middleLongText { label: Central Text; extend: text }\\n      middleButtonLink { label: Central Button; extend: buttonLink }\\n      rightImage { label: Right Image; extend: image }\\n      rightLongText { label: Right Text; extend: text }\\n      rightButtonLink { label: Right Button; extend: buttonLink }\\n      webversionText{ label: Web Link Text; extend: text;}\\n      unsubscribeText{ label: Unsubscribe Link; extend: text;}\\n\\n      titleVisible { label: Show Title; extend: visible; }\\n      buttonVisible { label: Show Button; extend: visible; }\\n      imageVisible { label: Show Image; extend: visible; }\\n\\n      contentTheme { label: Main Style; }\\n      contentTheme:preview { -ko-background-color: @[backgroundColor] }\\n      frameTheme { label: Frame Style; }\\n      frameTheme:preview { -ko-background-color: @[backgroundColor] }\\n      template preheaderText { label: Preheader; }\\n\\n      template { label: Page; theme: frameTheme ;properties:  preheaderVisible=true; version: 1.0.6; }\\n\\n      footerBlock { label: Unsubscribe Block; theme: frameTheme }\\n\\n      socialBlock fbVisible { label: Facebook; }\\n      socialBlock twVisible { label: Twitter }\\n      socialBlock ggVisible { label: Google+ }\\n      socialBlock inVisible { label: LinkedIn }\\n      socialBlock flVisible { label: Flickr }\\n      socialBlock viVisible { label: Vimeo }\\n      socialBlock webVisible { label: Website }\\n      socialBlock instVisible { label: Instagram }\\n      socialBlock youVisible { label: YouTube }\\n      socialBlock fbUrl { label: Facebook Link}\\n      socialBlock twUrl { label: Twitter Link}\\n      socialBlock ggUrl { label: Google+ Link}\\n      socialBlock inUrl { label: LinkedIn Link}\\n      socialBlock flUrl { label: Flickr Link}\\n      socialBlock viUrl { label: Vimeo Link}\\n      socialBlock webUrl { label: Website Link}\\n      socialBlock instUrl { label: Instagram Link}\\n      socialBlock youUrl { label: YouTube Link}\\n      socialBlock {\\n        label: Social Block;\\n        properties: socialIconType=colors fbVisible=true fbUrl twVisible=true twUrl ggVisible=true ggUrl webVisible=false webUrl inVisible=false inUrl flVisible=false flUrl viVisible=false viUrl instVisible=false instUrl youVisible=false youUrl longTextStyle longText backgroundColor;\\n        variant:socialIconType;\\n        theme: frameTheme\\n      }\\n\\n      preheaderBlock { label:Preheader Block;  theme: frameTheme}\\n\\n      sideArticleBlock imagePos {label:Image position;widget:select; options: left=Left|right=Right; }\\n      sideArticleBlock imageWidth { label: Image Size; widget: select; options: 120=Small|166=Medium|258=Big; }\\n      sideArticleBlock { label: Image+Text Block; properties: backgroundColor titleVisible=true buttonVisible=true imageWidth=166 imagePos=left titleTextStyle longTextStyle buttonStyle  image  longText buttonLink; variant:imagePos; theme: contentTheme }\\n\\n      textBlock { label: Text Block; properties: backgroundColor longTextStyle longText; theme: contentTheme}\\n\\n      singleArticleBlock { label: Image/Text Block; properties: backgroundColor titleVisible=true buttonVisible=true imageVisible=true titleTextStyle longTextStyle buttonStyle  image  longText buttonLink;theme: contentTheme}\\n\\n      doubleArticleBlock { label: 2 Columns Block; properties: backgroundColor titleVisible=true buttonVisible=true imageVisible=true titleTextStyle longTextStyle buttonStyle  leftImage  leftLongText leftButtonLink rightImage  rightLongText rightButtonLink; theme: contentTheme}\\n\\n      tripleArticleBlock { label: 3 Columns Block; properties: backgroundColor titleVisible=true buttonVisible=true imageVisible=true titleTextStyle longTextStyle buttonStyle  leftImage  leftLongText leftButtonLink middleImage  middleLongText middleButtonLink rightImage  rightLongText rightButtonLink; theme: contentTheme}\\n\\n      logoBlock imageWidth { label: Image Size; widget: select; options: 166=Small|258=Medium|350=Big; variant:imageWidth;}\\n      logoBlock { label: Logo Block; properties: image imageWidth=258; variant: imageWidth; theme: contentTheme}\\n\\n      titleBlock { label: Title; theme: contentTheme}\\n\\n      imageBlock longTextStyle {\\n        label: Alternative Text;\\n      }\\n      imageBlock { label: Image; properties: gutterVisible=false; variant: gutterVisible; theme: contentTheme }\\n\\n      doubleImageBlock longTextStyle {\\n        label: Alternative Text;\\n      }\\n      doubleImageBlock { label: Two Image Gallery Block; properties: gutterVisible=false; variant: gutterVisible; theme: contentTheme }\\n\\n      tripleImageBlock longTextStyle {\\n        label: Alternative Text;\\n      }\\n      tripleImageBlock { label: Three Image Gallery Block;properties:gutterVisible=false;variant:gutterVisible; theme: contentTheme}\\n\\n      buttonBlock { label: Button Block; theme: contentTheme}\\n      hrBlock { label: Separator Block;  theme: contentTheme}\\n      spacerBlock { label: Spacer Block;  theme: contentTheme}\\n\\n      spacerBlock:preview,\\n      logoBlock:preview { -ko-background-color: @[externalBackgroundColor] }\\n\\n      preheaderBlock:preview,\\n      hrBlock:preview,\\n      sideArticleBlock:preview,\\n      textBlock:preview,\\n      singleArticleBlock:preview,\\n      doubleArticleBlock:preview,\\n      tripleArticleBlock:preview,\\n      titleBlock:preview,\\n      footerBlock:preview,\\n      socialBlock:preview,\\n      buttonBlock:preview,\\n      titleBlock:preview,\\n      socialshareBlock:preview { -ko-background-color: @[backgroundColor] }\\n    }\\n  </style>\\n  <style type=\\\"text/css\\\" data-inline=\\\"true\\\">\\n    body { Margin: 0; padding: 0; }\\n    img { border: 0px; display: block; }\\n\\n    .socialLinks { font-size: 6px; }\\n    .socialLinks a {\\n      display: inline-block;\\n    }\\n    .socialIcon {\\n      display: inline-block;\\n      vertical-align: top;\\n      padding-bottom: 0px;\\n      border-radius: 100%;\\n    }\\n    .oldwebkit { max-width: 570px; }\\n    td.vb-outer { padding-left: 9px; padding-right: 9px; }\\n    table.vb-container, table.vb-row, table.vb-content {\\n      border-collapse: separate;\\n    }\\n    table.vb-row {\\n      border-spacing: 9px;\\n    }\\n    table.vb-row.halfpad {\\n      border-spacing: 0;\\n      padding-left: 9px;\\n      padding-right: 9px;\\n    }\\n    table.vb-row.fullwidth {\\n      border-spacing: 0;\\n      padding: 0;\\n    }\\n    table.vb-container {\\n      padding-left: 18px;\\n      padding-right: 18px;\\n    }\\n    table.vb-container.fullpad {\\n      border-spacing: 18px;\\n      padding-left: 0;\\n      padding-right: 0;\\n    }\\n    table.vb-container.halfpad {\\n      border-spacing: 9px;\\n      padding-left: 9px;\\n      padding-right: 9px;\\n    }\\n    table.vb-container.fullwidth {\\n      padding-left: 0;\\n      padding-right: 0;\\n    }\\n  </style>\\n  <style type=\\\"text/css\\\">\\n    /* yahoo, hotmail */\\n    .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; }\\n    .yshortcuts a { border-bottom: none !important; }\\n    .vb-outer { min-width: 0 !important; }\\n    .RMsgBdy, .ExternalClass {\\n      width: 100%;\\n      background-color: #3f3f3f;\\n      -ko-background-color: @[_theme_.frameTheme.backgroundColor]\\n    }\\n\\n    /* outlook */\\n    table { mso-table-rspace: 0pt; mso-table-lspace: 0pt; }\\n    #outlook a { padding: 0; }\\n    img { outline: none; text-decoration: none; border: none; -ms-interpolation-mode: bicubic; }\\n    a img { border: none; }\\n\\n    @media screen and (max-device-width: 600px), screen and (max-width: 600px) {\\n      table.vb-container, table.vb-row {\\n        width: 95% !important;\\n      }\\n\\n      .mobile-hide { display: none !important; }\\n      .mobile-textcenter { text-align: center !important; }\\n\\n      .mobile-full {\\n        float: none !important;\\n        width: 100% !important;\\n        max-width: none !important;\\n        padding-right: 0 !important;\\n        padding-left: 0 !important;\\n      }\\n      img.mobile-full {\\n        width: 100% !important;\\n        max-width: none !important;\\n        height: auto !important;\\n      }\\n    }\\n  </style>\\n  <style type=\\\"text/css\\\" data-inline=\\\"true\\\">\\n    [data-ko-block=tripleArticleBlock] .links-color a,\\n    [data-ko-block=tripleArticleBlock] .links-color a:link,\\n    [data-ko-block=tripleArticleBlock] .links-color a:visited,\\n    [data-ko-block=tripleArticleBlock] .links-color a:hover {\\n      color: #3f3f3f;\\n      -ko-color: @longTextStyle.linksColor;\\n      text-decoration: underline;\\n    }\\n    [data-ko-block=tripleArticleBlock] .long-text p { Margin: 1em 0px; }\\n    [data-ko-block=tripleArticleBlock] .long-text p:last-child { Margin-bottom: 0px; }\\n    [data-ko-block=tripleArticleBlock] .long-text p:first-child { Margin-top: 0px; }\\n\\n    [data-ko-block=doubleArticleBlock] .links-color a,\\n    [data-ko-block=doubleArticleBlock] .links-color a:link,\\n    [data-ko-block=doubleArticleBlock] .links-color a:visited,\\n    [data-ko-block=doubleArticleBlock] .links-color a:hover {\\n      color: #3f3f3f;\\n      -ko-color: @longTextStyle.linksColor;\\n      text-decoration: underline;\\n    }\\n    [data-ko-block=doubleArticleBlock] .long-text p { Margin: 1em 0px; }\\n    [data-ko-block=doubleArticleBlock] .long-text p:last-child { Margin-bottom: 0px; }\\n    [data-ko-block=doubleArticleBlock] .long-text p:first-child { Margin-top: 0px; }\\n\\n    [data-ko-block=singleArticleBlock] .links-color a,\\n    [data-ko-block=singleArticleBlock] .links-color a:link,\\n    [data-ko-block=singleArticleBlock] .links-color a:visited,\\n    [data-ko-block=singleArticleBlock] .links-color a:hover {\\n      color: #3f3f3f;\\n      -ko-color: @longTextStyle.linksColor;\\n      text-decoration: underline;\\n    }\\n    [data-ko-block=singleArticleBlock] .long-text p { Margin: 1em 0px; }\\n    [data-ko-block=singleArticleBlock] .long-text p:last-child { Margin-bottom: 0px; }\\n    [data-ko-block=singleArticleBlock] .long-text p:first-child { Margin-top: 0px; }\\n\\n    [data-ko-block=textBlock] .links-color a,\\n    [data-ko-block=textBlock] .links-color a:link,\\n    [data-ko-block=textBlock] .links-color a:visited,\\n    [data-ko-block=textBlock] .links-color a:hover {\\n      color: #3f3f3f;\\n      -ko-color: @longTextStyle.linksColor;\\n      text-decoration: underline;\\n    }\\n    [data-ko-block=textBlock] .long-text p { Margin: 1em 0px; }\\n    [data-ko-block=textBlock] .long-text p:last-child { Margin-bottom: 0px; }\\n    [data-ko-block=textBlock] .long-text p:first-child { Margin-top: 0px; }\\n\\n    [data-ko-block=sideArticleBlock] .links-color a,\\n    [data-ko-block=sideArticleBlock] .links-color a:link,\\n    [data-ko-block=sideArticleBlock] .links-color a:visited,\\n    [data-ko-block=sideArticleBlock] .links-color a:hover {\\n      color: #3f3f3f;\\n      -ko-color: @longTextStyle.linksColor;\\n      text-decoration: underline;\\n    }\\n    [data-ko-block=sideArticleBlock] .long-text p { Margin: 1em 0px; }\\n    [data-ko-block=sideArticleBlock] .long-text p:last-child { Margin-bottom: 0px; }\\n    [data-ko-block=sideArticleBlock] .long-text p:first-child { Margin-top: 0px; }\\n\\n    [data-ko-block=socialBlock] .links-color a,\\n    [data-ko-block=socialBlock] .links-color a:link,\\n    [data-ko-block=socialBlock] .links-color a:visited,\\n    [data-ko-block=socialBlock] .links-color a:hover {\\n      color: #cccccc;\\n      -ko-color: @longTextStyle.linksColor;\\n      text-decoration: underline;\\n    }\\n    [data-ko-block=socialBlock] .long-text p { Margin: 1em 0px; }\\n    [data-ko-block=socialBlock] .long-text p:last-child { Margin-bottom: 0px; }\\n    [data-ko-block=socialBlock] .long-text p:first-child { Margin-top: 0px; }\\n\\n    [data-ko-block=footerBlock] .links-color a,\\n    [data-ko-block=footerBlock] .links-color a:link,\\n    [data-ko-block=footerBlock] .links-color a:visited,\\n    [data-ko-block=footerBlock] .links-color a:hover {\\n      color: #cccccc;\\n      -ko-color: @longTextStyle.linksColor;\\n      text-decoration: underline;\\n    }\\n    [data-ko-block=footerBlock] .long-text p { Margin: 1em 0px; }\\n    [data-ko-block=footerBlock] .long-text p:last-child { Margin-bottom: 0px; }\\n    [data-ko-block=footerBlock] .long-text p:first-child { Margin-top: 0px; }\\n\\n    [data-ko-block=doubleImageBlock] a,\\n    [data-ko-block=doubleImageBlock] a:link,\\n    [data-ko-block=doubleImageBlock] a:visited,\\n    [data-ko-block=doubleImageBlock] a:hover {\\n      color: #3f3f3f;\\n      -ko-color: @longTextStyle.linksColor;\\n      text-decoration: underline;\\n    }\\n    [data-ko-block=tripleImageBlock] a,\\n    [data-ko-block=tripleImageBlock] a:link,\\n    [data-ko-block=tripleImageBlock] a:visited,\\n    [data-ko-block=tripleImageBlock] a:hover {\\n      color: #3f3f3f;\\n      -ko-color: @longTextStyle.linksColor;\\n      text-decoration: underline;\\n    }\\n    [data-ko-block=imageBlock] a,\\n    [data-ko-block=imageBlock] a:link,\\n    [data-ko-block=imageBlock] a:visited,\\n    [data-ko-block=imageBlock] a:hover {\\n      color: #3f3f3f;\\n      -ko-color: @longTextStyle.linksColor;\\n      text-decoration: underline;\\n    }\\n  </style>\\n</head>\\n<body bgcolor=\\\"#3f3f3f\\\" text=\\\"#919191\\\" alink=\\\"#cccccc\\\" vlink=\\\"#cccccc\\\" style=\\\"background-color: #3f3f3f; color: #919191;\\n  -ko-background-color: @_theme_.frameTheme.backgroundColor; -ko-attr-bgcolor: @_theme_.frameTheme.backgroundColor; -ko-color: @_theme_.frameTheme.longTextStyle.color;\\n  -ko-attr-text: @_theme_.frameTheme.longTextStyle.color; -ko-attr-alink: @_theme_.frameTheme.longTextStyle.linksColor;\\n  -ko-attr-vlink: @_theme_.frameTheme.longTextStyle.linksColor\\\">\\n\\n  <center>\\n\\n  <!-- preheaderBlock -->\\n  <div data-ko-display=\\\"preheaderVisible\\\" data-ko-wrap=\\\"false\\\">\\n\\n  <table class=\\\"vb-outer\\\" width=\\\"100%\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" bgcolor=\\\"#3f3f3f\\\"\\n    style=\\\"background-color: #3f3f3f; -ko-background-color: @backgroundColor; -ko-attr-bgcolor: @backgroundColor\\\" data-ko-block=\\\"preheaderBlock\\\">\\n    <tr>\\n      <td class=\\\"vb-outer\\\" align=\\\"center\\\" valign=\\\"top\\\" bgcolor=\\\"#3f3f3f\\\"\\n        style=\\\"background-color: #3f3f3f; -ko-background-color: @backgroundColor; -ko-attr-bgcolor: @backgroundColor\\\">\\n        <div style=\\\"display: none; font-size:1px; color: #333333; line-height: 1px; max-height:0px; max-width: 0px; opacity: 0; overflow: hidden;\\n          -ko-bind-text: @preheaderText\\\"></div>\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"570\\\"><tr><td align=\\\"center\\\" valign=\\\"top\\\"><![endif]-->\\n        <div class=\\\"oldwebkit\\\">\\n        <table width=\\\"570\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"0\\\" class=\\\"vb-row halfpad\\\" bgcolor=\\\"#3f3f3f\\\"\\n          style=\\\"width: 100%; max-width: 570px; background-color: #3f3f3f; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor;\\\">\\n          <tr>\\n            <td align=\\\"center\\\" valign=\\\"top\\\" bgcolor=\\\"#3f3f3f\\\" style=\\\"font-size: 0; background-color: #3f3f3f;\\n              -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor\\\" align=\\\"left\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"552\\\"><tr><![endif]-->\\n<!--[if (gte mso 9)|(lte ie 8)]><td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"276\\\"><![endif]-->\\n<div style=\\\"display:inline-block; max-width:276px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full\\\">\\n                    <table class=\\\"vb-content\\\" border=\\\"0\\\" cellspacing=\\\"9\\\" cellpadding=\\\"0\\\" width=\\\"276\\\" style=\\\"width: 100%;\\\" align=\\\"left\\\">\\n                      <tr>\\n                        <td width=\\\"100%\\\" valign=\\\"top\\\" align=\\\"left\\\" style=\\\"font-weight: normal; text-align:left; font-size: 13px;\\n                          font-family: Arial, Helvetica, sans-serif; color: #ffffff;\\n                          -ko-font-size: @[linkStyle.size]px; -ko-color: @linkStyle.color; -ko-font-family: @linkStyle.face\\\">\\n                          <a data-ko-display=\\\"preheaderLinkOption neq \'none\'\\\" data-ko-editable=\\\"unsubscribeText\\\" href=\\\"[LINK_PREFERENCES]\\\"\\n                             style=\\\"text-decoration: underline; color: #ffffff; -ko-attr-href: @preheaderLinkOption;\\n                             -ko-color: @linkStyle.color; -ko-text-decoration: @linkStyle.decoration\\\">Preferences</a>\\n                          <span data-ko-display=\\\"preheaderLinkOption eq \'none\'\\\" style=\\\"font-size: 13px;color: #919191; font-weight: normal; text-align:center;\\n                            font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color;\\n                            -ko-font-family: @longTextStyle.face; -ko-bind-text: @preheaderText; display: none\\\"></span>\\n                        </td>\\n                      </tr>\\n                    </table>\\n</div><!--[if (gte mso 9)|(lte ie 8)]>\\n</td><td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"276\\\">\\n<![endif]--><div style=\\\"display:inline-block; max-width:276px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full mobile-hide\\\">\\n\\n                    <table class=\\\"vb-content\\\" border=\\\"0\\\" cellspacing=\\\"9\\\" cellpadding=\\\"0\\\" width=\\\"276\\\" style=\\\"width: 100%; text-align: right;\\\" align=\\\"left\\\">\\n                      <tr>\\n                        <td width=\\\"100%\\\" valign=\\\"top\\\" style=\\\"font-weight: normal;  font-size: 13px; font-family: Arial, Helvetica, sans-serif; color: #ffffff;\\n                      -ko-font-size: @[linkStyle.size]px; -ko-color: @linkStyle.color; -ko-font-family: @linkStyle.face\\\">\\n                      <span style=\\\"color: #ffffff; text-decoration: underline;\\n                        -ko-color: @linkStyle.color; -ko-text-decoration: @linkStyle.decoration\\\">\\n                          <a data-ko-editable=\\\"webversionText\\\" href=\\\"[LINK_BROWSER]\\\"\\n                          style=\\\"text-decoration: underline; color: #ffffff;\\n                           -ko-color: @linkStyle.color; -ko-text-decoration: @linkStyle.decoration\\\">View in your browser</a>\\n                         </span>\\n                       </td>\\n                      </tr>\\n                    </table>\\n\\n</div><!--[if (gte mso 9)|(lte ie 8)]>\\n</td></tr></table><![endif]-->\\n\\n            </td>\\n          </tr>\\n        </table>\\n        </div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\\n      </td>\\n    </tr>\\n  </table>\\n\\n  </div>\\n  <!-- /preheaderBlock -->\\n\\n  <div data-ko-container=\\\"main\\\" data-ko-wrap=\\\"false\\\">\\n\\n  <!-- logoBlock -->\\n  <table class=\\\"vb-outer\\\" width=\\\"100%\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" bgcolor=\\\"#bfbfbf\\\"\\n    style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\" data-ko-block=\\\"logoBlock\\\">\\n    <tr>\\n      <td class=\\\"vb-outer\\\" align=\\\"center\\\" valign=\\\"top\\\" bgcolor=\\\"#bfbfbf\\\"\\n        style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"570\\\"><tr><td align=\\\"center\\\" valign=\\\"top\\\"><![endif]-->\\n        <div class=\\\"oldwebkit\\\">\\n        <table width=\\\"570\\\" style=\\\"width: 100%; max-width: 570px\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"18\\\" class=\\\"vb-container fullpad\\\">\\n          <tr>\\n            <td valign=\\\"top\\\" align=\\\"center\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"258\\\" style=\\\"-ko-attr-width: @[imageWidth]\\\"><tr><td align=\\\"center\\\" valign=\\\"top\\\"><![endif]-->\\n<div style=\\\"display:inline-block; max-width:258px; -ko-max-width: @[imageWidth]px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full\\\">\\n                    <a data-ko-link=\\\"image.url\\\" href=\\\"\\\" style=\\\"font-size: 18px; font-family: Arial, Helvetica, sans-serif; color: #f3f3f3;\\n                      text-decoration: none; -ko-font-size: @[externalTextStyle.size]px;\\n                      -ko-font-family: @externalTextStyle.face; -ko-color: @externalTextStyle.color\\\"><img\\n                       data-ko-editable=\\\"image.src\\\" width=\\\"258\\\" data-ko-placeholder-height=\\\"150\\\"\\n                        style=\\\"-ko-attr-alt: @image.alt; width: 100%; max-width: 258px; -ko-attr-width: @imageWidth; -ko-max-width: @[imageWidth]px;\\\"\\n                        src=\\\"[PLACEHOLDER_258x150]\\\" vspace=\\\"0\\\" hspace=\\\"0\\\" border=\\\"0\\\" alt=\\\"\\\" /></a>\\n</div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\\n\\n            </td>\\n          </tr>\\n        </table>\\n        </div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\\n\\n      </td>\\n    </tr>\\n  </table>\\n  <!-- /logoBlock  -->\\n\\n  <!-- sideArticleBlock  -->\\n  <table class=\\\"vb-outer\\\" width=\\\"100%\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" bgcolor=\\\"#bfbfbf\\\"\\n    style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\" data-ko-block=\\\"sideArticleBlock\\\">\\n    <tr>\\n      <td class=\\\"vb-outer\\\" align=\\\"center\\\" valign=\\\"top\\\" bgcolor=\\\"#bfbfbf\\\"\\n        style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"570\\\"><tr><td align=\\\"center\\\" valign=\\\"top\\\"><![endif]-->\\n        <div class=\\\"oldwebkit\\\">\\n        <table width=\\\"570\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"9\\\" class=\\\"vb-row fullpad\\\" bgcolor=\\\"#ffffff\\\"\\n          style=\\\"width: 100%; max-width: 570px; background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor;\\\">\\n          <tr>\\n            <td align=\\\"center\\\" class=\\\"mobile-row\\\" valign=\\\"top\\\" style=\\\"font-size: 0;\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"552\\\"><tr><![endif]-->\\n<div data-ko-display=\\\"imagePos eq \'left\'\\\" data-ko-wrap=\\\"false\\\" style=\\\"width: 100%; max-width:184px; -ko-max-width:@[18 + Math.round(imageWidth)]px; display:inline-block\\\" class=\\\"mobile-full\\\">\\n<!--[if (gte mso 9)|(lte ie 8)]><td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"184\\\" style=\\\"-ko-attr-width: @[18 + Math.round(imageWidth)]\\\"><![endif]-->\\n<div style=\\\"display:inline-block; max-width:184px; -ko-max-width:@[18 + Math.round(imageWidth)]px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full\\\">\\n\\n                    <table class=\\\"vb-content\\\" border=\\\"0\\\" cellspacing=\\\"9\\\" cellpadding=\\\"0\\\" width=\\\"184\\\" style=\\\"width: 100%; -ko-attr-width: @[18 + Math.round(imageWidth)]\\\" align=\\\"left\\\">\\n                      <tr>\\n                        <td width=\\\"100%\\\" valign=\\\"top\\\" align=\\\"left\\\" class=\\\"links-color\\\">\\n                          <a data-ko-link=\\\"image.url\\\" href=\\\"\\\">\\n                            <img data-ko-editable=\\\"image.src\\\" border=\\\"0\\\" hspace=\\\"0\\\" vspace=\\\"0\\\" width=\\\"166\\\"\\n                              data-ko-placeholder-height=\\\"130\\\" class=\\\"mobile-full\\\" alt=\\\"\\\"\\n                              src=\\\"[PLACEHOLDER_166x130]\\\"\\n                              style=\\\"vertical-align: top; width: 100%; height: auto; -ko-attr-width: @imageWidth; max-width: 166px; -ko-max-width: @[imageWidth]px; -ko-attr-alt: @image.alt\\\" />\\n                          </a>\\n                        </td>\\n                      </tr>\\n                    </table>\\n\\n</div><!--[if (gte mso 9)|(lte ie 8)]></td>\\n<![endif]--></div><!--[if (gte mso 9)|(lte ie 8)]>\\n<td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"368\\\" style=\\\"-ko-attr-width: @[570 - 2 * 18 - Math.round(imageWidth)]\\\">\\n<![endif]--><div style=\\\"display:inline-block; max-width:368px; -ko-max-width: @[570 - 2 * 18 - Math.round(imageWidth)]px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full\\\">\\n\\n                    <table class=\\\"vb-content\\\" border=\\\"0\\\" cellspacing=\\\"9\\\" cellpadding=\\\"0\\\" width=\\\"368\\\" style=\\\"width: 100%; -ko-attr-width: @[570 - 2 * 18 - Math.round(imageWidth)]\\\" align=\\\"left\\\">\\n                      <tr data-ko-display=\\\"titleVisible\\\">\\n                        <td style=\\\"font-size: 18px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; text-align:left;\\n                          -ko-font-size: @[titleTextStyle.size]px; -ko-font-family: @titleTextStyle.face; -ko-color: @titleTextStyle.color\\\">\\n                          <span style=\\\"color: #3f3f3f; -ko-color: @titleTextStyle.color\\\" data-ko-editable=\\\"titleText\\\">\\n                          Title\\n                          </span>\\n                        </td>\\n                      </tr>\\n                      <tr>\\n                        <td align=\\\"left\\\" style=\\\"text-align: left; font-size: 13px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f;\\n                          -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face; -ko-color: @longTextStyle.color\\\"\\n                          data-ko-editable=\\\"longText\\\" class=\\\"long-text links-color\\\">\\n                          <p>Far far away, behind the word mountains, far from the countries <a href=\\\"\\\">Vokalia and Consonantia</a>, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia.</p>\\n                        </td>\\n                      </tr>\\n                      <tr data-ko-display=\\\"buttonVisible\\\">\\n                        <td valign=\\\"top\\\">\\n                          <table cellpadding=\\\"0\\\" border=\\\"0\\\" align=\\\"left\\\" cellspacing=\\\"0\\\" class=\\\"mobile-full\\\" style=\\\"padding-top: 4px\\\">\\n                            <tr>\\n                              <td width=\\\"auto\\\" valign=\\\"middle\\\" bgcolor=\\\"#bfbfbf\\\" align=\\\"center\\\" height=\\\"26\\\"\\n                                style=\\\"font-size: 13px; font-family: Arial, Helvetica, sans-serif; text-align:center; color: #3f3f3f; font-weight: normal;\\n                                padding-left: 18px; padding-right: 18px; background-color: #bfbfbf; border-radius: 4px;\\n                                -ko-border-radius: @[buttonStyle.radius]px;\\n                                -ko-attr-bgcolor: @buttonStyle.buttonColor; -ko-background-color: @buttonStyle.buttonColor;\\n                                -ko-font-size: @[buttonStyle.size]px; -ko-font-family: @buttonStyle.face; -ko-color: @buttonStyle.color;\\\">\\n                                <a data-ko-editable=\\\"buttonLink.text\\\" href=\\\"\\\" style=\\\"text-decoration: none; color: #3f3f3f; font-weight: normal;\\n                                  -ko-color: @buttonStyle.color; -ko-attr-href: @buttonLink.url\\\">BUTTON</a>\\n                              </td>\\n                            </tr>\\n                          </table>\\n                        </td>\\n                      </tr>\\n                    </table>\\n</div><!--[if (gte mso 9)|(lte ie 8)]></td>\\n<![endif]--><div data-ko-display=\\\"imagePos eq \'right\'\\\" data-ko-wrap=\\\"false\\\" style=\\\"width: 100%; max-width:184px; -ko-max-width:@[18 + Math.round(imageWidth)]px; display:inline-block; display: none;\\\" class=\\\"mobile-full\\\"><!--[if (gte mso 9)|(lte ie 8)]>\\n<td data-ko-display=\\\"imagePos eq \'right\'\\\" align=\\\"left\\\" valign=\\\"top\\\" width=\\\"184\\\" style=\\\"display: none; -ko-attr-width: @[18 + Math.round(imageWidth)]\\\">\\n<![endif]--><div style=\\\"display:inline-block; max-width:184px; -ko-max-width:@[18 + Math.round(imageWidth)]px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full\\\">\\n\\n                    <table class=\\\"vb-content\\\" border=\\\"0\\\" cellspacing=\\\"9\\\" cellpadding=\\\"0\\\" width=\\\"184\\\" style=\\\"width: 100%; -ko-attr-width: @[18 + Math.round(imageWidth)]\\\" align=\\\"left\\\">\\n                      <tr>\\n                        <td width=\\\"100%\\\" valign=\\\"top\\\" align=\\\"left\\\" class=\\\"links-color\\\">\\n                          <a data-ko-link=\\\"image.url\\\" href=\\\"\\\">\\n                            <img data-ko-editable=\\\"image.src\\\" border=\\\"0\\\" hspace=\\\"0\\\" vspace=\\\"0\\\" width=\\\"166\\\" data-ko-placeholder-height=\\\"130\\\" class=\\\"mobile-full\\\"\\n                              src=\\\"[PLACEHOLDER_166x130]\\\" class=\\\"mobile-full\\\"\\n                              alt=\\\"\\\" style=\\\"vertical-align:top; width: 100%; height: auto; -ko-attr-width: @imageWidth; max-width: 166px; -ko-max-width: @[imageWidth]px; -ko-attr-alt: @image.alt\\\" />\\n                          </a>\\n                        </td>\\n                      </tr>\\n                    </table>\\n\\n</div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td><![endif]-->\\n</div>\\n<!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]-->\\n\\n            </td>\\n          </tr>\\n        </table>\\n        </div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\\n      </td>\\n    </tr>\\n  </table>\\n  <!-- /sideArticleBlock -->\\n\\n  <!-- singleArticleBlock -->\\n  <table class=\\\"vb-outer\\\" width=\\\"100%\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" bgcolor=\\\"#bfbfbf\\\"\\n    style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\" data-ko-block=\\\"singleArticleBlock\\\">\\n    <tr>\\n      <td class=\\\"vb-outer\\\" align=\\\"center\\\" valign=\\\"top\\\" bgcolor=\\\"#bfbfbf\\\"\\n        style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"570\\\"><tr><td align=\\\"center\\\" valign=\\\"top\\\"><![endif]-->\\n        <div class=\\\"oldwebkit\\\">\\n        <table width=\\\"570\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"18\\\" class=\\\"vb-container fullpad\\\" bgcolor=\\\"#ffffff\\\"\\n          style=\\\"width: 100%; max-width: 570px; background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor;\\\">\\n          <tr data-ko-display=\\\"imageVisible\\\">\\n            <td width=\\\"100%\\\" valign=\\\"top\\\" align=\\\"left\\\" class=\\\"links-color\\\">\\n              <a data-ko-link=\\\"image.url\\\" href=\\\"\\\">\\n                <img data-ko-editable=\\\"image.src\\\" border=\\\"0\\\" hspace=\\\"0\\\" vspace=\\\"0\\\" width=\\\"534\\\" data-ko-placeholder-height=\\\"200\\\"\\n                  src=\\\"[PLACEHOLDER_534x200]\\\" class=\\\"mobile-full\\\"\\n                  alt=\\\"\\\" style=\\\"vertical-align:top; max-width:534px; width: 100%; height: auto;\\n                  -ko-attr-alt: @image.alt\\\" />\\n              </a>\\n            </td>\\n          </tr>\\n          <tr><td><table align=\\\"left\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"0\\\" width=\\\"100%\\\">\\n            <tr data-ko-display=\\\"titleVisible\\\">\\n              <td style=\\\"font-size: 18px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; text-align:left;\\n                -ko-font-size: @[titleTextStyle.size]px; -ko-font-family: @titleTextStyle.face; -ko-color: @titleTextStyle.color\\\">\\n                <span style=\\\"color: #3f3f3f; -ko-color: @titleTextStyle.color\\\" data-ko-editable=\\\"text\\\">\\n               Section Title\\n                </span>\\n              </td>\\n            </tr>\\n            <tr data-ko-display=\\\"titleVisible\\\">\\n              <td height=\\\"9\\\" style=\\\"font-size:1px; line-height: 1px;\\\">&nbsp;</td>\\n            </tr>\\n            <tr>\\n              <td align=\\\"left\\\" style=\\\"text-align: left; font-size: 13px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f;\\n                -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face; -ko-color: @longTextStyle.color\\\"\\n                data-ko-editable=\\\"longText\\\" class=\\\"long-text links-color\\\">\\n                <p>Far far away, behind the word mountains, far from the countries <a href=\\\"\\\">Vokalia and Consonantia</a>, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia.</p>\\n              </td>\\n            </tr>\\n            <tr data-ko-display=\\\"buttonVisible\\\">\\n              <td height=\\\"13\\\" style=\\\"font-size:1px; line-height: 1px;\\\">&nbsp;</td>\\n            </tr>\\n            <tr data-ko-display=\\\"buttonVisible\\\">\\n              <td valign=\\\"top\\\">\\n                <table cellpadding=\\\"0\\\" border=\\\"0\\\" align=\\\"left\\\" cellspacing=\\\"0\\\" class=\\\"mobile-full\\\">\\n                  <tr>\\n                    <td width=\\\"auto\\\" valign=\\\"middle\\\" bgcolor=\\\"#bfbfbf\\\" align=\\\"center\\\" height=\\\"26\\\"\\n                      style=\\\"font-size: 13px; font-family: Arial, Helvetica, sans-serif; text-align:center; color: #3f3f3f; font-weight: normal;\\n                      padding-left: 18px; padding-right: 18px; background-color: #bfbfbf; border-radius: 4px;\\n                      -ko-border-radius: @[buttonStyle.radius]px;\\n                      -ko-attr-bgcolor: @buttonStyle.buttonColor; -ko-background-color: @buttonStyle.buttonColor;\\n                      -ko-font-size: @[buttonStyle.size]px; -ko-font-family: @buttonStyle.face; -ko-color: @buttonStyle.color; \\\">\\n                      <a data-ko-editable=\\\"buttonLink.text\\\" href=\\\"\\\" style=\\\"text-decoration: none; color: #3f3f3f; font-weight: normal;\\n                        -ko-color: @buttonStyle.color; -ko-attr-href: @buttonLink.url\\\">BUTTON</a>\\n                    </td>\\n                  </tr>\\n                </table>\\n              </td>\\n            </tr>\\n          </table></td></tr>\\n        </table>\\n        </div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\\n      </td>\\n    </tr>\\n  </table>\\n  <!-- /singleArticleBlock -->\\n\\n  <!-- TitleBlock -->\\n  <table class=\\\"vb-outer\\\" width=\\\"100%\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" bgcolor=\\\"#bfbfbf\\\"\\n    style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\" data-ko-block=\\\"titleBlock\\\">\\n    <tr>\\n      <td class=\\\"vb-outer\\\" align=\\\"center\\\" valign=\\\"top\\\" bgcolor=\\\"#bfbfbf\\\"\\n        style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"570\\\"><tr><td align=\\\"center\\\" valign=\\\"top\\\"><![endif]-->\\n        <div class=\\\"oldwebkit\\\">\\n        <table width=\\\"570\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"9\\\" class=\\\"vb-container halfpad\\\" bgcolor=\\\"#ffffff\\\"\\n          style=\\\"width: 100%; max-width: 570px; background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor;\\\">\\n          <tr>\\n            <td bgcolor=\\\"#ffffff\\\" align=\\\"center\\\"\\n              style=\\\"background-color: #ffffff; font-size: 22px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; text-align: center;\\n              -ko-attr-align: @bigTitleStyle.align; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor;\\n              -ko-font-size: @[bigTitleStyle.size]px; -ko-font-family: @bigTitleStyle.face; -ko-color: @bigTitleStyle.color; -ko-text-align: @bigTitleStyle.align\\\">\\n              <span data-ko-editable=\\\"text\\\">Section Title</span>\\n            </td>\\n          </tr>\\n        </table>\\n        </div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\\n      </td>\\n    </tr>\\n  </table>\\n  <!-- /TitleBlock -->\\n\\n  <!-- textBlock -->\\n  <table class=\\\"vb-outer\\\" width=\\\"100%\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" bgcolor=\\\"#bfbfbf\\\"\\n    style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\" data-ko-block=\\\"textBlock\\\">\\n    <tr>\\n      <td class=\\\"vb-outer\\\" align=\\\"center\\\" valign=\\\"top\\\" bgcolor=\\\"#bfbfbf\\\"\\n        style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"570\\\"><tr><td align=\\\"center\\\" valign=\\\"top\\\"><![endif]-->\\n        <div class=\\\"oldwebkit\\\">\\n        <table width=\\\"570\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"18\\\" class=\\\"vb-container fullpad\\\" bgcolor=\\\"#ffffff\\\"\\n          style=\\\"width: 100%; max-width: 570px; background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor;\\\">\\n          <tr>\\n            <td align=\\\"left\\\" style=\\\"text-align: left; font-size: 13px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f;\\n              -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face; -ko-color: @longTextStyle.color\\\"\\n              data-ko-editable=\\\"longText\\\" class=\\\"long-text links-color\\\">\\n              <p>Far far away, behind the word mountains, far from the countries <a href=\\\"\\\">Vokalia and Consonantia</a>, there live the blind texts.</p>\\n              <p>Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia.</p>\\n            </td>\\n          </tr>\\n        </table>\\n        </div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\\n      </td>\\n    </tr>\\n  </table>\\n  <!-- /textBlock -->\\n\\n  <!-- tripleArticleBlock -->\\n  <table class=\\\"vb-outer\\\" width=\\\"100%\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" bgcolor=\\\"#bfbfbf\\\"\\n    style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\" data-ko-block=\\\"tripleArticleBlock\\\">\\n    <tr>\\n      <td class=\\\"vb-outer\\\" align=\\\"center\\\" valign=\\\"top\\\" bgcolor=\\\"#bfbfbf\\\"\\n        style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"570\\\"><tr><td align=\\\"center\\\" valign=\\\"top\\\"><![endif]-->\\n        <div class=\\\"oldwebkit\\\">\\n        <table width=\\\"570\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"9\\\" class=\\\"vb-row fullpad\\\" bgcolor=\\\"#ffffff\\\"\\n          style=\\\"width: 100%; max-width: 570px; background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor;\\\">\\n          <tr>\\n            <td align=\\\"center\\\" valign=\\\"top\\\" class=\\\"mobile-row\\\" style=\\\"font-size: 0\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"552\\\"><tr><![endif]-->\\n<!--[if (gte mso 9)|(lte ie 8)]><td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"184\\\"><![endif]-->\\n<div style=\\\"display:inline-block; max-width:184px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full\\\">\\n\\n                    <table class=\\\"vb-content\\\" border=\\\"0\\\" cellspacing=\\\"9\\\" cellpadding=\\\"0\\\" width=\\\"184\\\" style=\\\"width: 100%\\\" align=\\\"left\\\">\\n                      <tr data-ko-display=\\\"imageVisible\\\">\\n                        <td width=\\\"100%\\\" valign=\\\"top\\\" align=\\\"left\\\" class=\\\"links-color\\\" style=\\\"padding-bottom: 9px\\\">\\n                          <a data-ko-link=\\\"leftImage.url\\\" href=\\\"\\\">\\n                            <img data-ko-editable=\\\"leftImage.src\\\" border=\\\"0\\\" hspace=\\\"0\\\" vspace=\\\"0\\\" width=\\\"166\\\" height=\\\"90\\\"\\n                              src=\\\"[PLACEHOLDER_166x90]\\\" class=\\\"mobile-full\\\"\\n                             alt=\\\"\\\" style=\\\"vertical-align:top; width: 100%; height: auto; -ko-attr-height: @imageHeight;\\n                               -ko-attr-alt: @leftImage.alt\\\" />\\n                          </a>\\n                        </td>\\n                      </tr>\\n                      <tr data-ko-display=\\\"titleVisible\\\">\\n                        <td style=\\\"font-size: 18px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; text-align:left;\\n                          -ko-font-size: @[titleTextStyle.size]px; -ko-font-family: @titleTextStyle.face; -ko-color: @titleTextStyle.color\\\">\\n                          <span style=\\\"color: #3f3f3f; -ko-color: @titleTextStyle.color\\\" data-ko-editable=\\\"leftTitleText\\\">Title\\n                          </span>\\n                        </td>\\n                      </tr>\\n                      <tr>\\n                        <td align=\\\"left\\\" style=\\\"text-align: left; font-size: 13px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f;\\n                          -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face; -ko-color: @longTextStyle.color\\\"\\n                          data-ko-editable=\\\"leftLongText\\\" class=\\\"long-text links-color\\\">\\n                          <p>Far far away, behind the word mountains, far from the countries <a href=\\\"\\\">Vokalia and Consonantia</a>, there live the blind texts. </p>\\n                        </td>\\n                      </tr>\\n                      <tr data-ko-display=\\\"buttonVisible\\\">\\n                        <td valign=\\\"top\\\">\\n                          <table cellpadding=\\\"0\\\" border=\\\"0\\\" align=\\\"left\\\" cellspacing=\\\"0\\\" class=\\\"mobile-full\\\" style=\\\"padding-top: 4px\\\">\\n                            <tr>\\n                              <td width=\\\"auto\\\" valign=\\\"middle\\\" bgcolor=\\\"#bfbfbf\\\" align=\\\"center\\\" height=\\\"26\\\"\\n                                style=\\\"font-size: 13px; font-family: Arial, Helvetica, sans-serif; text-align:center; color: #3f3f3f; font-weight: normal;\\n                                padding-left: 18px; padding-right: 18px; background-color: #bfbfbf; border-radius: 4px;\\n                                -ko-border-radius: @[buttonStyle.radius]px;\\n                                -ko-attr-bgcolor: @buttonStyle.buttonColor; -ko-background-color: @buttonStyle.buttonColor;\\n                                -ko-font-size: @[buttonStyle.size]px; -ko-font-family: @buttonStyle.face; -ko-color: @buttonStyle.color; \\\">\\n                                <a data-ko-editable=\\\"leftButtonLink.text\\\" href=\\\"\\\" style=\\\"text-decoration: none; color: #3f3f3f; font-weight: normal;\\n                                  -ko-color: @buttonStyle.color; -ko-attr-href: @leftButtonLink.url\\\">BUTTON</a>\\n                              </td>\\n                            </tr>\\n                          </table>\\n                        </td>\\n                      </tr>\\n                    </table>\\n\\n</div><!--[if (gte mso 9)|(lte ie 8)]></td>\\n<td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"184\\\">\\n<![endif]--><div style=\\\"display:inline-block; max-width:184px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full\\\">\\n\\n                    <table class=\\\"vb-content\\\" border=\\\"0\\\" cellspacing=\\\"9\\\" cellpadding=\\\"0\\\" width=\\\"184\\\" style=\\\"width: 100%\\\" align=\\\"left\\\">\\n                      <tr data-ko-display=\\\"imageVisible\\\">\\n                        <td width=\\\"100%\\\" valign=\\\"top\\\" align=\\\"left\\\" class=\\\"links-color\\\" style=\\\"padding-bottom: 9px\\\">\\n                          <a data-ko-link=\\\"middleImage.url\\\">\\n                            <img data-ko-editable=\\\"middleImage.src\\\" border=\\\"0\\\" hspace=\\\"0\\\" vspace=\\\"0\\\" width=\\\"166\\\" height=\\\"90\\\"\\n                              src=\\\"[PLACEHOLDER_166x90]\\\" class=\\\"mobile-full\\\"\\n                              alt=\\\"\\\" style=\\\"vertical-align:top; width: 100%; height: auto; -ko-attr-height: @imageHeight;\\n                              -ko-attr-alt: @middleImage.alt\\\" />\\n                          </a>\\n                        </td>\\n                      </tr>\\n                      <tr data-ko-display=\\\"titleVisible\\\">\\n                        <td style=\\\"font-size: 18px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; text-align:left;\\n                          -ko-font-size: @[titleTextStyle.size]px; -ko-font-family: @titleTextStyle.face; -ko-color: @titleTextStyle.color\\\">\\n                          <span style=\\\"color: #3f3f3f; -ko-color: @titleTextStyle.color\\\"  data-ko-editable=\\\"middleTitleText\\\">\\n                         Title\\n                          </span>\\n                        </td>\\n                      </tr>\\n                      <tr>\\n                        <td align=\\\"left\\\" style=\\\"text-align: left; font-size: 13px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f;\\n                          -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face; -ko-color: @longTextStyle.color\\\"\\n                          data-ko-editable=\\\"middleLongText\\\" class=\\\"long-text links-color\\\">\\n                          <p>Far far away, behind the word mountains, far from the countries <a href=\\\"\\\">Vokalia and Consonantia</a>, there live the blind texts. </p>\\n                        </td>\\n                      </tr>\\n                      <tr data-ko-display=\\\"buttonVisible\\\">\\n                        <td valign=\\\"top\\\">\\n                          <table cellpadding=\\\"0\\\" border=\\\"0\\\" align=\\\"left\\\" cellspacing=\\\"0\\\" class=\\\"mobile-full\\\" style=\\\"padding-top: 4px\\\">\\n                            <tr>\\n                              <td width=\\\"auto\\\" valign=\\\"middle\\\" bgcolor=\\\"#bfbfbf\\\" align=\\\"center\\\" height=\\\"26\\\"\\n                                style=\\\"font-size: 13px; font-family: Arial, Helvetica, sans-serif; text-align:center; color: #3f3f3f; font-weight: normal;\\n                                padding-left: 18px; padding-right: 18px; background-color: #bfbfbf; border-radius: 4px;\\n                                -ko-border-radius: @[buttonStyle.radius]px;\\n                                -ko-attr-bgcolor: @buttonStyle.buttonColor; -ko-background-color: @buttonStyle.buttonColor;\\n                                -ko-font-size: @[buttonStyle.size]px; -ko-font-family: @buttonStyle.face; -ko-color: @buttonStyle.color; \\\">\\n                                <a data-ko-editable=\\\"middleButtonLink.text\\\" href=\\\"\\\" style=\\\"text-decoration: none; color: #3f3f3f; font-weight: normal;\\n                                  -ko-color: @buttonStyle.color; -ko-attr-href: @middleButtonLink.url\\\">BUTTON</a>\\n                              </td>\\n                            </tr>\\n                          </table>\\n                        </td>\\n                      </tr>\\n                    </table>\\n\\n</div><!--[if (gte mso 9)|(lte ie 8)]></td>\\n<td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"184\\\">\\n<![endif]--><div style=\\\"display:inline-block; max-width:184px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full\\\">\\n\\n                    <table class=\\\"vb-content\\\" border=\\\"0\\\" cellspacing=\\\"9\\\" cellpadding=\\\"0\\\" width=\\\"184\\\" style=\\\"width: 100%\\\" align=\\\"right\\\">\\n                      <tr data-ko-display=\\\"imageVisible\\\">\\n                        <td width=\\\"100%\\\" valign=\\\"top\\\" align=\\\"left\\\" class=\\\"links-color\\\" style=\\\"padding-bottom: 9px\\\">\\n                          <a data-ko-link=\\\"rightImage.url\\\">\\n                            <img data-ko-editable=\\\"rightImage.src\\\" border=\\\"0\\\" hspace=\\\"0\\\" vspace=\\\"0\\\" width=\\\"166\\\" height=\\\"90\\\"\\n                              src=\\\"[PLACEHOLDER_166x90]\\\" class=\\\"mobile-full\\\"\\n                              alt=\\\"\\\" style=\\\"vertical-align:top; width: 100%; height: auto; -ko-attr-height: @imageHeight;\\n                              -ko-attr-alt: @rightImage.alt\\\" />\\n                          </a>\\n                        </td>\\n                      </tr>\\n                      <tr data-ko-display=\\\"titleVisible\\\">\\n                        <td style=\\\"font-size: 18px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; text-align:left;\\n                          -ko-font-size: @[titleTextStyle.size]px; -ko-font-family: @titleTextStyle.face; -ko-color: @titleTextStyle.color\\\">\\n                          <span style=\\\"color: #3f3f3f; -ko-color: @titleTextStyle.color\\\" data-ko-editable=\\\"rightTitleText\\\">\\n                         Title\\n                          </span>\\n                        </td>\\n                      </tr>\\n                      <tr>\\n                        <td align=\\\"left\\\" style=\\\"text-align: left; font-size: 13px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f;\\n                          -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face; -ko-color: @longTextStyle.color\\\"\\n                          data-ko-editable=\\\"rightLongText\\\" class=\\\"long-text links-color\\\">\\n                          <p>Far far away, behind the word mountains, far from the countries <a href=\\\"\\\">Vokalia and Consonantia</a>, there live the blind texts. </p>\\n                        </td>\\n                      </tr>\\n                      <tr data-ko-display=\\\"buttonVisible\\\">\\n                        <td valign=\\\"top\\\">\\n                          <table cellpadding=\\\"0\\\" border=\\\"0\\\" align=\\\"left\\\" cellspacing=\\\"0\\\" class=\\\"mobile-full\\\" style=\\\"padding-top: 4px\\\">\\n                            <tr>\\n                              <td width=\\\"auto\\\" valign=\\\"middle\\\" bgcolor=\\\"#bfbfbf\\\" align=\\\"center\\\" height=\\\"26\\\"\\n                                style=\\\"font-size: 13px; font-family: Arial, Helvetica, sans-serif; text-align:center; color: #3f3f3f; font-weight: normal;\\n                                padding-left: 18px; padding-right: 18px; background-color: #bfbfbf; border-radius: 4px;\\n                                -ko-border-radius: @[buttonStyle.radius]px;\\n                                -ko-attr-bgcolor: @buttonStyle.buttonColor; -ko-background-color: @buttonStyle.buttonColor;\\n                                -ko-font-size: @[buttonStyle.size]px; -ko-font-family: @buttonStyle.face; -ko-color: @buttonStyle.color;\\\">\\n                                <a data-ko-editable=\\\"rightButtonLink.text\\\" href=\\\"\\\" style=\\\"text-decoration: none; color: #3f3f3f; font-weight: normal;\\n                                  -ko-color: @buttonStyle.color; -ko-attr-href: @rightButtonLink.url\\\">BUTTON</a>\\n                              </td>\\n                            </tr>\\n                          </table>\\n                        </td>\\n                      </tr>\\n                    </table>\\n\\n</div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td><![endif]-->\\n<!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]-->\\n\\n            </td>\\n          </tr>\\n        </table>\\n        </div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\\n      </td>\\n    </tr>\\n  </table>\\n  <!-- /tripleArticleBlock -->\\n\\n  <!-- doubleArticleBlock -->\\n  <table class=\\\"vb-outer\\\" width=\\\"100%\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" bgcolor=\\\"#bfbfbf\\\"\\n    style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\" data-ko-block=\\\"doubleArticleBlock\\\">\\n    <tr>\\n      <td class=\\\"vb-outer\\\" align=\\\"center\\\" valign=\\\"top\\\" bgcolor=\\\"#bfbfbf\\\"\\n        style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"570\\\"><tr><td align=\\\"center\\\" valign=\\\"top\\\"><![endif]-->\\n        <div class=\\\"oldwebkit\\\">\\n        <table width=\\\"570\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"9\\\" class=\\\"vb-row fullpad\\\" bgcolor=\\\"#ffffff\\\"\\n          style=\\\"width: 100%; max-width: 570px; background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor;\\\">\\n          <tr>\\n            <td align=\\\"center\\\" valign=\\\"top\\\" style=\\\"font-size: 0\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"552\\\"><tr><![endif]-->\\n<!--[if (gte mso 9)|(lte ie 8)]><td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"276\\\"><![endif]-->\\n<div style=\\\"display:inline-block; max-width:276px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full\\\">\\n\\n                    <table class=\\\"vb-content\\\" border=\\\"0\\\" cellspacing=\\\"9\\\" cellpadding=\\\"0\\\" width=\\\"276\\\" style=\\\"width: 100%\\\" align=\\\"left\\\">\\n                      <tr data-ko-display=\\\"imageVisible\\\">\\n                        <td width=\\\"100%\\\" align=\\\"left\\\" class=\\\"links-color\\\" style=\\\"padding-bottom: 9px\\\">\\n                          <a data-ko-link=\\\"leftImage.url\\\">\\n                            <img data-ko-editable=\\\"leftImage.src\\\" border=\\\"0\\\" hspace=\\\"0\\\" vspace=\\\"0\\\" width=\\\"258\\\" height=\\\"100\\\"\\n                              src=\\\"[PLACEHOLDER_258x100]\\\" class=\\\"mobile-full\\\"\\n                              alt=\\\"\\\" style=\\\"vertical-align:top; width: 100%; height: auto; -ko-attr-height: @imageHeight;\\n                              -ko-attr-alt: @leftImage.alt\\\" />\\n                          </a>\\n                        </td>\\n                      </tr>\\n                      <tr data-ko-display=\\\"titleVisible\\\">\\n                        <td style=\\\"font-size: 18px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; text-align:left;\\n                          -ko-font-size: @[titleTextStyle.size]px; -ko-font-family: @titleTextStyle.face; -ko-color: @titleTextStyle.color\\\">\\n                          <span style=\\\"color: #3f3f3f; -ko-color: @titleTextStyle.color\\\" data-ko-editable=\\\"leftTitleText\\\">\\n                          Title\\n                          </span>\\n                        </td>\\n                      </tr>\\n                      <tr>\\n                        <td align=\\\"left\\\" style=\\\"text-align: left; font-size: 13px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f;\\n                          -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face; -ko-color: @longTextStyle.color\\\"\\n                          data-ko-editable=\\\"leftLongText\\\" class=\\\"long-text links-color\\\">\\n                          <p>Far far away, behind the word mountains, far from the countries <a href=\\\"\\\">Vokalia and Consonantia</a>, there live the blind texts. </p>\\n                        </td>\\n                      </tr>\\n                      <tr data-ko-display=\\\"buttonVisible\\\">\\n                        <td valign=\\\"top\\\">\\n                          <table cellpadding=\\\"0\\\" border=\\\"0\\\" align=\\\"left\\\" cellspacing=\\\"0\\\" class=\\\"mobile-full\\\" style=\\\"padding-top: 4px;\\\">\\n                            <tr>\\n                              <td width=\\\"auto\\\" valign=\\\"middle\\\" bgcolor=\\\"#bfbfbf\\\" align=\\\"center\\\" height=\\\"26\\\"\\n                                style=\\\"font-size: 13px; font-family: Arial, Helvetica, sans-serif; text-align:center; color: #3f3f3f; font-weight: normal;\\n                                padding-left: 18px; padding-right: 18px; background-color: #bfbfbf; border-radius: 4px;\\n                                -ko-border-radius: @[buttonStyle.radius]px;\\n                                -ko-attr-bgcolor: @buttonStyle.buttonColor; -ko-background-color: @buttonStyle.buttonColor;\\n                                -ko-font-size: @[buttonStyle.size]px; -ko-font-family: @buttonStyle.face; -ko-color: @buttonStyle.color; \\\">\\n                                <a data-ko-editable=\\\"leftButtonLink.text\\\" href=\\\"\\\" style=\\\"text-decoration: none; color: #3f3f3f; font-weight: normal;\\n                                  -ko-color: @buttonStyle.color; -ko-attr-href: @leftButtonLink.url\\\">BUTTON</a>\\n                              </td>\\n                            </tr>\\n                          </table>\\n                        </td>\\n                      </tr>\\n                    </table>\\n\\n</div><!--[if (gte mso 9)|(lte ie 8)]></td>\\n<td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"276\\\">\\n<![endif]--><div style=\\\"display:inline-block; max-width:276px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full\\\">\\n\\n                    <table class=\\\"vb-content\\\" border=\\\"0\\\" cellspacing=\\\"9\\\" cellpadding=\\\"0\\\" width=\\\"276\\\" style=\\\"width: 100%\\\" align=\\\"right\\\">\\n                      <tr data-ko-display=\\\"imageVisible\\\">\\n                        <td width=\\\"100%\\\" valign=\\\"top\\\" align=\\\"left\\\" class=\\\"links-color\\\" style=\\\"padding-bottom: 9px\\\">\\n                          <a data-ko-link=\\\"rightImage.url\\\">\\n                            <img data-ko-editable=\\\"rightImage.src\\\" border=\\\"0\\\" hspace=\\\"0\\\" vspace=\\\"0\\\" width=\\\"258\\\" height=\\\"100\\\"\\n                              src=\\\"[PLACEHOLDER_258x100]\\\" class=\\\"mobile-full\\\"\\n                              alt=\\\"\\\" style=\\\"vertical-align:top; width: 100%; height: auto; -ko-attr-height: @imageHeight;\\n                              -ko-attr-alt: @rightImage.alt\\\" />\\n                          </a>\\n                        </td>\\n                      </tr>\\n                      <tr data-ko-display=\\\"titleVisible\\\">\\n                        <td style=\\\"font-size: 18px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; text-align:left;\\n                          -ko-font-size: @[titleTextStyle.size]px; -ko-font-family: @titleTextStyle.face; -ko-color: @titleTextStyle.color\\\">\\n                          <span style=\\\"color: #3f3f3f; -ko-color: @titleTextStyle.color\\\" data-ko-editable=\\\"rightTitleText\\\">\\n                         Title\\n                          </span>\\n                        </td>\\n                      </tr>\\n                      <tr>\\n                        <td align=\\\"left\\\" style=\\\"text-align: left; font-size: 13px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f;\\n                          -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face; -ko-color: @longTextStyle.color\\\"\\n                          data-ko-editable=\\\"rightLongText\\\" class=\\\"long-text links-color\\\">\\n                          <p>Far far away, behind the word mountains, far from the countries <a href=\\\"\\\">Vokalia and Consonantia</a>, there live the blind texts.</p>\\n                        </td>\\n                      </tr>\\n                      <tr data-ko-display=\\\"buttonVisible\\\">\\n                        <td valign=\\\"top\\\">\\n                          <table cellpadding=\\\"0\\\" border=\\\"0\\\" align=\\\"left\\\" cellspacing=\\\"0\\\" class=\\\"mobile-full\\\" style=\\\"padding-top: 4px;\\\">\\n                            <tr>\\n                              <td width=\\\"auto\\\" valign=\\\"middle\\\" bgcolor=\\\"#bfbfbf\\\" align=\\\"center\\\" height=\\\"26\\\"\\n                                style=\\\"font-size: 13px; font-family: Arial, Helvetica, sans-serif; text-align:center; color: #3f3f3f; font-weight: normal;\\n                                padding-left: 18px; padding-right: 18px; background-color: #bfbfbf; border-radius: 4px;\\n                                -ko-border-radius: @[buttonStyle.radius]px;\\n                                -ko-attr-bgcolor: @buttonStyle.buttonColor; -ko-background-color: @buttonStyle.buttonColor;\\n                                -ko-font-size: @[buttonStyle.size]px; -ko-font-family: @buttonStyle.face; -ko-color: @buttonStyle.color; \\\">\\n                                <a data-ko-editable=\\\"rightButtonLink.text\\\" href=\\\"\\\" style=\\\"text-decoration: none; color: #3f3f3f; font-weight: normal;\\n                                  -ko-color: @buttonStyle.color; -ko-attr-href: @rightButtonLink.url\\\">BUTTON</a>\\n                              </td>\\n                            </tr>\\n                          </table>\\n                        </td>\\n                      </tr>\\n                    </table>\\n\\n</div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td><![endif]-->\\n<!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]-->\\n\\n            </td>\\n          </tr>\\n        </table>\\n        </div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\\n      </td>\\n    </tr>\\n  </table>\\n  <!-- /doubleArticleBlock -->\\n\\n  <!-- hrBlock -->\\n  <table class=\\\"vb-outer\\\" width=\\\"100%\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" bgcolor=\\\"#bfbfbf\\\"\\n    style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\" data-ko-block=\\\"hrBlock\\\">\\n    <tr>\\n      <td class=\\\"vb-outer\\\" align=\\\"center\\\" valign=\\\"top\\\" bgcolor=\\\"#bfbfbf\\\"\\n        style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"570\\\"><tr><td align=\\\"center\\\" valign=\\\"top\\\"><![endif]-->\\n        <div class=\\\"oldwebkit\\\">\\n        <table width=\\\"570\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"9\\\" class=\\\"vb-container halfpad\\\" bgcolor=\\\"#ffffff\\\"\\n          style=\\\"width: 100%; max-width: 570px; background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor;\\\">\\n          <tr>\\n            <td valign=\\\"top\\\" bgcolor=\\\"#ffffff\\\" style=\\\"background-color: #ffffff;\\n              -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor\\\" align=\\\"center\\\">\\n              <table width=\\\"100%\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" border=\\\"0\\\"\\n                style=\\\"width:100%; -ko-width: @[hrStyle.hrWidth]%; -ko-attr-width: @[hrStyle.hrWidth]%\\\">\\n                <tr>\\n                  <td width=\\\"100%\\\" height=\\\"1\\\" style=\\\"font-size:1px; line-height: 1px; width: 100%; background-color: #3f3f3f;\\n                  -ko-background-color: @hrStyle.color; -ko-attr-height: @hrStyle.hrHeight; -ko-line-height: @[hrStyle.hrHeight]px\\\">&nbsp;</td>\\n                </tr>\\n              </table>\\n            </td>\\n          </tr>\\n        </table>\\n        </div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\\n      </td>\\n    </tr>\\n  </table>\\n  <!-- /hrBlock -->\\n\\n  <!-- buttonBlock -->\\n  <table class=\\\"vb-outer\\\" width=\\\"100%\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" bgcolor=\\\"#bfbfbf\\\"\\n    style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\"  data-ko-block=\\\"buttonBlock\\\">\\n    <tr>\\n      <td class=\\\"vb-outer\\\" align=\\\"center\\\" valign=\\\"top\\\" bgcolor=\\\"#bfbfbf\\\"\\n        style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"570\\\"><tr><td align=\\\"center\\\" valign=\\\"top\\\"><![endif]-->\\n        <div class=\\\"oldwebkit\\\">\\n        <table width=\\\"570\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"18\\\" class=\\\"vb-container fullpad\\\" bgcolor=\\\"#ffffff\\\"\\n          style=\\\"width: 100%; max-width: 570px; background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor;\\\">\\n          <tr>\\n            <td valign=\\\"top\\\" bgcolor=\\\"#ffffff\\\" style=\\\"background-color: #ffffff;\\n              -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor\\\" align=\\\"center\\\">\\n\\n              <table cellpadding=\\\"0\\\" border=\\\"0\\\" align=\\\"center\\\" cellspacing=\\\"0\\\" class=\\\"mobile-full\\\">\\n                <tr>\\n                  <td width=\\\"auto\\\" valign=\\\"middle\\\" bgcolor=\\\"#bfbfbf\\\" align=\\\"center\\\" height=\\\"50\\\"\\n                    style=\\\"font-size:22px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; font-weight: normal;\\n                    padding-left: 14px; padding-right: 14px; background-color: #bfbfbf; border-radius: 4px;\\n                    -ko-attr-bgcolor: @bigButtonStyle.buttonColor; -ko-background-color: @bigButtonStyle.buttonColor;\\n                     -ko-border-radius: @[bigButtonStyle.radius]px;\\n                    -ko-font-size: @[bigButtonStyle.size]px; -ko-font-family: @bigButtonStyle.face; -ko-color: @bigButtonStyle.color; \\\">\\n                    <a data-ko-link=\\\"link.url\\\" data-ko-editable=\\\"link.text\\\" href=\\\"\\\" style=\\\"text-decoration: none; color: #3f3f3f; font-weight: normal;\\n                      -ko-color: @bigButtonStyle.color;\\\">BUTTON</a>\\n                  </td>\\n                </tr>\\n              </table>\\n\\n            </td>\\n          </tr>\\n        </table>\\n        </div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\\n      </td>\\n    </tr>\\n  </table>\\n  <!-- /buttonBlock -->\\n\\n  <!-- imageBlock  -->\\n  <table class=\\\"vb-outer\\\" width=\\\"100%\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" bgcolor=\\\"#bfbfbf\\\" style=\\\"background-color: #bfbfbf;\\n    -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\" data-ko-block=\\\"imageBlock\\\">\\n    <tr>\\n      <td class=\\\"vb-outer\\\" valign=\\\"top\\\" align=\\\"center\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"570\\\"><tr><td align=\\\"center\\\" valign=\\\"top\\\"><![endif]-->\\n        <div class=\\\"oldwebkit\\\">\\n        <table data-ko-display=\\\"gutterVisible eq false\\\" width=\\\"570\\\" class=\\\"vb-container fullwidth\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" bgcolor=\\\"#ffffff\\\" align=\\\"center\\\"\\n          cellspacing=\\\"0\\\" style=\\\"width: 100%; max-width: 570px; background-color: #ffffff; -ko-background-color: @backgroundColor; -ko-attr-bgcolor: @backgroundColor;\\\">\\n          <tr>\\n            <td valign=\\\"top\\\" align=\\\"center\\\">\\n              <a data-ko-link=\\\"image.url\\\" href=\\\"\\\" style=\\\"text-decoration: none;\\\"><img data-ko-editable=\\\"image.src\\\"\\n                  hspace=\\\"0\\\" border=\\\"0\\\" vspace=\\\"0\\\" width=\\\"570\\\" data-ko-placeholder-height=\\\"200\\\"\\n                  src=\\\"[PLACEHOLDER_570x200]\\\" class=\\\"mobile-full\\\"\\n                  alt=\\\"\\\" style=\\\"max-width: 570px; display: block; border-radius: 0px; width: 100%; height: auto; font-size: 13px;\\n                  font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px;\\n                  -ko-font-family: @longTextStyle.face; -ko-color: @longTextStyle.color; -ko-attr-alt: @image.alt;\\\" /></a>\\n            </td>\\n          </tr>\\n        </table>\\n        <table data-ko-display=\\\"gutterVisible\\\" width=\\\"570\\\" class=\\\"vb-container fullpad\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" bgcolor=\\\"#ffffff\\\" align=\\\"center\\\"\\n          cellspacing=\\\"18\\\" style=\\\"width: 100%; max-width: 570px; background-color: #ffffff; -ko-background-color: @backgroundColor; -ko-attr-bgcolor: @backgroundColor; display: none;\\\">\\n          <tr>\\n            <td valign=\\\"top\\\" align=\\\"center\\\">\\n              <a data-ko-link=\\\"image.url\\\" href=\\\"\\\" style=\\\"text-decoration: none;\\\"><img data-ko-editable=\\\"image.src\\\"\\n                  hspace=\\\"0\\\" border=\\\"0\\\" vspace=\\\"0\\\" width=\\\"534\\\" data-ko-placeholder-height=\\\"280\\\"\\n                  src=\\\"[PLACEHOLDER_534x280]\\\" class=\\\"mobile-full\\\"\\n                  alt=\\\"\\\" style=\\\"max-width: 534px; display: block; border-radius: 0px; width: 100%; height: auto; font-size: 13px;\\n                  font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px;\\n                  -ko-font-family: @longTextStyle.face; -ko-color: @longTextStyle.color; -ko-attr-alt: @image.alt;\\\" /></a>\\n            </td>\\n          </tr>\\n        </table>\\n        </div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\\n      </td>\\n    </tr>\\n  </table>\\n  <!-- imageBlock -->\\n\\n  <!-- doubleImageBlock -->\\n  <table class=\\\"vb-outer\\\" width=\\\"100%\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" bgcolor=\\\"#bfbfbf\\\" style=\\\"background-color: #bfbfbf;\\n    -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\" data-ko-block=\\\"doubleImageBlock\\\">\\n    <tr>\\n      <td class=\\\"vb-outer\\\" align=\\\"center\\\" valign=\\\"top\\\" bgcolor=\\\"#bfbfbf\\\"\\n        style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\">\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"570\\\"><tr><td align=\\\"center\\\" valign=\\\"top\\\"><![endif]-->\\n        <div class=\\\"oldwebkit\\\">\\n        <table data-ko-display=\\\"gutterVisible eq false\\\" width=\\\"570\\\" class=\\\"vb-container fullwidth\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" bgcolor=\\\"#ffffff\\\" align=\\\"center\\\"\\n          cellspacing=\\\"0\\\" style=\\\"width: 100%; max-width: 570px; background-color: #ffffff; -ko-background-color: @backgroundColor; -ko-attr-bgcolor: @backgroundColor;\\\">\\n          <tr>\\n            <td valign=\\\"top\\\" align=\\\"center\\\" class=\\\"mobile-row\\\" style=\\\"font-size: 0\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"570\\\"><tr><![endif]-->\\n<!--[if (gte mso 9)|(lte ie 8)]><td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"285\\\"><![endif]-->\\n<div style=\\\"display:inline-block; max-width:285px; vertical-align:top; width:100%; width:100%; \\\" class=\\\"mobile-full\\\">\\n              <a data-ko-link=\\\"leftImage.url\\\" href=\\\"\\\" style=\\\"text-decoration: none;\\\"><img data-ko-editable=\\\"leftImage.src\\\"\\n                  hspace=\\\"0\\\" align=\\\"left\\\" border=\\\"0\\\" vspace=\\\"0\\\" width=\\\"285\\\" height=\\\"180\\\" class=\\\"mobile-full\\\"\\n                  src=\\\"[PLACEHOLDER_285x180]\\\"\\n                  alt=\\\"\\\" style=\\\"display: block; border-radius: 0px; width: 100%; height: auto;font-size: 13px;\\n                  font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face;\\n                  -ko-color: @longTextStyle.color; -ko-attr-height: @imageHeight; -ko-attr-alt: @leftImage.alt;\\\" /></a>\\n</div><!--[if (gte mso 9)|(lte ie 8)]></td>\\n<td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"285\\\">\\n<![endif]--><div style=\\\"display:inline-block; max-width:285px; vertical-align:top; width:100%; width:100%; \\\" class=\\\"mobile-full\\\">\\n              <a data-ko-link=\\\"rightImage.url\\\" href=\\\"\\\" style=\\\"text-decoration: none;\\\"><img data-ko-editable=\\\"rightImage.src\\\"\\n                  hspace=\\\"0\\\" align=\\\"right\\\" border=\\\"0\\\" vspace=\\\"0\\\" width=\\\"285\\\" height=\\\"180\\\" class=\\\"mobile-full\\\"\\n                  src=\\\"[PLACEHOLDER_285x180]\\\"\\n                  alt=\\\"\\\" style=\\\"display: block; border-radius: 0px; width: 100%; height: auto;font-size: 13px;\\n                  font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face;\\n                  -ko-color: @longTextStyle.color; -ko-attr-height: @imageHeight; -ko-attr-alt: @rightImage.alt;\\\" /></a>\\n</div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td><![endif]-->\\n<!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]-->\\n            </td>\\n          </tr>\\n        </table>\\n        <table data-ko-display=\\\"gutterVisible\\\" width=\\\"570\\\" class=\\\"vb-row fullpad\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"9\\\" bgcolor=\\\"#ffffff\\\"\\n            style=\\\"width: 100%; max-width: 570px; background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor; display: none;\\\">\\n          <tr>\\n            <td align=\\\"center\\\" valign=\\\"top\\\" bgcolor=\\\"#ffffff\\\" style=\\\"background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor; font-size: 0\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"552\\\"><tr><![endif]-->\\n<!--[if (gte mso 9)|(lte ie 8)]><td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"276\\\"><![endif]-->\\n<div style=\\\"display:inline-block; max-width:276px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full\\\">\\n\\n              <table class=\\\"vb-content\\\" width=\\\"276\\\" style=\\\"width: 100%\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"9\\\" align=\\\"left\\\">\\n                <tr>\\n                  <td valign=\\\"top\\\">\\n                    <a data-ko-link=\\\"leftImage.url\\\" href=\\\"\\\" style=\\\"text-decoration: none;\\\">\\n                      <img data-ko-editable=\\\"leftImage.src\\\"\\n                        hspace=\\\"0\\\" align=\\\"left\\\" border=\\\"0\\\" vspace=\\\"0\\\" width=\\\"258\\\" height=\\\"180\\\"\\n                        src=\\\"[PLACEHOLDER_258x180]\\\" class=\\\"mobile-full\\\"\\n                        alt=\\\"\\\" style=\\\"display: block; border-radius: 0px; width: 100%; height: auto;font-size: 13px;\\n                        font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face;\\n                        -ko-color: @longTextStyle.color; -ko-attr-height: @imageHeight; -ko-attr-alt: @leftImage.alt;\\\" /></a>\\n                  </td>\\n                </tr>\\n              </table>\\n\\n</div><!--[if (gte mso 9)|(lte ie 8)]></td>\\n<td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"276\\\">\\n<![endif]--><div style=\\\"display:inline-block; max-width:276px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full\\\">\\n\\n              <table class=\\\"vb-content\\\" width=\\\"276\\\" style=\\\"width: 100%\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"9\\\" align=\\\"right\\\">\\n                <tr>\\n                  <td valign=\\\"top\\\">\\n                    <a data-ko-link=\\\"rightImage.url\\\" href=\\\"\\\" style=\\\"text-decoration: none;\\\"><img data-ko-editable=\\\"rightImage.src\\\"\\n                        hspace=\\\"0\\\" align=\\\"right\\\" border=\\\"0\\\" vspace=\\\"0\\\" width=\\\"258\\\" height=\\\"180\\\"\\n                        src=\\\"[PLACEHOLDER_258x180]\\\" class=\\\"mobile-full\\\"\\n                        alt=\\\"\\\" style=\\\"display: block; border-radius: 0px; width: 100%; height: auto;font-size: 13px;\\n                        font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face;\\n                        -ko-color: @longTextStyle.color; -ko-attr-height: @imageHeight; -ko-attr-alt: @rightImage.alt;\\\" /></a>\\n                  </td>\\n                </tr>\\n              </table>\\n\\n</div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td><![endif]-->\\n<!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]-->\\n\\n            </td>\\n          </tr>\\n        </table>\\n        </div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\\n      </td>\\n    </tr>\\n  </table>\\n  <!-- /doubleImageBlock -->\\n\\n  <!--  tripleImageBlock -->\\n  <table class=\\\"vb-outer\\\" width=\\\"100%\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" bgcolor=\\\"#bfbfbf\\\" style=\\\"background-color: #bfbfbf;\\n    -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\" data-ko-block=\\\"tripleImageBlock\\\">\\n    <tr>\\n      <td class=\\\"vb-outer\\\" valign=\\\"top\\\" align=\\\"center\\\" style=\\\"\\\">\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"570\\\"><tr><td align=\\\"center\\\" valign=\\\"top\\\"><![endif]-->\\n        <div class=\\\"oldwebkit\\\">\\n        <table data-ko-display=\\\"gutterVisible eq false\\\" width=\\\"570\\\" class=\\\"vb-container fullwidth\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" bgcolor=\\\"#ffffff\\\" align=\\\"center\\\"\\n          cellspacing=\\\"0\\\" style=\\\"width: 100%; max-width: 570px; background-color: #ffffff; -ko-background-color: @backgroundColor; -ko-attr-bgcolor: @backgroundColor;\\\">\\n          <tr>\\n            <td valign=\\\"top\\\" align=\\\"center\\\" class=\\\"mobile-row\\\" style=\\\"font-size: 0\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"570\\\"><tr><![endif]-->\\n<!--[if (gte mso 9)|(lte ie 8)]><td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"190\\\"><![endif]-->\\n<div style=\\\"display:inline-block; max-width:190px; vertical-align:top; width:100%; \\\" class=\\\"mobile-full\\\">\\n              <a data-ko-link=\\\"leftImage.url\\\" href=\\\"\\\" style=\\\"text-decoration: none;\\\"><img data-ko-editable=\\\"leftImage.src\\\"\\n                  hspace=\\\"0\\\" align=\\\"left\\\" border=\\\"0\\\" vspace=\\\"0\\\" width=\\\"190\\\" height=\\\"160\\\" class=\\\"mobile-full\\\"\\n                  src=\\\"[PLACEHOLDER_190x160]\\\"\\n                  alt=\\\"\\\" style=\\\"display: block; border-radius: 0px; width: 100%; height: auto;font-size: 13px;\\n                  font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face;\\n                  -ko-color: @longTextStyle.color; -ko-attr-height: @imageHeight; -ko-attr-alt: @leftImage.alt;\\\" /></a>\\n</div><!--[if (gte mso 9)|(lte ie 8)]></td>\\n<td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"190\\\">\\n<![endif]--><div style=\\\"display:inline-block; max-width:190px; vertical-align:top; width:100%; \\\" class=\\\"mobile-full\\\">\\n              <a data-ko-link=\\\"middleImage.url\\\" href=\\\"\\\" style=\\\"text-decoration: none;\\\"><img data-ko-editable=\\\"middleImage.src\\\"\\n                  hspace=\\\"0\\\" align=\\\"left\\\" border=\\\"0\\\" vspace=\\\"0\\\" width=\\\"190\\\" height=\\\"160\\\" class=\\\"mobile-full\\\"\\n                  src=\\\"[PLACEHOLDER_190x160]\\\"\\n                  alt=\\\"\\\" style=\\\"display: block; border-radius: 0px; width: 100%; height: auto;font-size: 13px;\\n                  font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face;\\n                  -ko-color: @longTextStyle.color; -ko-attr-height: @imageHeight; -ko-attr-alt: @middleImage.alt;\\\" /></a>\\n</div><!--[if (gte mso 9)|(lte ie 8)]></td>\\n<td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"190\\\">\\n<![endif]--><div style=\\\"display:inline-block; max-width:190px; vertical-align:top; width:100%; \\\" class=\\\"mobile-full\\\">\\n              <a data-ko-link=\\\"rightImage.url\\\" href=\\\"\\\" style=\\\"text-decoration: none;\\\"><img data-ko-editable=\\\"rightImage.src\\\"\\n                  hspace=\\\"0\\\" align=\\\"right\\\" border=\\\"0\\\" vspace=\\\"0\\\" width=\\\"190\\\" height=\\\"160\\\" class=\\\"mobile-full\\\"\\n                  src=\\\"[PLACEHOLDER_190x160]\\\"\\n                  alt=\\\"\\\" style=\\\"display: block; border-radius: 0px; width: 100%; height: auto;font-size: 13px;\\n                  font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face;\\n                  -ko-color: @longTextStyle.color; -ko-attr-height: @imageHeight; -ko-attr-alt: @rightImage.alt;\\\" /></a>\\n</div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td><![endif]-->\\n<!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]-->\\n            </td>\\n          </tr>\\n        </table>\\n        <table data-ko-display=\\\"gutterVisible\\\" width=\\\"570\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"9\\\" bgcolor=\\\"#ffffff\\\" class=\\\"vb-row fullpad\\\"\\n          style=\\\"width: 100%; max-width: 570px; background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor; display: none;\\\">\\n          <tr>\\n            <td align=\\\"center\\\" valign=\\\"top\\\" bgcolor=\\\"#ffffff\\\" style=\\\"font-size: 0; background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"552\\\"><tr><![endif]-->\\n<!--[if (gte mso 9)|(lte ie 8)]><td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"184\\\"><![endif]-->\\n<div style=\\\"display:inline-block; max-width:184px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full\\\">\\n\\n              <table class=\\\"vb-content\\\" width=\\\"184\\\" style=\\\"width: 100%\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"9\\\" align=\\\"left\\\">\\n                <tr>\\n                  <td valign=\\\"top\\\">\\n                    <a data-ko-link=\\\"leftImage.url\\\" href=\\\"\\\" style=\\\"text-decoration: none;\\\"><img data-ko-editable=\\\"leftImage.src\\\"\\n                      hspace=\\\"0\\\" align=\\\"left\\\" border=\\\"0\\\" vspace=\\\"0\\\" width=\\\"166\\\" height=\\\"160\\\"\\n                      src=\\\"[PLACEHOLDER_166x160]\\\" class=\\\"mobile-full\\\"\\n                      alt=\\\"\\\" style=\\\"display: block; border-radius: 0px; width: 100%; height: auto;font-size: 13px;\\n                      font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face;\\n                      -ko-color: @longTextStyle.color; -ko-attr-height: @imageHeight; -ko-attr-alt: @leftImage.alt;\\\" /></a>\\n                  </td>\\n                </tr>\\n              </table>\\n\\n</div><!--[if (gte mso 9)|(lte ie 8)]></td>\\n<td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"184\\\">\\n<![endif]--><div style=\\\"display:inline-block; max-width:184px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full\\\">\\n\\n              <table class=\\\"vb-content\\\" width=\\\"184\\\" style=\\\"width: 100%\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"9\\\" align=\\\"left\\\">\\n                <tr>\\n                  <td valign=\\\"top\\\">\\n                    <a data-ko-link=\\\"middleImage.url\\\" href=\\\"\\\" style=\\\"text-decoration: none\\\"><img data-ko-editable=\\\"middleImage.src\\\"\\n                      hspace=\\\"0\\\" align=\\\"left\\\" border=\\\"0\\\" vspace=\\\"0\\\" width=\\\"166\\\" height=\\\"160\\\"\\n                      src=\\\"[PLACEHOLDER_166x160]\\\" class=\\\"mobile-full\\\"\\n                      alt=\\\"\\\" style=\\\"display: block; border-radius: 0px; width: 100%; height: auto;font-size: 13px;\\n                      font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face;\\n                      -ko-color: @longTextStyle.color; -ko-attr-height: @imageHeight; -ko-attr-alt: @middleImage.alt;\\\" /></a>\\n                  </td>\\n                </tr>\\n              </table>\\n\\n</div><!--[if (gte mso 9)|(lte ie 8)]></td>\\n<td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"184\\\">\\n<![endif]--><div style=\\\"display:inline-block; max-width:184px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full\\\">\\n\\n              <table class=\\\"vb-content\\\" width=\\\"184\\\" style=\\\"width: 100%\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"9\\\" align=\\\"right\\\">\\n                <tr>\\n                  <td valign=\\\"top\\\">\\n                    <a data-ko-link=\\\"rightImage.url\\\" href=\\\"\\\" style=\\\"text-decoration: none\\\"><img data-ko-editable=\\\"rightImage.src\\\"\\n                      hspace=\\\"0\\\" align=\\\"right\\\" border=\\\"0\\\" vspace=\\\"0\\\" width=\\\"166\\\" height=\\\"160\\\"\\n                      src=\\\"[PLACEHOLDER_166x160]\\\" class=\\\"mobile-full\\\"\\n                      alt=\\\"\\\" style=\\\"display: block; border-radius: 0px; width: 100%; height: auto;font-size: 13px;\\n                      font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face;\\n                      -ko-color: @longTextStyle.color; -ko-attr-height: @imageHeight; -ko-attr-alt: @rightImage.alt;\\\" /></a>\\n                  </td>\\n                </tr>\\n              </table>\\n\\n</div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td><![endif]-->\\n<!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]-->\\n\\n            </td>\\n          </tr>\\n        </table>\\n        </div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\\n      </td>\\n    </tr>\\n  </table>\\n  <!-- /tripleImageBlock -->\\n\\n  <!-- spacerBlock -->\\n  <table class=\\\"vb-outer\\\" width=\\\"100%\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" bgcolor=\\\"#bfbfbf\\\"\\n    style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\" data-ko-block=\\\"spacerBlock\\\">\\n    <tr>\\n      <td class=\\\"vb-outer\\\" valign=\\\"top\\\" align=\\\"center\\\" bgcolor=\\\"#bfbfbf\\\" height=\\\"24\\\"\\n        style=\\\"-ko-attr-height: @spacerSize; height: 24px; -ko-height: @[spacerSize]px; background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor;\\n        -ko-attr-bgcolor: @externalBackgroundColor; font-size:1px; line-height: 1px;\\\">&nbsp;</td>\\n    </tr>\\n  </table>\\n  <!-- /spacerBlock -->\\n\\n  <!-- socialBlock -->\\n  <table width=\\\"100%\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" bgcolor=\\\"#3f3f3f\\\"\\n    style=\\\"background-color: #3f3f3f; -ko-background-color: @backgroundColor; -ko-attr-bgcolor: @backgroundColor\\\"  data-ko-block=\\\"socialBlock\\\">\\n    <tr>\\n      <td align=\\\"center\\\" valign=\\\"top\\\" bgcolor=\\\"#3f3f3f\\\" style=\\\"background-color: #3f3f3f;\\n        -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor;\\\">\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"570\\\"><tr><td align=\\\"center\\\" valign=\\\"top\\\"><![endif]-->\\n        <div class=\\\"oldwebkit\\\">\\n        <table width=\\\"570\\\" style=\\\"width: 100%; max-width: 570px\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"9\\\" class=\\\"vb-row fullpad\\\" align=\\\"center\\\">\\n          <tr>\\n            <td valign=\\\"top\\\"  align=\\\"center\\\" style=\\\"font-size: 0;\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"552\\\"><tr><![endif]-->\\n<!--[if (gte mso 9)|(lte ie 8)]><td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"276\\\"><![endif]-->\\n<div style=\\\"display:inline-block; max-width:276px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full\\\">\\n\\n                    <table class=\\\"vb-content\\\" border=\\\"0\\\" cellspacing=\\\"9\\\" cellpadding=\\\"0\\\" width=\\\"276\\\" style=\\\"width: 100%\\\" align=\\\"left\\\">\\n                      <tr>\\n                        <td valign=\\\"middle\\\" align=\\\"left\\\"\\n                          style=\\\"font-size: 13px; font-family: Arial, Helvetica, sans-serif; color: #919191; text-align:left;\\n                          -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face; -ko-color: @longTextStyle.color\\\"\\n                          data-ko-editable=\\\"longText\\\" class=\\\"long-text links-color mobile-textcenter\\\">\\n                          <p>Address and <a href=\\\"\\\">Contacts</a></p>\\n                        </td>\\n                      </tr>\\n                    </table>\\n\\n</div><!--[if (gte mso 9)|(lte ie 8)]></td>\\n<td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"276\\\">\\n<![endif]--><div style=\\\"display:inline-block; max-width:276px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full\\\">\\n\\n                    <table class=\\\"vb-content\\\" border=\\\"0\\\" cellspacing=\\\"9\\\" cellpadding=\\\"0\\\" width=\\\"276\\\" style=\\\"width: 100%\\\" align=\\\"right\\\">\\n                      <tr>\\n                        <td align=\\\"right\\\" valign=\\\"middle\\\" class=\\\"links-color socialLinks mobile-textcenter\\\" data-ko-display=\\\"socialIconType eq \'colors\'\\\">\\n                          <span data-ko-display=\\\"fbVisible\\\" data-ko-wrap=\\\"false\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"fbVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @fbUrl\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/facebook_ok.png\\\" alt=\\\"Facebook\\\" border=\\\"0\\\" class=\\\"socialIcon\\\" />\\n                          </a>\\n                          <span data-ko-display=\\\"twVisible\\\" data-ko-wrap=\\\"false\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"twVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @twUrl\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/twitter_ok.png\\\" alt=\\\"Twitter\\\" border=\\\"0\\\" class=\\\"socialIcon\\\" />\\n                          </a>\\n                          <span data-ko-display=\\\"ggVisible\\\" data-ko-wrap=\\\"false\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"ggVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @ggUrl\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/google+_ok.png\\\" alt=\\\"Google+\\\" border=\\\"0\\\" class=\\\"socialIcon\\\" />\\n                          </a>\\n                          <span data-ko-display=\\\"webVisible\\\" data-ko-wrap=\\\"false\\\" style=\\\"display: none\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"webVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @webUrl; display: none\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/web_ok.png\\\" alt=\\\"Web\\\" border=\\\"0\\\" class=\\\"socialIcon\\\" />\\n                          </a>\\n                          <span data-ko-display=\\\"inVisible\\\" data-ko-wrap=\\\"false\\\" style=\\\"display: none\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"inVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @inUrl; display: none\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/linkedin_ok.png\\\" alt=\\\"Linkedin\\\" border=\\\"0\\\" class=\\\"socialIcon\\\" />\\n                          </a>\\n                          <span data-ko-display=\\\"flVisible\\\" data-ko-wrap=\\\"false\\\" style=\\\"display: none\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"flVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @flUrl; display: none\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/flickr_ok.png\\\" alt=\\\"Flickr\\\" border=\\\"0\\\" class=\\\"socialIcon\\\" />\\n                          </a>\\n                          <span data-ko-display=\\\"viVisible\\\" data-ko-wrap=\\\"false\\\" style=\\\"display: none\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"viVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @viUrl; display: none\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/vimeo_ok.png\\\" alt=\\\"Vimeo\\\" border=\\\"0\\\" class=\\\"socialIcon\\\" />\\n                          </a>\\n                          <span data-ko-display=\\\"instVisible\\\" data-ko-wrap=\\\"false\\\" style=\\\"display: none\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"instVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @instUrl; display: none\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/instagram_ok.png\\\" alt=\\\"Instagram\\\" border=\\\"0\\\"  class=\\\"socialIcon\\\" />\\n                          </a>\\n                          <span data-ko-display=\\\"youVisible\\\" data-ko-wrap=\\\"false\\\" style=\\\"display: none\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"youVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @youUrl; display: none\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/youtube_ok.png\\\" alt=\\\"Youtube\\\" border=\\\"0\\\" class=\\\"socialIcon\\\" />\\n                          </a>\\n                        </td>\\n                        <td align=\\\"right\\\" valign=\\\"middle\\\" class=\\\"links-color socialLinks mobile-textcenter\\\" data-ko-display=\\\"socialIconType eq \'bw\'\\\"\\n                          style=\\\"display: none\\\">\\n                          <span data-ko-display=\\\"fbVisible\\\" data-ko-wrap=\\\"false\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"fbVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @fbUrl\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/facebook_bw_ok.png\\\" alt=\\\"Facebook\\\" border=\\\"0\\\" class=\\\"socialIcon\\\" />\\n                          </a>\\n                          <span data-ko-display=\\\"twVisible\\\" data-ko-wrap=\\\"false\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"twVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @twUrl\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/twitter_bw_ok.png\\\" alt=\\\"Twitter\\\" border=\\\"0\\\" class=\\\"socialIcon\\\" />\\n                          </a>\\n                          <span data-ko-display=\\\"ggVisible\\\" data-ko-wrap=\\\"false\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"ggVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @ggUrl\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/google+_bw_ok.png\\\" alt=\\\"Google+\\\" border=\\\"0\\\" class=\\\"socialIcon\\\" />\\n                          </a>\\n                          <span data-ko-display=\\\"webVisible\\\" data-ko-wrap=\\\"false\\\" style=\\\"display: none\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"webVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @webUrl; display: none\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/web_bw_ok.png\\\" alt=\\\"Web\\\" border=\\\"0\\\" class=\\\"socialIcon\\\" />\\n                          </a>\\n                          <span data-ko-display=\\\"inVisible\\\" data-ko-wrap=\\\"false\\\" style=\\\"display: none\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"inVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @inUrl; display: none\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/linkedin_bw_ok.png\\\" alt=\\\"Linkedin\\\" border=\\\"0\\\" class=\\\"socialIcon\\\" />\\n                          </a>\\n                          <span data-ko-display=\\\"flVisible\\\" data-ko-wrap=\\\"false\\\" style=\\\"display: none\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"flVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @flUrl; display: none\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/flickr_bw_ok.png\\\" alt=\\\"Flickr\\\" border=\\\"0\\\" class=\\\"socialIcon\\\" />\\n                          </a>\\n                          <span data-ko-display=\\\"viVisible\\\" data-ko-wrap=\\\"false\\\" style=\\\"display: none\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"viVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @viUrl; display: none\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/vimeo_bw_ok.png\\\" alt=\\\"Vimeo\\\" border=\\\"0\\\" class=\\\"socialIcon\\\" />\\n                          </a>\\n                          <span data-ko-display=\\\"instVisible\\\" data-ko-wrap=\\\"false\\\" style=\\\"display: none\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"instVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @instUrl; display: none\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/instagram_bw_ok.png\\\" alt=\\\"Instagram\\\" border=\\\"0\\\"  class=\\\"socialIcon\\\" />\\n                          </a>\\n                          <span data-ko-display=\\\"youVisible\\\" data-ko-wrap=\\\"false\\\" style=\\\"display: none\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"youVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @youUrl; display: none\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/youtube_bw_ok.png\\\" alt=\\\"Youtube\\\" border=\\\"0\\\" class=\\\"socialIcon\\\" />\\n                          </a>\\n                        </td>\\n                      </tr>\\n                    </table>\\n\\n</div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td><![endif]-->\\n<!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]-->\\n\\n            </td>\\n          </tr>\\n        </table>\\n        </div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\\n      </td>\\n    </tr>\\n  </table>\\n  <!-- /socialBlock -->\\n\\n  </div>\\n\\n  <!-- footerBlock -->\\n  <table width=\\\"100%\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" bgcolor=\\\"#3f3f3f\\\"\\n    style=\\\"background-color: #3f3f3f; -ko-background-color: @backgroundColor; -ko-attr-bgcolor: @backgroundColor\\\"  data-ko-block=\\\"footerBlock\\\">\\n    <tr>\\n      <td align=\\\"center\\\" valign=\\\"top\\\" bgcolor=\\\"#3f3f3f\\\" style=\\\"background-color: #3f3f3f;\\n        -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"570\\\"><tr><td align=\\\"center\\\" valign=\\\"top\\\"><![endif]-->\\n        <div class=\\\"oldwebkit\\\">\\n        <table width=\\\"570\\\" style=\\\"width: 100%; max-width: 570px\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"9\\\" class=\\\"vb-container halfpad\\\" align=\\\"center\\\">\\n          <tr>\\n            <td data-ko-editable=\\\"longText\\\" class=\\\"long-text links-color\\\"\\n                style=\\\"text-align:center; font-size: 13px;color: #919191; font-weight: normal; text-align:center; font-family: Arial, Helvetica, sans-serif;\\n                -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face\\\"><p>Email sent to <a href=\\\"mailto:[EMAIL]\\\">[EMAIL]</a></p></td>\\n          </tr>\\n          <tr>\\n            <td style=\\\"text-align: center;\\\">\\n              <a style=\\\"text-decoration: underline; color: #ffffff; text-align: center; font-size: 13px;\\n                font-weight: normal; font-family: Arial, Helvetica, sans-serif;\\n                -ko-text-decoration: @linkStyle.decoration; -ko-color: @[Color.readability(linkStyle.color, backgroundColor) gt 2 ? linkStyle.color : (Color.isReadable(\'#ffffff\', backgroundColor) ? \'#ffffff\' : \'#000000\')]; -ko-font-size: @[linkStyle.size]px; -ko-font-family: @linkStyle.face\\\"\\n                href=\\\"[LINK_UNSUBSCRIBE]\\\"><span data-ko-editable=\\\"disiscrivitiText\\\">Unsubscribe</span></a>\\n            </td>\\n          </tr>\\n\\n          <tr data-ko-display=\\\"_root_.sponsor.visible\\\" style=\\\"display: none;text-align:center\\\">\\n            <td align=\\\"center\\\">\\n                <a href=\\\"http://www.void.it\\\" target=\\\"_blank\\\" rel=\\\"noreferrer\\\"><img border=\\\"0\\\" hspace=\\\"0\\\" vspace=\\\"0\\\" src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/sponsor.gif\\\" alt=\\\"sponsor\\\"\\n                  style=\\\"Margin:auto;display:inline !important;\\\" /></a>\\n            </td>\\n          </tr>\\n        </table>\\n        </div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\\n      </td>\\n    </tr>\\n  </table>\\n  <!-- /footerBlock -->\\n\\n  </center>\\n</body>\\n</html>\\n\"}','2024-04-21 12:52:30',1,'simple');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `namespaces` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `namespace` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `namespaces_namespace_foreign` (`namespace`),
  CONSTRAINT `namespaces_namespace_foreign` FOREIGN KEY (`namespace`) REFERENCES `namespaces` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

INSERT INTO `namespaces` VALUES
(1,'Root','Root namespace',NULL);
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permissions_campaign` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `operation` varchar(128) NOT NULL,
  PRIMARY KEY (`entity`,`user`,`operation`),
  KEY `permissions_campaign_user_foreign` (`user`),
  CONSTRAINT `permissions_campaign_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE,
  CONSTRAINT `permissions_campaign_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permissions_channel` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `operation` varchar(128) NOT NULL,
  PRIMARY KEY (`entity`,`user`,`operation`),
  KEY `permissions_channel_user_foreign` (`user`),
  CONSTRAINT `permissions_channel_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `channels` (`id`) ON DELETE CASCADE,
  CONSTRAINT `permissions_channel_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permissions_custom_form` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `operation` varchar(128) NOT NULL,
  PRIMARY KEY (`entity`,`user`,`operation`),
  KEY `permissions_custom_form_user_foreign` (`user`),
  CONSTRAINT `permissions_custom_form_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `custom_forms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `permissions_custom_form_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permissions_list` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `operation` varchar(128) NOT NULL,
  PRIMARY KEY (`entity`,`user`,`operation`),
  KEY `permissions_list_user_foreign` (`user`),
  CONSTRAINT `permissions_list_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `lists` (`id`) ON DELETE CASCADE,
  CONSTRAINT `permissions_list_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permissions_mosaico_template` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `operation` varchar(128) NOT NULL,
  PRIMARY KEY (`entity`,`user`,`operation`),
  KEY `permissions_mosaico_template_user_foreign` (`user`),
  CONSTRAINT `permissions_mosaico_template_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `mosaico_templates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `permissions_mosaico_template_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permissions_namespace` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `operation` varchar(128) NOT NULL,
  PRIMARY KEY (`entity`,`user`,`operation`),
  KEY `permissions_namespace_user_foreign` (`user`),
  CONSTRAINT `permissions_namespace_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `namespaces` (`id`) ON DELETE CASCADE,
  CONSTRAINT `permissions_namespace_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permissions_send_configuration` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `operation` varchar(128) NOT NULL,
  PRIMARY KEY (`entity`,`user`,`operation`),
  KEY `permissions_send_configuration_user_foreign` (`user`),
  CONSTRAINT `permissions_send_configuration_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `send_configurations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `permissions_send_configuration_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permissions_template` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `operation` varchar(128) NOT NULL,
  PRIMARY KEY (`entity`,`user`,`operation`),
  KEY `permissions_template_user_foreign` (`user`),
  CONSTRAINT `permissions_template_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `templates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `permissions_template_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `queued` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `send_configuration` int(10) unsigned NOT NULL,
  `type` int(10) unsigned NOT NULL,
  `data` longtext DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `created` (`created`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rss` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `parent` int(10) unsigned NOT NULL,
  `guid` varchar(255) NOT NULL DEFAULT '',
  `pubdate` timestamp NULL DEFAULT NULL,
  `campaign` int(10) unsigned DEFAULT NULL,
  `found` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `parent_2` (`parent`,`guid`),
  KEY `parent` (`parent`),
  CONSTRAINT `rss_ibfk_1` FOREIGN KEY (`parent`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `segments` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `list` int(10) unsigned NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT '',
  `created` timestamp NULL DEFAULT current_timestamp(),
  `settings` longtext DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `list` (`list`),
  KEY `name` (`name`(191)),
  CONSTRAINT `segments_list_foreign` FOREIGN KEY (`list`) REFERENCES `lists` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `send_configurations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `cid` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `from_email` varchar(255) DEFAULT NULL,
  `from_email_overridable` tinyint(1) DEFAULT 0,
  `from_name` varchar(255) DEFAULT NULL,
  `from_name_overridable` tinyint(1) DEFAULT 0,
  `reply_to` varchar(255) DEFAULT NULL,
  `reply_to_overridable` tinyint(1) DEFAULT 0,
  `verp_hostname` varchar(255) DEFAULT NULL,
  `mailer_type` varchar(255) DEFAULT NULL,
  `mailer_settings` longtext DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `namespace` int(10) unsigned DEFAULT NULL,
  `x_mailer` varchar(255) DEFAULT NULL,
  `verp_disable_sender_header` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `send_configurations_namespace_foreign` (`namespace`),
  CONSTRAINT `send_configurations_namespace_foreign` FOREIGN KEY (`namespace`) REFERENCES `namespaces` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

INSERT INTO `send_configurations` VALUES
(1,'system','System','Send configuration used to deliver system emails','admin@example.com',1,'My Awesome Company',1,'admin@example.com',1,NULL,'zone_mta','{\"maxConnections\":5,\"throttling\":0,\"logTransactions\":false,\"maxMessages\":100,\"zoneMtaType\":3}','2024-04-21 12:52:30',1,'',0);
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `settings` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) NOT NULL DEFAULT '',
  `value` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

INSERT INTO `settings` VALUES
(51,'uaCode',''),
(52,'shoutout',''),
(53,'adminEmail','admin@example.com'),
(54,'defaultHomepage','http://localhost:3000/'),
(55,'pgpPassphrase',''),
(56,'pgpPrivateKey',''),
(57,'mapsApiKey','');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `shares_campaign` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `role` varchar(128) NOT NULL,
  `auto` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`entity`,`user`),
  KEY `shares_campaign_user_foreign` (`user`),
  CONSTRAINT `shares_campaign_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shares_campaign_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `shares_channel` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `role` varchar(128) NOT NULL,
  `auto` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`entity`,`user`),
  KEY `shares_channel_user_foreign` (`user`),
  CONSTRAINT `shares_channel_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `channels` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shares_channel_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `shares_custom_form` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `role` varchar(128) NOT NULL,
  `auto` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`entity`,`user`),
  KEY `shares_custom_form_user_foreign` (`user`),
  CONSTRAINT `shares_custom_form_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `custom_forms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shares_custom_form_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `shares_list` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `role` varchar(128) NOT NULL,
  `auto` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`entity`,`user`),
  KEY `shares_list_user_foreign` (`user`),
  CONSTRAINT `shares_list_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `lists` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shares_list_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `shares_mosaico_template` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `role` varchar(128) NOT NULL,
  `auto` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`entity`,`user`),
  KEY `shares_mosaico_template_user_foreign` (`user`),
  CONSTRAINT `shares_mosaico_template_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `mosaico_templates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shares_mosaico_template_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `shares_namespace` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `role` varchar(128) NOT NULL,
  `auto` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`entity`,`user`),
  KEY `shares_namespace_user_foreign` (`user`),
  CONSTRAINT `shares_namespace_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `namespaces` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shares_namespace_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `shares_send_configuration` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `role` varchar(128) NOT NULL,
  `auto` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`entity`,`user`),
  KEY `shares_send_configuration_user_foreign` (`user`),
  CONSTRAINT `shares_send_configuration_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `send_configurations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shares_send_configuration_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `shares_template` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `role` varchar(128) NOT NULL,
  `auto` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`entity`,`user`),
  KEY `shares_template_user_foreign` (`user`),
  CONSTRAINT `shares_template_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `templates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shares_template_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `template_dep_campaigns` (
  `template` int(10) unsigned NOT NULL,
  `campaign` int(10) unsigned NOT NULL,
  PRIMARY KEY (`campaign`),
  KEY `template_dep_campaigns_template_foreign` (`template`),
  CONSTRAINT `template_dep_campaigns_campaign_foreign` FOREIGN KEY (`campaign`) REFERENCES `campaigns` (`id`),
  CONSTRAINT `template_dep_campaigns_template_foreign` FOREIGN KEY (`template`) REFERENCES `templates` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `templates` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '',
  `description` text DEFAULT NULL,
  `html` longtext DEFAULT NULL,
  `text` longtext DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `namespace` int(10) unsigned NOT NULL,
  `data` longtext DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `tag_language` varchar(48) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `name` (`name`(191)),
  KEY `templates_namespace_foreign` (`namespace`),
  KEY `templates_tag_language_index` (`tag_language`),
  CONSTRAINT `templates_namespace_foreign` FOREIGN KEY (`namespace`) REFERENCES `namespaces` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `test_messages` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `campaign` int(10) unsigned NOT NULL,
  `list` int(10) unsigned NOT NULL,
  `subscription` int(10) unsigned NOT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `cls` (`campaign`,`list`,`subscription`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trigger_messages` (
  `trigger` int(10) unsigned NOT NULL,
  `list` int(10) unsigned NOT NULL,
  `subscription` int(10) unsigned NOT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`trigger`,`list`,`subscription`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `triggers` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '',
  `description` text DEFAULT NULL,
  `enabled` tinyint(4) unsigned NOT NULL DEFAULT 1,
  `source_campaign` int(10) unsigned DEFAULT NULL,
  `entity` varchar(255) NOT NULL DEFAULT 'column',
  `event` varchar(255) DEFAULT NULL,
  `seconds` int(11) NOT NULL DEFAULT 0,
  `campaign` int(10) unsigned DEFAULT NULL,
  `count` int(11) unsigned NOT NULL DEFAULT 0,
  `last_check` timestamp NULL DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `name` (`name`(191)),
  KEY `source_campaign` (`source_campaign`),
  KEY `dest_campaign` (`campaign`),
  KEY `column` (`event`),
  KEY `active` (`enabled`),
  KEY `last_check` (`last_check`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tzoffset` (
  `tz` varchar(100) NOT NULL DEFAULT '',
  `offset` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`tz`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

INSERT INTO `tzoffset` VALUES
('africa/abidjan',0),
('africa/accra',0),
('africa/addis_ababa',180),
('africa/algiers',60),
('africa/asmara',180),
('africa/asmera',180),
('africa/bamako',0),
('africa/bangui',60),
('africa/banjul',0),
('africa/bissau',0),
('africa/blantyre',120),
('africa/brazzaville',60),
('africa/bujumbura',120),
('africa/cairo',120),
('africa/casablanca',60),
('africa/ceuta',120),
('africa/conakry',0),
('africa/dakar',0),
('africa/dar_es_salaam',180),
('africa/djibouti',180),
('africa/douala',60),
('africa/el_aaiun',60),
('africa/freetown',0),
('africa/gaborone',120),
('africa/harare',120),
('africa/johannesburg',120),
('africa/juba',180),
('africa/kampala',180),
('africa/khartoum',120),
('africa/kigali',120),
('africa/kinshasa',60),
('africa/lagos',60),
('africa/libreville',60),
('africa/lome',0),
('africa/luanda',60),
('africa/lubumbashi',120),
('africa/lusaka',120),
('africa/malabo',60),
('africa/maputo',120),
('africa/maseru',120),
('africa/mbabane',120),
('africa/mogadishu',180),
('africa/monrovia',0),
('africa/nairobi',180),
('africa/ndjamena',60),
('africa/niamey',60),
('africa/nouakchott',0),
('africa/ouagadougou',0),
('africa/porto-novo',60),
('africa/sao_tome',0),
('africa/timbuktu',0),
('africa/tripoli',120),
('africa/tunis',60),
('africa/windhoek',120),
('america/adak',-540),
('america/anchorage',-480),
('america/anguilla',-240),
('america/antigua',-240),
('america/araguaina',-180),
('america/argentina/buenos_aires',-180),
('america/argentina/catamarca',-180),
('america/argentina/comodrivadavia',-180),
('america/argentina/cordoba',-180),
('america/argentina/jujuy',-180),
('america/argentina/la_rioja',-180),
('america/argentina/mendoza',-180),
('america/argentina/rio_gallegos',-180),
('america/argentina/salta',-180),
('america/argentina/san_juan',-180),
('america/argentina/san_luis',-180),
('america/argentina/tucuman',-180),
('america/argentina/ushuaia',-180),
('america/aruba',-240),
('america/asuncion',-240),
('america/atikokan',-300),
('america/atka',-540),
('america/bahia',-180),
('america/bahia_banderas',-300),
('america/barbados',-240),
('america/belem',-180),
('america/belize',-360),
('america/blanc-sablon',-240),
('america/boa_vista',-240),
('america/bogota',-300),
('america/boise',-360),
('america/buenos_aires',-180),
('america/cambridge_bay',-360),
('america/campo_grande',-240),
('america/cancun',-300),
('america/caracas',-240),
('america/catamarca',-180),
('america/cayenne',-180),
('america/cayman',-300),
('america/chicago',-300),
('america/chihuahua',-360),
('america/coral_harbour',-300),
('america/cordoba',-180),
('america/costa_rica',-360),
('america/creston',-420),
('america/cuiaba',-240),
('america/curacao',-240),
('america/danmarkshavn',0),
('america/dawson',-420),
('america/dawson_creek',-420),
('america/denver',-360),
('america/detroit',-240),
('america/dominica',-240),
('america/edmonton',-360),
('america/eirunepe',-300),
('america/el_salvador',-360),
('america/ensenada',-420),
('america/fortaleza',-180),
('america/fort_nelson',-420),
('america/fort_wayne',-240),
('america/glace_bay',-180),
('america/godthab',-120),
('america/goose_bay',-180),
('america/grand_turk',-240),
('america/grenada',-240),
('america/guadeloupe',-240),
('america/guatemala',-360),
('america/guayaquil',-300),
('america/guyana',-240),
('america/halifax',-180),
('america/havana',-240),
('america/hermosillo',-420),
('america/indiana/indianapolis',-240),
('america/indiana/knox',-300),
('america/indiana/marengo',-240),
('america/indiana/petersburg',-240),
('america/indiana/tell_city',-300),
('america/indiana/vevay',-240),
('america/indiana/vincennes',-240),
('america/indiana/winamac',-240),
('america/indianapolis',-240),
('america/inuvik',-360),
('america/iqaluit',-240),
('america/jamaica',-300),
('america/jujuy',-180),
('america/juneau',-480),
('america/kentucky/louisville',-240),
('america/kentucky/monticello',-240),
('america/knox_in',-300),
('america/kralendijk',-240),
('america/la_paz',-240),
('america/lima',-300),
('america/los_angeles',-420),
('america/louisville',-240),
('america/lower_princes',-240),
('america/maceio',-180),
('america/managua',-360),
('america/manaus',-240),
('america/marigot',-240),
('america/martinique',-240),
('america/matamoros',-300),
('america/mazatlan',-360),
('america/mendoza',-180),
('america/menominee',-300),
('america/merida',-300),
('america/metlakatla',-480),
('america/mexico_city',-300),
('america/miquelon',-120),
('america/moncton',-180),
('america/monterrey',-300),
('america/montevideo',-180),
('america/montreal',-240),
('america/montserrat',-240),
('america/nassau',-240),
('america/new_york',-240),
('america/nipigon',-240),
('america/nome',-480),
('america/noronha',-120),
('america/north_dakota/beulah',-300),
('america/north_dakota/center',-300),
('america/north_dakota/new_salem',-300),
('america/ojinaga',-360),
('america/panama',-300),
('america/pangnirtung',-240),
('america/paramaribo',-180),
('america/phoenix',-420),
('america/port-au-prince',-240),
('america/porto_acre',-300),
('america/porto_velho',-240),
('america/port_of_spain',-240),
('america/puerto_rico',-240),
('america/punta_arenas',-180),
('america/rainy_river',-300),
('america/rankin_inlet',-300),
('america/recife',-180),
('america/regina',-360),
('america/resolute',-300),
('america/rio_branco',-300),
('america/rosario',-180),
('america/santarem',-180),
('america/santa_isabel',-420),
('america/santiago',-240),
('america/santo_domingo',-240),
('america/sao_paulo',-180),
('america/scoresbysund',0),
('america/shiprock',-360),
('america/sitka',-480),
('america/st_barthelemy',-240),
('america/st_johns',-150),
('america/st_kitts',-240),
('america/st_lucia',-240),
('america/st_thomas',-240),
('america/st_vincent',-240),
('america/swift_current',-360),
('america/tegucigalpa',-360),
('america/thule',-180),
('america/thunder_bay',-240),
('america/tijuana',-420),
('america/toronto',-240),
('america/tortola',-240),
('america/vancouver',-420),
('america/virgin',-240),
('america/whitehorse',-420),
('america/winnipeg',-300),
('america/yakutat',-480),
('america/yellowknife',-360),
('antarctica/casey',480),
('antarctica/davis',420),
('antarctica/dumontdurville',600),
('antarctica/macquarie',660),
('antarctica/mawson',300),
('antarctica/mcmurdo',720),
('antarctica/palmer',-180),
('antarctica/rothera',-180),
('antarctica/south_pole',720),
('antarctica/syowa',180),
('antarctica/troll',120),
('antarctica/vostok',360),
('arctic/longyearbyen',120),
('asia/aden',180),
('asia/almaty',360),
('asia/amman',180),
('asia/anadyr',720),
('asia/aqtau',300),
('asia/aqtobe',300),
('asia/ashgabat',300),
('asia/ashkhabad',300),
('asia/atyrau',300),
('asia/baghdad',180),
('asia/bahrain',180),
('asia/baku',240),
('asia/bangkok',420),
('asia/barnaul',420),
('asia/beirut',180),
('asia/bishkek',360),
('asia/brunei',480),
('asia/calcutta',330),
('asia/chita',540),
('asia/choibalsan',480),
('asia/chongqing',480),
('asia/chungking',480),
('asia/colombo',330),
('asia/dacca',360),
('asia/damascus',180),
('asia/dhaka',360),
('asia/dili',540),
('asia/dubai',240),
('asia/dushanbe',300),
('asia/famagusta',180),
('asia/gaza',180),
('asia/harbin',480),
('asia/hebron',180),
('asia/hong_kong',480),
('asia/hovd',420),
('asia/ho_chi_minh',420),
('asia/irkutsk',480),
('asia/istanbul',180),
('asia/jakarta',420),
('asia/jayapura',540),
('asia/jerusalem',180),
('asia/kabul',270),
('asia/kamchatka',720),
('asia/karachi',300),
('asia/kashgar',360),
('asia/kathmandu',345),
('asia/katmandu',345),
('asia/khandyga',540),
('asia/kolkata',330),
('asia/krasnoyarsk',420),
('asia/kuala_lumpur',480),
('asia/kuching',480),
('asia/kuwait',180),
('asia/macao',480),
('asia/macau',480),
('asia/magadan',660),
('asia/makassar',480),
('asia/manila',480),
('asia/muscat',240),
('asia/nicosia',180),
('asia/novokuznetsk',420),
('asia/novosibirsk',420),
('asia/omsk',360),
('asia/oral',300),
('asia/phnom_penh',420),
('asia/pontianak',420),
('asia/pyongyang',540),
('asia/qatar',180),
('asia/qostanay',360),
('asia/qyzylorda',300),
('asia/rangoon',390),
('asia/riyadh',180),
('asia/saigon',420),
('asia/sakhalin',660),
('asia/samarkand',300),
('asia/seoul',540),
('asia/shanghai',480),
('asia/singapore',480),
('asia/srednekolymsk',660),
('asia/taipei',480),
('asia/tashkent',300),
('asia/tbilisi',240),
('asia/tehran',270),
('asia/tel_aviv',180),
('asia/thimbu',360),
('asia/thimphu',360),
('asia/tokyo',540),
('asia/tomsk',420),
('asia/ujung_pandang',480),
('asia/ulaanbaatar',480),
('asia/ulan_bator',480),
('asia/urumqi',360),
('asia/ust-nera',600),
('asia/vientiane',420),
('asia/vladivostok',600),
('asia/yakutsk',540),
('asia/yangon',390),
('asia/yekaterinburg',300),
('asia/yerevan',240),
('atlantic/azores',0),
('atlantic/bermuda',-180),
('atlantic/canary',60),
('atlantic/cape_verde',-60),
('atlantic/faeroe',60),
('atlantic/faroe',60),
('atlantic/jan_mayen',120),
('atlantic/madeira',60),
('atlantic/reykjavik',0),
('atlantic/south_georgia',-120),
('atlantic/stanley',-180),
('atlantic/st_helena',0),
('australia/act',600),
('australia/adelaide',570),
('australia/brisbane',600),
('australia/broken_hill',570),
('australia/canberra',600),
('australia/currie',600),
('australia/darwin',570),
('australia/eucla',525),
('australia/hobart',600),
('australia/lhi',630),
('australia/lindeman',600),
('australia/lord_howe',630),
('australia/melbourne',600),
('australia/north',570),
('australia/nsw',600),
('australia/perth',480),
('australia/queensland',600),
('australia/south',570),
('australia/sydney',600),
('australia/tasmania',600),
('australia/victoria',600),
('australia/west',480),
('australia/yancowinna',570),
('brazil/acre',-300),
('brazil/denoronha',-120),
('brazil/east',-180),
('brazil/west',-240),
('canada/atlantic',-180),
('canada/central',-300),
('canada/eastern',-240),
('canada/mountain',-360),
('canada/newfoundland',-150),
('canada/pacific',-420),
('canada/saskatchewan',-360),
('canada/yukon',-420),
('cet',120),
('chile/continental',-240),
('chile/easterisland',-360),
('cst6cdt',-300),
('cuba',-240),
('eet',180),
('egypt',120),
('eire',60),
('est',-300),
('est5edt',-240),
('etc/gmt',0),
('etc/gmt+0',0),
('etc/gmt+1',-60),
('etc/gmt+10',-600),
('etc/gmt+11',-660),
('etc/gmt+12',-720),
('etc/gmt+2',-120),
('etc/gmt+3',-180),
('etc/gmt+4',-240),
('etc/gmt+5',-300),
('etc/gmt+6',-360),
('etc/gmt+7',-420),
('etc/gmt+8',-480),
('etc/gmt+9',-540),
('etc/gmt-0',0),
('etc/gmt-1',60),
('etc/gmt-10',600),
('etc/gmt-11',660),
('etc/gmt-12',720),
('etc/gmt-13',780),
('etc/gmt-14',840),
('etc/gmt-2',120),
('etc/gmt-3',180),
('etc/gmt-4',240),
('etc/gmt-5',300),
('etc/gmt-6',360),
('etc/gmt-7',420),
('etc/gmt-8',480),
('etc/gmt-9',540),
('etc/gmt0',0),
('etc/greenwich',0),
('etc/uct',0),
('etc/universal',0),
('etc/utc',0),
('etc/zulu',0),
('europe/amsterdam',120),
('europe/andorra',120),
('europe/astrakhan',240),
('europe/athens',180),
('europe/belfast',60),
('europe/belgrade',120),
('europe/berlin',120),
('europe/bratislava',120),
('europe/brussels',120),
('europe/bucharest',180),
('europe/budapest',120),
('europe/busingen',120),
('europe/chisinau',180),
('europe/copenhagen',120),
('europe/dublin',60),
('europe/gibraltar',120),
('europe/guernsey',60),
('europe/helsinki',180),
('europe/isle_of_man',60),
('europe/istanbul',180),
('europe/jersey',60),
('europe/kaliningrad',120),
('europe/kiev',180),
('europe/kirov',180),
('europe/lisbon',60),
('europe/ljubljana',120),
('europe/london',60),
('europe/luxembourg',120),
('europe/madrid',120),
('europe/malta',120),
('europe/mariehamn',180),
('europe/minsk',180),
('europe/monaco',120),
('europe/moscow',180),
('europe/nicosia',180),
('europe/oslo',120),
('europe/paris',120),
('europe/podgorica',120),
('europe/prague',120),
('europe/riga',180),
('europe/rome',120),
('europe/samara',240),
('europe/san_marino',120),
('europe/sarajevo',120),
('europe/saratov',240),
('europe/simferopol',180),
('europe/skopje',120),
('europe/sofia',180),
('europe/stockholm',120),
('europe/tallinn',180),
('europe/tirane',120),
('europe/tiraspol',180),
('europe/ulyanovsk',240),
('europe/uzhgorod',180),
('europe/vaduz',120),
('europe/vatican',120),
('europe/vienna',120),
('europe/vilnius',180),
('europe/volgograd',240),
('europe/warsaw',120),
('europe/zagreb',120),
('europe/zaporozhye',180),
('europe/zurich',120),
('gb',60),
('gb-eire',60),
('gmt',0),
('gmt+0',0),
('gmt-0',0),
('gmt0',0),
('greenwich',0),
('hongkong',480),
('hst',-600),
('iceland',0),
('indian/antananarivo',180),
('indian/chagos',360),
('indian/christmas',420),
('indian/cocos',390),
('indian/comoro',180),
('indian/kerguelen',300),
('indian/mahe',240),
('indian/maldives',300),
('indian/mauritius',240),
('indian/mayotte',180),
('indian/reunion',240),
('iran',270),
('israel',180),
('jamaica',-300),
('japan',540),
('kwajalein',720),
('libya',120),
('met',120),
('mexico/bajanorte',-420),
('mexico/bajasur',-360),
('mexico/general',-300),
('mst',-420),
('mst7mdt',-360),
('navajo',-360),
('nz',720),
('nz-chat',765),
('pacific/apia',780),
('pacific/auckland',720),
('pacific/bougainville',660),
('pacific/chatham',765),
('pacific/chuuk',600),
('pacific/easter',-360),
('pacific/efate',660),
('pacific/enderbury',780),
('pacific/fakaofo',780),
('pacific/fiji',720),
('pacific/funafuti',720),
('pacific/galapagos',-360),
('pacific/gambier',-540),
('pacific/guadalcanal',660),
('pacific/guam',600),
('pacific/honolulu',-600),
('pacific/johnston',-600),
('pacific/kiritimati',840),
('pacific/kosrae',660),
('pacific/kwajalein',720),
('pacific/majuro',720),
('pacific/marquesas',-570),
('pacific/midway',-660),
('pacific/nauru',720),
('pacific/niue',-660),
('pacific/norfolk',660),
('pacific/noumea',660),
('pacific/pago_pago',-660),
('pacific/palau',540),
('pacific/pitcairn',-480),
('pacific/pohnpei',660),
('pacific/ponape',660),
('pacific/port_moresby',600),
('pacific/rarotonga',-600),
('pacific/saipan',600),
('pacific/samoa',-660),
('pacific/tahiti',-600),
('pacific/tarawa',720),
('pacific/tongatapu',780),
('pacific/truk',600),
('pacific/wake',720),
('pacific/wallis',720),
('pacific/yap',600),
('poland',120),
('portugal',60),
('prc',480),
('pst8pdt',-420),
('roc',480),
('rok',540),
('singapore',480),
('turkey',180),
('uct',0),
('universal',0),
('us/alaska',-480),
('us/aleutian',-540),
('us/arizona',-420),
('us/central',-300),
('us/east-indiana',-240),
('us/eastern',-240),
('us/hawaii',-600),
('us/indiana-starke',-300),
('us/michigan',-240),
('us/mountain',-360),
('us/pacific',-420),
('us/pacific-new',-420),
('us/samoa',-660),
('utc',0),
('w-su',180),
('wet',60),
('zulu',0);
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL DEFAULT '',
  `password` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `access_token` varchar(40) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_expire` timestamp NULL DEFAULT NULL,
  `created` timestamp NULL DEFAULT current_timestamp(),
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

INSERT INTO `users` VALUES
(1,'admin','','admin@example.com',NULL,NULL,NULL,'2024-04-21 12:52:31',1,'Administrator','master');
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

