SET UNIQUE_CHECKS=0;
SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE `blacklist` (
  `email` varchar(191) NOT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `campaign_links` (
  `campaign` int(10) unsigned NOT NULL,
  `list` int(10) unsigned NOT NULL,
  `subscription` int(10) unsigned NOT NULL,
  `link` int(10) NOT NULL,
  `ip` varchar(100) CHARACTER SET ascii DEFAULT NULL,
  `device_type` varchar(50) DEFAULT NULL,
  `country` varchar(2) CHARACTER SET ascii DEFAULT NULL,
  `count` int(10) unsigned NOT NULL DEFAULT 1,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`campaign`,`list`,`subscription`,`link`),
  KEY `created_index` (`created`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `campaign_messages` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `campaign` int(10) unsigned NOT NULL,
  `list` int(10) unsigned NOT NULL,
  `subscription` int(10) unsigned NOT NULL,
  `send_configuration` int(10) unsigned NOT NULL,
  `status` tinyint(4) unsigned NOT NULL DEFAULT 0,
  `response` varchar(255) DEFAULT NULL,
  `response_id` varchar(255) CHARACTER SET ascii DEFAULT NULL,
  `updated` timestamp NULL DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `cls` (`campaign`,`list`,`subscription`),
  KEY `created` (`created`),
  KEY `response_id` (`response_id`),
  KEY `status_index` (`status`),
  KEY `subscription_index` (`subscription`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `campaigns` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `cid` varchar(255) CHARACTER SET ascii NOT NULL,
  `type` tinyint(4) unsigned NOT NULL DEFAULT 1,
  `parent` int(10) unsigned DEFAULT NULL,
  `name` varchar(255) NOT NULL DEFAULT '',
  `description` text DEFAULT NULL,
  `last_check` timestamp NULL DEFAULT NULL,
  `from_name_override` varchar(255) DEFAULT '',
  `from_email_override` varchar(255) DEFAULT '',
  `reply_to_override` varchar(255) DEFAULT '',
  `subject_override` varchar(255) DEFAULT '',
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
  CONSTRAINT `campaigns_namespace_foreign` FOREIGN KEY (`namespace`) REFERENCES `namespaces` (`id`),
  CONSTRAINT `campaigns_send_configuration_foreign` FOREIGN KEY (`send_configuration`) REFERENCES `send_configurations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `confirmations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `cid` varchar(255) CHARACTER SET ascii NOT NULL,
  `list` int(10) unsigned NOT NULL,
  `action` varchar(100) NOT NULL,
  `ip` varchar(100) DEFAULT NULL,
  `data` text NOT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
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
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `order_subscribe` int(11) DEFAULT NULL,
  `order_manage` int(11) DEFAULT NULL,
  `order_list` int(11) DEFAULT NULL,
  `settings` longtext DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `list` (`list`,`column`),
  KEY `list_2` (`list`),
  CONSTRAINT `custom_fields_list_foreign` FOREIGN KEY (`list`) REFERENCES `lists` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `custom_forms_data` (
  `form` int(10) unsigned NOT NULL,
  `data_key` varchar(128) NOT NULL,
  `data_value` longtext DEFAULT NULL,
  PRIMARY KEY (`form`,`data_key`),
  KEY `form` (`form`),
  CONSTRAINT `custom_forms_data_ibfk_1` FOREIGN KEY (`form`) REFERENCES `custom_forms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `files_campaign_attachment` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `entity` int(10) unsigned NOT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `originalname` varchar(255) DEFAULT NULL,
  `mimetype` varchar(255) DEFAULT NULL,
  `size` int(11) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `files_campaign_attachment_entity_originalname_index` (`entity`,`originalname`),
  CONSTRAINT `files_campaign_attachment_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `campaigns` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `files_campaign_file` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `entity` int(10) unsigned NOT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `originalname` varchar(255) DEFAULT NULL,
  `mimetype` varchar(255) DEFAULT NULL,
  `size` int(11) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `files_campaign_file_entity_originalname_index` (`entity`,`originalname`),
  CONSTRAINT `files_campaign_file_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `campaigns` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `files_mosaico_template_block` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `entity` int(10) unsigned NOT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `originalname` varchar(255) DEFAULT NULL,
  `mimetype` varchar(255) DEFAULT NULL,
  `size` int(11) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `files_mosaico_template_block_entity_originalname_index` (`entity`,`originalname`),
  CONSTRAINT `files_mosaico_template_block_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `mosaico_templates` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `files_mosaico_template_file` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `entity` int(10) unsigned NOT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `originalname` varchar(255) DEFAULT NULL,
  `mimetype` varchar(255) DEFAULT NULL,
  `size` int(11) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `files_mosaico_template_file_entity_originalname_index` (`entity`,`originalname`),
  CONSTRAINT `files_mosaico_template_file_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `mosaico_templates` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `files_template_file` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `entity` int(10) unsigned NOT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `originalname` varchar(255) DEFAULT NULL,
  `mimetype` varchar(255) DEFAULT NULL,
  `size` int(11) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `files_template_file_entity_originalname_index` (`entity`,`originalname`),
  CONSTRAINT `files_template_file_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `templates` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `generated_role_names` (
  `entity_type` varchar(32) NOT NULL,
  `role` varchar(128) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`entity_type`,`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO `generated_role_names` (`entity_type`, `role`, `name`, `description`) VALUES ('campaign','master','Master','All permissions');
INSERT INTO `generated_role_names` (`entity_type`, `role`, `name`, `description`) VALUES ('customForm','master','Master','All permissions');
INSERT INTO `generated_role_names` (`entity_type`, `role`, `name`, `description`) VALUES ('global','master','Master','All permissions');
INSERT INTO `generated_role_names` (`entity_type`, `role`, `name`, `description`) VALUES ('list','master','Master','All permissions');
INSERT INTO `generated_role_names` (`entity_type`, `role`, `name`, `description`) VALUES ('mosaicoTemplate','master','Master','All permissions');
INSERT INTO `generated_role_names` (`entity_type`, `role`, `name`, `description`) VALUES ('namespace','master','Master','All permissions');
INSERT INTO `generated_role_names` (`entity_type`, `role`, `name`, `description`) VALUES ('report','master','Master','All permissions');
INSERT INTO `generated_role_names` (`entity_type`, `role`, `name`, `description`) VALUES ('reportTemplate','master','Master','All permissions');
INSERT INTO `generated_role_names` (`entity_type`, `role`, `name`, `description`) VALUES ('sendConfiguration','master','Master','All permissions');
INSERT INTO `generated_role_names` (`entity_type`, `role`, `name`, `description`) VALUES ('template','master','Master','All permissions');
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `knex_migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `batch` int(11) DEFAULT NULL,
  `migration_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;
INSERT INTO `knex_migrations` (`id`, `name`, `batch`, `migration_time`) VALUES (1,'20170506102634_v1_to_v2.js',1,NOW());
CREATE TABLE `knex_migrations_lock` (
  `index` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `is_locked` int(11) DEFAULT NULL,
  PRIMARY KEY (`index`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;
INSERT INTO `knex_migrations_lock` (`index`, `is_locked`) VALUES (1,0);
CREATE TABLE `links` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `cid` varchar(255) CHARACTER SET ascii NOT NULL DEFAULT '',
  `campaign` int(10) unsigned NOT NULL,
  `url` varchar(255) CHARACTER SET ascii NOT NULL DEFAULT '',
  `visits` int(10) unsigned NOT NULL DEFAULT 0,
  `hits` int(10) unsigned NOT NULL DEFAULT 0,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `mosaico_templates` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `data` longtext DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `namespace` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `mosaico_templates_namespace_foreign` (`namespace`),
  CONSTRAINT `mosaico_templates_namespace_foreign` FOREIGN KEY (`namespace`) REFERENCES `namespaces` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;
INSERT INTO `mosaico_templates` (`id`, `name`, `description`, `type`, `data`, `created`, `namespace`) VALUES (1,'Versafix One','Default Mosaico Template','html','{\"html\":\"<!DOCTYPE html PUBLIC \\\"-//W3C//DTD XHTML 1.0 Transitional//EN\\\" \\\"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\\\">\\n<html xmlns=\\\"http://www.w3.org/1999/xhtml\\\">\\n<head>\\n  <meta http-equiv=\\\"Content-Type\\\" content=\\\"text/html; charset=UTF-8\\\" />\\n  <meta name=\\\"viewport\\\" content=\\\"initial-scale=1.0\\\" />\\n  <meta name=\\\"format-detection\\\" content=\\\"telephone=no\\\" />\\n  <title style=\\\"-ko-bind-text: @titleText\\\">TITLE</title>\\n  <style type=\\\"text/css\\\">\\n    @supports -ko-blockdefs {\\n      id { widget: id }\\n      size { label: Size; widget: select; options: 8|9|10|11|12|13|14|15|16|18|20|22|25|28|31; }\\n      visible { label: Visible?; widget: boolean }\\n      color { label: Color; widget: color }\\n      radius {\\n        label: Corner Radius;\\n        widget: integer;\\n        max: 20;\\n        help: Attention - this property is not supported on all email clients (i.e. Outlook)\\n      }\\n      face { label: Font; widget: select; options: Arial, Helvetica, sans-serif=Arial|Arial Black, Arial Black, Gadget, sans-serif=Arial Black|Comic Sans MS, Comic Sans MS5, cursive=Comic Sans|Courier New, Courier New, monospace=Courier|Georgia, serif=Georgia|Impact, sans-serif=Impact|Lucida Console, Monaco, monospace=Lucida Console|Lucida Sans Unicode, Lucida Grande, sans-serif=Lucida Sans Unicode|Times New Roman, Times, serif=Times New Roman|Verdana, Geneva, sans-serif=Verdana}\\n      decoration { label: Decoration; widget: select; options: none=None|underline=Underline }\\n      linksColor { label: Link Color; extend: color }\\n      linksDecoration { label: Underlined Links?; extend: decoration }\\n      buttonColor { label: Button Color; extend: color }\\n      text { label: Paragraph; widget: text }\\n      url { label: Link; widget: url }\\n      src { label: Image; widget: src }\\n      hrWidth { label: Width; widget: select; options:10|20|30|40|50|60|70|80|90|100; }\\n      hrHeight { label: Line height; widget: integer; max: 80; }\\n\\n      height { label: Height; widget: integer }\\n      imageHeight { label: Image Height; extend: height; }\\n      spacerSize { label: Height; widget: integer; max: 90; min: 4; }\\n      align { label: Alignment; widget: select; options:left=Left|right=Right|center=Center}\\n      alt {\\n        label: Alternative Text;\\n        widget: text;\\n        help: Alternative text will be shown on email clients that does not download image automatically;\\n      }\\n      sponsor { label: Sponsor; properties: visible=true; }\\n      titleText { label: HTML Title; extend: text; }\\n      gutterVisible { label: Show Gutter; extend: visible }\\n      socialIconType { label: Icon Version;widget: select; options:bw=Black and White|colors=Colors; }\\n\\n      preheaderLinkOption {\\n        label: Unsubscribe Link;\\n        widget: select;\\n        options: [LINK_PREFERENCES]=Preferences|[LINK_UNSUBSCRIBE]=Unsubscribe|none=None;\\n        help: If -None- is selected, preHeader text will be shown;\\n      }\\n\\n      hrStyle { label: Separator Style;properties:color hrWidth hrHeight; }\\n      hrStyle:preview { height: 200%; width: 200%; bottom: 20px; -ko-border-bottom: @[hrHeight]px solid @color; }\\n      preheaderVisible { label: Show Preheader; extend: visible; help: Preheader block is the first one on the top of the page. It contains web version link and optionally unsubscribe link or a preheader text that will be shown as a preview on some email clients; }\\n\\n      /* content types */\\n      blocks { label: Blocks; properties: blocks[]; }\\n      link { label: Link; properties: text url }\\n      image { label: Image; properties: src url alt }\\n      backgroundColor { label: Background Color; extend: color }\\n      buttonLink { label: Button; extend: link }\\n\\n      /* texts and links */\\n      textStyle { label: Text; properties: face color size }\\n      textStyle:preview { -ko-bind-text: @[\'AaZz\']; -ko-font-family: @face; -ko-color: @color; -ko-font-size: @[size]px; }\\n      linkStyle { label: Link; properties: face color size decoration=none }\\n      linkStyle:preview { -ko-bind-text: @[\'Link\']; -ko-font-size: @[size]px; -ko-font-family: @face; -ko-color: @color; -ko-text-decoration: @[decoration] }\\n      longTextStyle { label: Paragraph; properties: face color size linksColor   }\\n      longTextStyle:preview { -ko-bind-text: @[\'AaZz\']; -ko-font-family: @face; -ko-color: @color; -ko-font-size: @[size]px; }\\n      bigButtonStyle { label: Big Button; extend: buttonStyle }\\n      titleTextStyle { label: Title; extend: textStyle }\\n      /* background */\\n      externalBackgroundColor { label: External Background; extend: color }\\n\\n      externalTextStyle { label: Alternative Text; extend: textStyle }\\n      externalTextStyle:preview { -ko-bind-text: @[\'AaZz\']; -ko-font-family: @face; -ko-color: @color; -ko-font-size: @[size]px; }\\n\\n      bigTitleStyle { label: Title; properties: face color size align}\\n      bigTitleStyle:preview { -ko-bind-text: @[\'AaZz\']; -ko-font-family: @face; -ko-color: @color; -ko-font-size: @[size]px; }\\n      /* buttons */\\n      buttonStyle color { label: Text Color; extend: color }\\n      buttonStyle size { label: Text Size; extend: size }\\n      buttonStyle { label: Button; properties: face color size buttonColor radius }\\n      buttonStyle:preview { -ko-bind-text: @[\'Button\']; -ko-font-family: @face; -ko-color: @color; -ko-font-size: @[size]px; -ko-background-color: @buttonColor; padding-left: 5px; -ko-border-radius: @[radius]px; }\\n\\n      /* contents */\\n      preheaderText {label: PreHeader Text; extend:text; help: This text will be shown on some email clients as a preview of the email contents;}\\n      leftImage { label: Left Image; extend: image }\\n      leftLongText { label: Left Text; extend: text }\\n      leftButtonLink { label: Left Button; extend: buttonLink }\\n      middleImage { label: Central Image; extend: image }\\n      middleLongText { label: Central Text; extend: text }\\n      middleButtonLink { label: Central Button; extend: buttonLink }\\n      rightImage { label: Right Image; extend: image }\\n      rightLongText { label: Right Text; extend: text }\\n      rightButtonLink { label: Right Button; extend: buttonLink }\\n      webversionText{ label: Web Link Text; extend: text;}\\n      unsubscribeText{ label: Unsubscribe Link; extend: text;}\\n\\n      titleVisible { label: Show Title; extend: visible; }\\n      buttonVisible { label: Show Button; extend: visible; }\\n      imageVisible { label: Show Image; extend: visible; }\\n\\n      contentTheme { label: Main Style; }\\n      contentTheme:preview { -ko-background-color: @[backgroundColor] }\\n      frameTheme { label: Frame Style; }\\n      frameTheme:preview { -ko-background-color: @[backgroundColor] }\\n      template preheaderText { label: Preheader; }\\n\\n      template { label: Page; theme: frameTheme ;properties:  preheaderVisible=true; version: 1.0.6; }\\n\\n      footerBlock { label: Unsubscribe Block; theme: frameTheme }\\n\\n      socialBlock fbVisible { label: Facebook; }\\n      socialBlock twVisible { label: Twitter }\\n      socialBlock ggVisible { label: Google+ }\\n      socialBlock inVisible { label: LinkedIn }\\n      socialBlock flVisible { label: Flickr }\\n      socialBlock viVisible { label: Vimeo }\\n      socialBlock webVisible { label: Website }\\n      socialBlock instVisible { label: Instagram }\\n      socialBlock youVisible { label: YouTube }\\n      socialBlock fbUrl { label: Facebook Link}\\n      socialBlock twUrl { label: Twitter Link}\\n      socialBlock ggUrl { label: Google+ Link}\\n      socialBlock inUrl { label: LinkedIn Link}\\n      socialBlock flUrl { label: Flickr Link}\\n      socialBlock viUrl { label: Vimeo Link}\\n      socialBlock webUrl { label: Website Link}\\n      socialBlock instUrl { label: Instagram Link}\\n      socialBlock youUrl { label: YouTube Link}\\n      socialBlock {\\n        label: Social Block;\\n        properties: socialIconType=colors fbVisible=true fbUrl twVisible=true twUrl ggVisible=true ggUrl webVisible=false webUrl inVisible=false inUrl flVisible=false flUrl viVisible=false viUrl instVisible=false instUrl youVisible=false youUrl longTextStyle longText backgroundColor;\\n        variant:socialIconType;\\n        theme: frameTheme\\n      }\\n\\n      preheaderBlock { label:Preheader Block;  theme: frameTheme}\\n\\n      sideArticleBlock imagePos {label:Image position;widget:select; options: left=Left|right=Right; }\\n      sideArticleBlock imageWidth { label: Image Size; widget: select; options: 120=Small|166=Medium|258=Big; }\\n      sideArticleBlock { label: Image+Text Block; properties: backgroundColor titleVisible=true buttonVisible=true imageWidth=166 imagePos=left titleTextStyle longTextStyle buttonStyle  image  longText buttonLink; variant:imagePos; theme: contentTheme }\\n\\n      textBlock { label: Text Block; properties: backgroundColor longTextStyle longText; theme: contentTheme}\\n\\n      singleArticleBlock { label: Image/Text Block; properties: backgroundColor titleVisible=true buttonVisible=true imageVisible=true titleTextStyle longTextStyle buttonStyle  image  longText buttonLink;theme: contentTheme}\\n\\n      doubleArticleBlock { label: 2 Columns Block; properties: backgroundColor titleVisible=true buttonVisible=true imageVisible=true titleTextStyle longTextStyle buttonStyle  leftImage  leftLongText leftButtonLink rightImage  rightLongText rightButtonLink; theme: contentTheme}\\n\\n      tripleArticleBlock { label: 3 Columns Block; properties: backgroundColor titleVisible=true buttonVisible=true imageVisible=true titleTextStyle longTextStyle buttonStyle  leftImage  leftLongText leftButtonLink middleImage  middleLongText middleButtonLink rightImage  rightLongText rightButtonLink; theme: contentTheme}\\n\\n      logoBlock imageWidth { label: Image Size; widget: select; options: 166=Small|258=Medium|350=Big; variant:imageWidth;}\\n      logoBlock { label: Logo Block; properties: image imageWidth=258; variant: imageWidth; theme: contentTheme}\\n\\n      titleBlock { label: Title; theme: contentTheme}\\n\\n      imageBlock longTextStyle {\\n        label: Alternative Text;\\n      }\\n      imageBlock { label: Image; properties: gutterVisible=false; variant: gutterVisible; theme: contentTheme }\\n\\n      doubleImageBlock longTextStyle {\\n        label: Alternative Text;\\n      }\\n      doubleImageBlock { label: Two Image Gallery Block; properties: gutterVisible=false; variant: gutterVisible; theme: contentTheme }\\n\\n      tripleImageBlock longTextStyle {\\n        label: Alternative Text;\\n      }\\n      tripleImageBlock { label: Three Image Gallery Block;properties:gutterVisible=false;variant:gutterVisible; theme: contentTheme}\\n\\n      buttonBlock { label: Button Block; theme: contentTheme}\\n      hrBlock { label: Separator Block;  theme: contentTheme}\\n      spacerBlock { label: Spacer Block;  theme: contentTheme}\\n\\n      spacerBlock:preview,\\n      logoBlock:preview { -ko-background-color: @[externalBackgroundColor] }\\n\\n      preheaderBlock:preview,\\n      hrBlock:preview,\\n      sideArticleBlock:preview,\\n      textBlock:preview,\\n      singleArticleBlock:preview,\\n      doubleArticleBlock:preview,\\n      tripleArticleBlock:preview,\\n      titleBlock:preview,\\n      footerBlock:preview,\\n      socialBlock:preview,\\n      buttonBlock:preview,\\n      titleBlock:preview,\\n      socialshareBlock:preview { -ko-background-color: @[backgroundColor] }\\n    }\\n  </style>\\n  <style type=\\\"text/css\\\" data-inline=\\\"true\\\">\\n    body { Margin: 0; padding: 0; }\\n    img { border: 0px; display: block; }\\n\\n    .socialLinks { font-size: 6px; }\\n    .socialLinks a {\\n      display: inline-block;\\n    }\\n    .socialIcon {\\n      display: inline-block;\\n      vertical-align: top;\\n      padding-bottom: 0px;\\n      border-radius: 100%;\\n    }\\n    .oldwebkit { max-width: 570px; }\\n    td.vb-outer { padding-left: 9px; padding-right: 9px; }\\n    table.vb-container, table.vb-row, table.vb-content {\\n      border-collapse: separate;\\n    }\\n    table.vb-row {\\n      border-spacing: 9px;\\n    }\\n    table.vb-row.halfpad {\\n      border-spacing: 0;\\n      padding-left: 9px;\\n      padding-right: 9px;\\n    }\\n    table.vb-row.fullwidth {\\n      border-spacing: 0;\\n      padding: 0;\\n    }\\n    table.vb-container {\\n      padding-left: 18px;\\n      padding-right: 18px;\\n    }\\n    table.vb-container.fullpad {\\n      border-spacing: 18px;\\n      padding-left: 0;\\n      padding-right: 0;\\n    }\\n    table.vb-container.halfpad {\\n      border-spacing: 9px;\\n      padding-left: 9px;\\n      padding-right: 9px;\\n    }\\n    table.vb-container.fullwidth {\\n      padding-left: 0;\\n      padding-right: 0;\\n    }\\n  </style>\\n  <style type=\\\"text/css\\\">\\n    /* yahoo, hotmail */\\n    .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; }\\n    .yshortcuts a { border-bottom: none !important; }\\n    .vb-outer { min-width: 0 !important; }\\n    .RMsgBdy, .ExternalClass {\\n      width: 100%;\\n      background-color: #3f3f3f;\\n      -ko-background-color: @[_theme_.frameTheme.backgroundColor]\\n    }\\n\\n    /* outlook */\\n    table { mso-table-rspace: 0pt; mso-table-lspace: 0pt; }\\n    #outlook a { padding: 0; }\\n    img { outline: none; text-decoration: none; border: none; -ms-interpolation-mode: bicubic; }\\n    a img { border: none; }\\n\\n    @media screen and (max-device-width: 600px), screen and (max-width: 600px) {\\n      table.vb-container, table.vb-row {\\n        width: 95% !important;\\n      }\\n\\n      .mobile-hide { display: none !important; }\\n      .mobile-textcenter { text-align: center !important; }\\n\\n      .mobile-full {\\n        float: none !important;\\n        width: 100% !important;\\n        max-width: none !important;\\n        padding-right: 0 !important;\\n        padding-left: 0 !important;\\n      }\\n      img.mobile-full {\\n        width: 100% !important;\\n        max-width: none !important;\\n        height: auto !important;\\n      }\\n    }\\n  </style>\\n  <style type=\\\"text/css\\\" data-inline=\\\"true\\\">\\n    [data-ko-block=tripleArticleBlock] .links-color a,\\n    [data-ko-block=tripleArticleBlock] .links-color a:link,\\n    [data-ko-block=tripleArticleBlock] .links-color a:visited,\\n    [data-ko-block=tripleArticleBlock] .links-color a:hover {\\n      color: #3f3f3f;\\n      -ko-color: @longTextStyle.linksColor;\\n      text-decoration: underline;\\n    }\\n    [data-ko-block=tripleArticleBlock] .long-text p { Margin: 1em 0px; }\\n    [data-ko-block=tripleArticleBlock] .long-text p:last-child { Margin-bottom: 0px; }\\n    [data-ko-block=tripleArticleBlock] .long-text p:first-child { Margin-top: 0px; }\\n\\n    [data-ko-block=doubleArticleBlock] .links-color a,\\n    [data-ko-block=doubleArticleBlock] .links-color a:link,\\n    [data-ko-block=doubleArticleBlock] .links-color a:visited,\\n    [data-ko-block=doubleArticleBlock] .links-color a:hover {\\n      color: #3f3f3f;\\n      -ko-color: @longTextStyle.linksColor;\\n      text-decoration: underline;\\n    }\\n    [data-ko-block=doubleArticleBlock] .long-text p { Margin: 1em 0px; }\\n    [data-ko-block=doubleArticleBlock] .long-text p:last-child { Margin-bottom: 0px; }\\n    [data-ko-block=doubleArticleBlock] .long-text p:first-child { Margin-top: 0px; }\\n\\n    [data-ko-block=singleArticleBlock] .links-color a,\\n    [data-ko-block=singleArticleBlock] .links-color a:link,\\n    [data-ko-block=singleArticleBlock] .links-color a:visited,\\n    [data-ko-block=singleArticleBlock] .links-color a:hover {\\n      color: #3f3f3f;\\n      -ko-color: @longTextStyle.linksColor;\\n      text-decoration: underline;\\n    }\\n    [data-ko-block=singleArticleBlock] .long-text p { Margin: 1em 0px; }\\n    [data-ko-block=singleArticleBlock] .long-text p:last-child { Margin-bottom: 0px; }\\n    [data-ko-block=singleArticleBlock] .long-text p:first-child { Margin-top: 0px; }\\n\\n    [data-ko-block=textBlock] .links-color a,\\n    [data-ko-block=textBlock] .links-color a:link,\\n    [data-ko-block=textBlock] .links-color a:visited,\\n    [data-ko-block=textBlock] .links-color a:hover {\\n      color: #3f3f3f;\\n      -ko-color: @longTextStyle.linksColor;\\n      text-decoration: underline;\\n    }\\n    [data-ko-block=textBlock] .long-text p { Margin: 1em 0px; }\\n    [data-ko-block=textBlock] .long-text p:last-child { Margin-bottom: 0px; }\\n    [data-ko-block=textBlock] .long-text p:first-child { Margin-top: 0px; }\\n\\n    [data-ko-block=sideArticleBlock] .links-color a,\\n    [data-ko-block=sideArticleBlock] .links-color a:link,\\n    [data-ko-block=sideArticleBlock] .links-color a:visited,\\n    [data-ko-block=sideArticleBlock] .links-color a:hover {\\n      color: #3f3f3f;\\n      -ko-color: @longTextStyle.linksColor;\\n      text-decoration: underline;\\n    }\\n    [data-ko-block=sideArticleBlock] .long-text p { Margin: 1em 0px; }\\n    [data-ko-block=sideArticleBlock] .long-text p:last-child { Margin-bottom: 0px; }\\n    [data-ko-block=sideArticleBlock] .long-text p:first-child { Margin-top: 0px; }\\n\\n    [data-ko-block=socialBlock] .links-color a,\\n    [data-ko-block=socialBlock] .links-color a:link,\\n    [data-ko-block=socialBlock] .links-color a:visited,\\n    [data-ko-block=socialBlock] .links-color a:hover {\\n      color: #cccccc;\\n      -ko-color: @longTextStyle.linksColor;\\n      text-decoration: underline;\\n    }\\n    [data-ko-block=socialBlock] .long-text p { Margin: 1em 0px; }\\n    [data-ko-block=socialBlock] .long-text p:last-child { Margin-bottom: 0px; }\\n    [data-ko-block=socialBlock] .long-text p:first-child { Margin-top: 0px; }\\n\\n    [data-ko-block=footerBlock] .links-color a,\\n    [data-ko-block=footerBlock] .links-color a:link,\\n    [data-ko-block=footerBlock] .links-color a:visited,\\n    [data-ko-block=footerBlock] .links-color a:hover {\\n      color: #cccccc;\\n      -ko-color: @longTextStyle.linksColor;\\n      text-decoration: underline;\\n    }\\n    [data-ko-block=footerBlock] .long-text p { Margin: 1em 0px; }\\n    [data-ko-block=footerBlock] .long-text p:last-child { Margin-bottom: 0px; }\\n    [data-ko-block=footerBlock] .long-text p:first-child { Margin-top: 0px; }\\n\\n    [data-ko-block=doubleImageBlock] a,\\n    [data-ko-block=doubleImageBlock] a:link,\\n    [data-ko-block=doubleImageBlock] a:visited,\\n    [data-ko-block=doubleImageBlock] a:hover {\\n      color: #3f3f3f;\\n      -ko-color: @longTextStyle.linksColor;\\n      text-decoration: underline;\\n    }\\n    [data-ko-block=tripleImageBlock] a,\\n    [data-ko-block=tripleImageBlock] a:link,\\n    [data-ko-block=tripleImageBlock] a:visited,\\n    [data-ko-block=tripleImageBlock] a:hover {\\n      color: #3f3f3f;\\n      -ko-color: @longTextStyle.linksColor;\\n      text-decoration: underline;\\n    }\\n    [data-ko-block=imageBlock] a,\\n    [data-ko-block=imageBlock] a:link,\\n    [data-ko-block=imageBlock] a:visited,\\n    [data-ko-block=imageBlock] a:hover {\\n      color: #3f3f3f;\\n      -ko-color: @longTextStyle.linksColor;\\n      text-decoration: underline;\\n    }\\n  </style>\\n</head>\\n<body bgcolor=\\\"#3f3f3f\\\" text=\\\"#919191\\\" alink=\\\"#cccccc\\\" vlink=\\\"#cccccc\\\" style=\\\"background-color: #3f3f3f; color: #919191;\\n  -ko-background-color: @_theme_.frameTheme.backgroundColor; -ko-attr-bgcolor: @_theme_.frameTheme.backgroundColor; -ko-color: @_theme_.frameTheme.longTextStyle.color;\\n  -ko-attr-text: @_theme_.frameTheme.longTextStyle.color; -ko-attr-alink: @_theme_.frameTheme.longTextStyle.linksColor;\\n  -ko-attr-vlink: @_theme_.frameTheme.longTextStyle.linksColor\\\">\\n\\n  <center>\\n\\n  <!-- preheaderBlock -->\\n  <div data-ko-display=\\\"preheaderVisible\\\" data-ko-wrap=\\\"false\\\">\\n\\n  <table class=\\\"vb-outer\\\" width=\\\"100%\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" bgcolor=\\\"#3f3f3f\\\"\\n    style=\\\"background-color: #3f3f3f; -ko-background-color: @backgroundColor; -ko-attr-bgcolor: @backgroundColor\\\" data-ko-block=\\\"preheaderBlock\\\">\\n    <tr>\\n      <td class=\\\"vb-outer\\\" align=\\\"center\\\" valign=\\\"top\\\" bgcolor=\\\"#3f3f3f\\\"\\n        style=\\\"background-color: #3f3f3f; -ko-background-color: @backgroundColor; -ko-attr-bgcolor: @backgroundColor\\\">\\n        <div style=\\\"display: none; font-size:1px; color: #333333; line-height: 1px; max-height:0px; max-width: 0px; opacity: 0; overflow: hidden;\\n          -ko-bind-text: @preheaderText\\\"></div>\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"570\\\"><tr><td align=\\\"center\\\" valign=\\\"top\\\"><![endif]-->\\n        <div class=\\\"oldwebkit\\\">\\n        <table width=\\\"570\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"0\\\" class=\\\"vb-row halfpad\\\" bgcolor=\\\"#3f3f3f\\\"\\n          style=\\\"width: 100%; max-width: 570px; background-color: #3f3f3f; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor;\\\">\\n          <tr>\\n            <td align=\\\"center\\\" valign=\\\"top\\\" bgcolor=\\\"#3f3f3f\\\" style=\\\"font-size: 0; background-color: #3f3f3f;\\n              -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor\\\" align=\\\"left\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"552\\\"><tr><![endif]-->\\n<!--[if (gte mso 9)|(lte ie 8)]><td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"276\\\"><![endif]-->\\n<div style=\\\"display:inline-block; max-width:276px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full\\\">\\n                    <table class=\\\"vb-content\\\" border=\\\"0\\\" cellspacing=\\\"9\\\" cellpadding=\\\"0\\\" width=\\\"276\\\" style=\\\"width: 100%;\\\" align=\\\"left\\\">\\n                      <tr>\\n                        <td width=\\\"100%\\\" valign=\\\"top\\\" align=\\\"left\\\" style=\\\"font-weight: normal; text-align:left; font-size: 13px;\\n                          font-family: Arial, Helvetica, sans-serif; color: #ffffff;\\n                          -ko-font-size: @[linkStyle.size]px; -ko-color: @linkStyle.color; -ko-font-family: @linkStyle.face\\\">\\n                          <a data-ko-display=\\\"preheaderLinkOption neq \'none\'\\\" data-ko-editable=\\\"unsubscribeText\\\" href=\\\"[LINK_PREFERENCES]\\\"\\n                             style=\\\"text-decoration: underline; color: #ffffff; -ko-attr-href: @preheaderLinkOption;\\n                             -ko-color: @linkStyle.color; -ko-text-decoration: @linkStyle.decoration\\\">Preferences</a>\\n                          <span data-ko-display=\\\"preheaderLinkOption eq \'none\'\\\" style=\\\"font-size: 13px;color: #919191; font-weight: normal; text-align:center;\\n                            font-family: Arial, Helvetica, sans-serif; -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color;\\n                            -ko-font-family: @longTextStyle.face; -ko-bind-text: @preheaderText; display: none\\\"></span>\\n                        </td>\\n                      </tr>\\n                    </table>\\n</div><!--[if (gte mso 9)|(lte ie 8)]>\\n</td><td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"276\\\">\\n<![endif]--><div style=\\\"display:inline-block; max-width:276px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full mobile-hide\\\">\\n\\n                    <table class=\\\"vb-content\\\" border=\\\"0\\\" cellspacing=\\\"9\\\" cellpadding=\\\"0\\\" width=\\\"276\\\" style=\\\"width: 100%; text-align: right;\\\" align=\\\"left\\\">\\n                      <tr>\\n                        <td width=\\\"100%\\\" valign=\\\"top\\\" style=\\\"font-weight: normal;  font-size: 13px; font-family: Arial, Helvetica, sans-serif; color: #ffffff;\\n                      -ko-font-size: @[linkStyle.size]px; -ko-color: @linkStyle.color; -ko-font-family: @linkStyle.face\\\">\\n                      <span style=\\\"color: #ffffff; text-decoration: underline;\\n                        -ko-color: @linkStyle.color; -ko-text-decoration: @linkStyle.decoration\\\">\\n                          <a data-ko-editable=\\\"webversionText\\\" href=\\\"[LINK_BROWSER]\\\"\\n                          style=\\\"text-decoration: underline; color: #ffffff;\\n                           -ko-color: @linkStyle.color; -ko-text-decoration: @linkStyle.decoration\\\">View in your browser</a>\\n                         </span>\\n                       </td>\\n                      </tr>\\n                    </table>\\n\\n</div><!--[if (gte mso 9)|(lte ie 8)]>\\n</td></tr></table><![endif]-->\\n\\n            </td>\\n          </tr>\\n        </table>\\n        </div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\\n      </td>\\n    </tr>\\n  </table>\\n\\n  </div>\\n  <!-- /preheaderBlock -->\\n\\n  <div data-ko-container=\\\"main\\\" data-ko-wrap=\\\"false\\\">\\n\\n  <!-- logoBlock -->\\n  <table class=\\\"vb-outer\\\" width=\\\"100%\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" bgcolor=\\\"#bfbfbf\\\"\\n    style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\" data-ko-block=\\\"logoBlock\\\">\\n    <tr>\\n      <td class=\\\"vb-outer\\\" align=\\\"center\\\" valign=\\\"top\\\" bgcolor=\\\"#bfbfbf\\\"\\n        style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"570\\\"><tr><td align=\\\"center\\\" valign=\\\"top\\\"><![endif]-->\\n        <div class=\\\"oldwebkit\\\">\\n        <table width=\\\"570\\\" style=\\\"width: 100%; max-width: 570px\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"18\\\" class=\\\"vb-container fullpad\\\">\\n          <tr>\\n            <td valign=\\\"top\\\" align=\\\"center\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"258\\\" style=\\\"-ko-attr-width: @[imageWidth]\\\"><tr><td align=\\\"center\\\" valign=\\\"top\\\"><![endif]-->\\n<div style=\\\"display:inline-block; max-width:258px; -ko-max-width: @[imageWidth]px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full\\\">\\n                    <a data-ko-link=\\\"image.url\\\" href=\\\"\\\" style=\\\"font-size: 18px; font-family: Arial, Helvetica, sans-serif; color: #f3f3f3;\\n                      text-decoration: none; -ko-font-size: @[externalTextStyle.size]px;\\n                      -ko-font-family: @externalTextStyle.face; -ko-color: @externalTextStyle.color\\\"><img\\n                       data-ko-editable=\\\"image.src\\\" width=\\\"258\\\" data-ko-placeholder-height=\\\"150\\\"\\n                        style=\\\"-ko-attr-alt: @image.alt; width: 100%; max-width: 258px; -ko-attr-width: @imageWidth; -ko-max-width: @[imageWidth]px;\\\"\\n                        src=\\\"[PLACEHOLDER_258x150]\\\" vspace=\\\"0\\\" hspace=\\\"0\\\" border=\\\"0\\\" alt=\\\"\\\" /></a>\\n</div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\\n\\n            </td>\\n          </tr>\\n        </table>\\n        </div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\\n\\n      </td>\\n    </tr>\\n  </table>\\n  <!-- /logoBlock  -->\\n\\n  <!-- sideArticleBlock  -->\\n  <table class=\\\"vb-outer\\\" width=\\\"100%\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" bgcolor=\\\"#bfbfbf\\\"\\n    style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\" data-ko-block=\\\"sideArticleBlock\\\">\\n    <tr>\\n      <td class=\\\"vb-outer\\\" align=\\\"center\\\" valign=\\\"top\\\" bgcolor=\\\"#bfbfbf\\\"\\n        style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"570\\\"><tr><td align=\\\"center\\\" valign=\\\"top\\\"><![endif]-->\\n        <div class=\\\"oldwebkit\\\">\\n        <table width=\\\"570\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"9\\\" class=\\\"vb-row fullpad\\\" bgcolor=\\\"#ffffff\\\"\\n          style=\\\"width: 100%; max-width: 570px; background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor;\\\">\\n          <tr>\\n            <td align=\\\"center\\\" class=\\\"mobile-row\\\" valign=\\\"top\\\" style=\\\"font-size: 0;\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"552\\\"><tr><![endif]-->\\n<div data-ko-display=\\\"imagePos eq \'left\'\\\" data-ko-wrap=\\\"false\\\" style=\\\"width: 100%; max-width:184px; -ko-max-width:@[18 + Math.round(imageWidth)]px; display:inline-block\\\" class=\\\"mobile-full\\\">\\n<!--[if (gte mso 9)|(lte ie 8)]><td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"184\\\" style=\\\"-ko-attr-width: @[18 + Math.round(imageWidth)]\\\"><![endif]-->\\n<div style=\\\"display:inline-block; max-width:184px; -ko-max-width:@[18 + Math.round(imageWidth)]px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full\\\">\\n\\n                    <table class=\\\"vb-content\\\" border=\\\"0\\\" cellspacing=\\\"9\\\" cellpadding=\\\"0\\\" width=\\\"184\\\" style=\\\"width: 100%; -ko-attr-width: @[18 + Math.round(imageWidth)]\\\" align=\\\"left\\\">\\n                      <tr>\\n                        <td width=\\\"100%\\\" valign=\\\"top\\\" align=\\\"left\\\" class=\\\"links-color\\\">\\n                          <a data-ko-link=\\\"image.url\\\" href=\\\"\\\">\\n                            <img data-ko-editable=\\\"image.src\\\" border=\\\"0\\\" hspace=\\\"0\\\" vspace=\\\"0\\\" width=\\\"166\\\"\\n                              data-ko-placeholder-height=\\\"130\\\" class=\\\"mobile-full\\\" alt=\\\"\\\"\\n                              src=\\\"[PLACEHOLDER_166x130]\\\"\\n                              style=\\\"vertical-align: top; width: 100%; height: auto; -ko-attr-width: @imageWidth; max-width: 166px; -ko-max-width: @[imageWidth]px; -ko-attr-alt: @image.alt\\\" />\\n                          </a>\\n                        </td>\\n                      </tr>\\n                    </table>\\n\\n</div><!--[if (gte mso 9)|(lte ie 8)]></td>\\n<![endif]--></div><!--[if (gte mso 9)|(lte ie 8)]>\\n<td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"368\\\" style=\\\"-ko-attr-width: @[570 - 2 * 18 - Math.round(imageWidth)]\\\">\\n<![endif]--><div style=\\\"display:inline-block; max-width:368px; -ko-max-width: @[570 - 2 * 18 - Math.round(imageWidth)]px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full\\\">\\n\\n                    <table class=\\\"vb-content\\\" border=\\\"0\\\" cellspacing=\\\"9\\\" cellpadding=\\\"0\\\" width=\\\"368\\\" style=\\\"width: 100%; -ko-attr-width: @[570 - 2 * 18 - Math.round(imageWidth)]\\\" align=\\\"left\\\">\\n                      <tr data-ko-display=\\\"titleVisible\\\">\\n                        <td style=\\\"font-size: 18px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; text-align:left;\\n                          -ko-font-size: @[titleTextStyle.size]px; -ko-font-family: @titleTextStyle.face; -ko-color: @titleTextStyle.color\\\">\\n                          <span style=\\\"color: #3f3f3f; -ko-color: @titleTextStyle.color\\\" data-ko-editable=\\\"titleText\\\">\\n                          Title\\n                          </span>\\n                        </td>\\n                      </tr>\\n                      <tr>\\n                        <td align=\\\"left\\\" style=\\\"text-align: left; font-size: 13px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f;\\n                          -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face; -ko-color: @longTextStyle.color\\\"\\n                          data-ko-editable=\\\"longText\\\" class=\\\"long-text links-color\\\">\\n                          <p>Far far away, behind the word mountains, far from the countries <a href=\\\"\\\">Vokalia and Consonantia</a>, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia.</p>\\n                        </td>\\n                      </tr>\\n                      <tr data-ko-display=\\\"buttonVisible\\\">\\n                        <td valign=\\\"top\\\">\\n                          <table cellpadding=\\\"0\\\" border=\\\"0\\\" align=\\\"left\\\" cellspacing=\\\"0\\\" class=\\\"mobile-full\\\" style=\\\"padding-top: 4px\\\">\\n                            <tr>\\n                              <td width=\\\"auto\\\" valign=\\\"middle\\\" bgcolor=\\\"#bfbfbf\\\" align=\\\"center\\\" height=\\\"26\\\"\\n                                style=\\\"font-size: 13px; font-family: Arial, Helvetica, sans-serif; text-align:center; color: #3f3f3f; font-weight: normal;\\n                                padding-left: 18px; padding-right: 18px; background-color: #bfbfbf; border-radius: 4px;\\n                                -ko-border-radius: @[buttonStyle.radius]px;\\n                                -ko-attr-bgcolor: @buttonStyle.buttonColor; -ko-background-color: @buttonStyle.buttonColor;\\n                                -ko-font-size: @[buttonStyle.size]px; -ko-font-family: @buttonStyle.face; -ko-color: @buttonStyle.color;\\\">\\n                                <a data-ko-editable=\\\"buttonLink.text\\\" href=\\\"\\\" style=\\\"text-decoration: none; color: #3f3f3f; font-weight: normal;\\n                                  -ko-color: @buttonStyle.color; -ko-attr-href: @buttonLink.url\\\">BUTTON</a>\\n                              </td>\\n                            </tr>\\n                          </table>\\n                        </td>\\n                      </tr>\\n                    </table>\\n</div><!--[if (gte mso 9)|(lte ie 8)]></td>\\n<![endif]--><div data-ko-display=\\\"imagePos eq \'right\'\\\" data-ko-wrap=\\\"false\\\" style=\\\"width: 100%; max-width:184px; -ko-max-width:@[18 + Math.round(imageWidth)]px; display:inline-block; display: none;\\\" class=\\\"mobile-full\\\"><!--[if (gte mso 9)|(lte ie 8)]>\\n<td data-ko-display=\\\"imagePos eq \'right\'\\\" align=\\\"left\\\" valign=\\\"top\\\" width=\\\"184\\\" style=\\\"display: none; -ko-attr-width: @[18 + Math.round(imageWidth)]\\\">\\n<![endif]--><div style=\\\"display:inline-block; max-width:184px; -ko-max-width:@[18 + Math.round(imageWidth)]px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full\\\">\\n\\n                    <table class=\\\"vb-content\\\" border=\\\"0\\\" cellspacing=\\\"9\\\" cellpadding=\\\"0\\\" width=\\\"184\\\" style=\\\"width: 100%; -ko-attr-width: @[18 + Math.round(imageWidth)]\\\" align=\\\"left\\\">\\n                      <tr>\\n                        <td width=\\\"100%\\\" valign=\\\"top\\\" align=\\\"left\\\" class=\\\"links-color\\\">\\n                          <a data-ko-link=\\\"image.url\\\" href=\\\"\\\">\\n                            <img data-ko-editable=\\\"image.src\\\" border=\\\"0\\\" hspace=\\\"0\\\" vspace=\\\"0\\\" width=\\\"166\\\" data-ko-placeholder-height=\\\"130\\\" class=\\\"mobile-full\\\"\\n                              src=\\\"[PLACEHOLDER_166x130]\\\" class=\\\"mobile-full\\\"\\n                              alt=\\\"\\\" style=\\\"vertical-align:top; width: 100%; height: auto; -ko-attr-width: @imageWidth; max-width: 166px; -ko-max-width: @[imageWidth]px; -ko-attr-alt: @image.alt\\\" />\\n                          </a>\\n                        </td>\\n                      </tr>\\n                    </table>\\n\\n</div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td><![endif]-->\\n</div>\\n<!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]-->\\n\\n            </td>\\n          </tr>\\n        </table>\\n        </div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\\n      </td>\\n    </tr>\\n  </table>\\n  <!-- /sideArticleBlock -->\\n\\n  <!-- singleArticleBlock -->\\n  <table class=\\\"vb-outer\\\" width=\\\"100%\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" bgcolor=\\\"#bfbfbf\\\"\\n    style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\" data-ko-block=\\\"singleArticleBlock\\\">\\n    <tr>\\n      <td class=\\\"vb-outer\\\" align=\\\"center\\\" valign=\\\"top\\\" bgcolor=\\\"#bfbfbf\\\"\\n        style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"570\\\"><tr><td align=\\\"center\\\" valign=\\\"top\\\"><![endif]-->\\n        <div class=\\\"oldwebkit\\\">\\n        <table width=\\\"570\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"18\\\" class=\\\"vb-container fullpad\\\" bgcolor=\\\"#ffffff\\\"\\n          style=\\\"width: 100%; max-width: 570px; background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor;\\\">\\n          <tr data-ko-display=\\\"imageVisible\\\">\\n            <td width=\\\"100%\\\" valign=\\\"top\\\" align=\\\"left\\\" class=\\\"links-color\\\">\\n              <a data-ko-link=\\\"image.url\\\" href=\\\"\\\">\\n                <img data-ko-editable=\\\"image.src\\\" border=\\\"0\\\" hspace=\\\"0\\\" vspace=\\\"0\\\" width=\\\"534\\\" data-ko-placeholder-height=\\\"200\\\"\\n                  src=\\\"[PLACEHOLDER_534x200]\\\" class=\\\"mobile-full\\\"\\n                  alt=\\\"\\\" style=\\\"vertical-align:top; max-width:534px; width: 100%; height: auto;\\n                  -ko-attr-alt: @image.alt\\\" />\\n              </a>\\n            </td>\\n          </tr>\\n          <tr><td><table align=\\\"left\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"0\\\" width=\\\"100%\\\">\\n            <tr data-ko-display=\\\"titleVisible\\\">\\n              <td style=\\\"font-size: 18px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; text-align:left;\\n                -ko-font-size: @[titleTextStyle.size]px; -ko-font-family: @titleTextStyle.face; -ko-color: @titleTextStyle.color\\\">\\n                <span style=\\\"color: #3f3f3f; -ko-color: @titleTextStyle.color\\\" data-ko-editable=\\\"text\\\">\\n               Section Title\\n                </span>\\n              </td>\\n            </tr>\\n            <tr data-ko-display=\\\"titleVisible\\\">\\n              <td height=\\\"9\\\" style=\\\"font-size:1px; line-height: 1px;\\\">&nbsp;</td>\\n            </tr>\\n            <tr>\\n              <td align=\\\"left\\\" style=\\\"text-align: left; font-size: 13px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f;\\n                -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face; -ko-color: @longTextStyle.color\\\"\\n                data-ko-editable=\\\"longText\\\" class=\\\"long-text links-color\\\">\\n                <p>Far far away, behind the word mountains, far from the countries <a href=\\\"\\\">Vokalia and Consonantia</a>, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia.</p>\\n              </td>\\n            </tr>\\n            <tr data-ko-display=\\\"buttonVisible\\\">\\n              <td height=\\\"13\\\" style=\\\"font-size:1px; line-height: 1px;\\\">&nbsp;</td>\\n            </tr>\\n            <tr data-ko-display=\\\"buttonVisible\\\">\\n              <td valign=\\\"top\\\">\\n                <table cellpadding=\\\"0\\\" border=\\\"0\\\" align=\\\"left\\\" cellspacing=\\\"0\\\" class=\\\"mobile-full\\\">\\n                  <tr>\\n                    <td width=\\\"auto\\\" valign=\\\"middle\\\" bgcolor=\\\"#bfbfbf\\\" align=\\\"center\\\" height=\\\"26\\\"\\n                      style=\\\"font-size: 13px; font-family: Arial, Helvetica, sans-serif; text-align:center; color: #3f3f3f; font-weight: normal;\\n                      padding-left: 18px; padding-right: 18px; background-color: #bfbfbf; border-radius: 4px;\\n                      -ko-border-radius: @[buttonStyle.radius]px;\\n                      -ko-attr-bgcolor: @buttonStyle.buttonColor; -ko-background-color: @buttonStyle.buttonColor;\\n                      -ko-font-size: @[buttonStyle.size]px; -ko-font-family: @buttonStyle.face; -ko-color: @buttonStyle.color; \\\">\\n                      <a data-ko-editable=\\\"buttonLink.text\\\" href=\\\"\\\" style=\\\"text-decoration: none; color: #3f3f3f; font-weight: normal;\\n                        -ko-color: @buttonStyle.color; -ko-attr-href: @buttonLink.url\\\">BUTTON</a>\\n                    </td>\\n                  </tr>\\n                </table>\\n              </td>\\n            </tr>\\n          </table></td></tr>\\n        </table>\\n        </div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\\n      </td>\\n    </tr>\\n  </table>\\n  <!-- /singleArticleBlock -->\\n\\n  <!-- TitleBlock -->\\n  <table class=\\\"vb-outer\\\" width=\\\"100%\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" bgcolor=\\\"#bfbfbf\\\"\\n    style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\" data-ko-block=\\\"titleBlock\\\">\\n    <tr>\\n      <td class=\\\"vb-outer\\\" align=\\\"center\\\" valign=\\\"top\\\" bgcolor=\\\"#bfbfbf\\\"\\n        style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"570\\\"><tr><td align=\\\"center\\\" valign=\\\"top\\\"><![endif]-->\\n        <div class=\\\"oldwebkit\\\">\\n        <table width=\\\"570\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"9\\\" class=\\\"vb-container halfpad\\\" bgcolor=\\\"#ffffff\\\"\\n          style=\\\"width: 100%; max-width: 570px; background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor;\\\">\\n          <tr>\\n            <td bgcolor=\\\"#ffffff\\\" align=\\\"center\\\"\\n              style=\\\"background-color: #ffffff; font-size: 22px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; text-align: center;\\n              -ko-attr-align: @bigTitleStyle.align; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor;\\n              -ko-font-size: @[bigTitleStyle.size]px; -ko-font-family: @bigTitleStyle.face; -ko-color: @bigTitleStyle.color; -ko-text-align: @bigTitleStyle.align\\\">\\n              <span data-ko-editable=\\\"text\\\">Section Title</span>\\n            </td>\\n          </tr>\\n        </table>\\n        </div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\\n      </td>\\n    </tr>\\n  </table>\\n  <!-- /TitleBlock -->\\n\\n  <!-- textBlock -->\\n  <table class=\\\"vb-outer\\\" width=\\\"100%\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" bgcolor=\\\"#bfbfbf\\\"\\n    style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\" data-ko-block=\\\"textBlock\\\">\\n    <tr>\\n      <td class=\\\"vb-outer\\\" align=\\\"center\\\" valign=\\\"top\\\" bgcolor=\\\"#bfbfbf\\\"\\n        style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"570\\\"><tr><td align=\\\"center\\\" valign=\\\"top\\\"><![endif]-->\\n        <div class=\\\"oldwebkit\\\">\\n        <table width=\\\"570\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"18\\\" class=\\\"vb-container fullpad\\\" bgcolor=\\\"#ffffff\\\"\\n          style=\\\"width: 100%; max-width: 570px; background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor;\\\">\\n          <tr>\\n            <td align=\\\"left\\\" style=\\\"text-align: left; font-size: 13px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f;\\n              -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face; -ko-color: @longTextStyle.color\\\"\\n              data-ko-editable=\\\"longText\\\" class=\\\"long-text links-color\\\">\\n              <p>Far far away, behind the word mountains, far from the countries <a href=\\\"\\\">Vokalia and Consonantia</a>, there live the blind texts.</p>\\n              <p>Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia.</p>\\n            </td>\\n          </tr>\\n        </table>\\n        </div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\\n      </td>\\n    </tr>\\n  </table>\\n  <!-- /textBlock -->\\n\\n  <!-- tripleArticleBlock -->\\n  <table class=\\\"vb-outer\\\" width=\\\"100%\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" bgcolor=\\\"#bfbfbf\\\"\\n    style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\" data-ko-block=\\\"tripleArticleBlock\\\">\\n    <tr>\\n      <td class=\\\"vb-outer\\\" align=\\\"center\\\" valign=\\\"top\\\" bgcolor=\\\"#bfbfbf\\\"\\n        style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"570\\\"><tr><td align=\\\"center\\\" valign=\\\"top\\\"><![endif]-->\\n        <div class=\\\"oldwebkit\\\">\\n        <table width=\\\"570\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"9\\\" class=\\\"vb-row fullpad\\\" bgcolor=\\\"#ffffff\\\"\\n          style=\\\"width: 100%; max-width: 570px; background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor;\\\">\\n          <tr>\\n            <td align=\\\"center\\\" valign=\\\"top\\\" class=\\\"mobile-row\\\" style=\\\"font-size: 0\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"552\\\"><tr><![endif]-->\\n<!--[if (gte mso 9)|(lte ie 8)]><td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"184\\\"><![endif]-->\\n<div style=\\\"display:inline-block; max-width:184px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full\\\">\\n\\n                    <table class=\\\"vb-content\\\" border=\\\"0\\\" cellspacing=\\\"9\\\" cellpadding=\\\"0\\\" width=\\\"184\\\" style=\\\"width: 100%\\\" align=\\\"left\\\">\\n                      <tr data-ko-display=\\\"imageVisible\\\">\\n                        <td width=\\\"100%\\\" valign=\\\"top\\\" align=\\\"left\\\" class=\\\"links-color\\\" style=\\\"padding-bottom: 9px\\\">\\n                          <a data-ko-link=\\\"leftImage.url\\\" href=\\\"\\\">\\n                            <img data-ko-editable=\\\"leftImage.src\\\" border=\\\"0\\\" hspace=\\\"0\\\" vspace=\\\"0\\\" width=\\\"166\\\" height=\\\"90\\\"\\n                              src=\\\"[PLACEHOLDER_166x90]\\\" class=\\\"mobile-full\\\"\\n                             alt=\\\"\\\" style=\\\"vertical-align:top; width: 100%; height: auto; -ko-attr-height: @imageHeight;\\n                               -ko-attr-alt: @leftImage.alt\\\" />\\n                          </a>\\n                        </td>\\n                      </tr>\\n                      <tr data-ko-display=\\\"titleVisible\\\">\\n                        <td style=\\\"font-size: 18px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; text-align:left;\\n                          -ko-font-size: @[titleTextStyle.size]px; -ko-font-family: @titleTextStyle.face; -ko-color: @titleTextStyle.color\\\">\\n                          <span style=\\\"color: #3f3f3f; -ko-color: @titleTextStyle.color\\\" data-ko-editable=\\\"leftTitleText\\\">Title\\n                          </span>\\n                        </td>\\n                      </tr>\\n                      <tr>\\n                        <td align=\\\"left\\\" style=\\\"text-align: left; font-size: 13px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f;\\n                          -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face; -ko-color: @longTextStyle.color\\\"\\n                          data-ko-editable=\\\"leftLongText\\\" class=\\\"long-text links-color\\\">\\n                          <p>Far far away, behind the word mountains, far from the countries <a href=\\\"\\\">Vokalia and Consonantia</a>, there live the blind texts. </p>\\n                        </td>\\n                      </tr>\\n                      <tr data-ko-display=\\\"buttonVisible\\\">\\n                        <td valign=\\\"top\\\">\\n                          <table cellpadding=\\\"0\\\" border=\\\"0\\\" align=\\\"left\\\" cellspacing=\\\"0\\\" class=\\\"mobile-full\\\" style=\\\"padding-top: 4px\\\">\\n                            <tr>\\n                              <td width=\\\"auto\\\" valign=\\\"middle\\\" bgcolor=\\\"#bfbfbf\\\" align=\\\"center\\\" height=\\\"26\\\"\\n                                style=\\\"font-size: 13px; font-family: Arial, Helvetica, sans-serif; text-align:center; color: #3f3f3f; font-weight: normal;\\n                                padding-left: 18px; padding-right: 18px; background-color: #bfbfbf; border-radius: 4px;\\n                                -ko-border-radius: @[buttonStyle.radius]px;\\n                                -ko-attr-bgcolor: @buttonStyle.buttonColor; -ko-background-color: @buttonStyle.buttonColor;\\n                                -ko-font-size: @[buttonStyle.size]px; -ko-font-family: @buttonStyle.face; -ko-color: @buttonStyle.color; \\\">\\n                                <a data-ko-editable=\\\"leftButtonLink.text\\\" href=\\\"\\\" style=\\\"text-decoration: none; color: #3f3f3f; font-weight: normal;\\n                                  -ko-color: @buttonStyle.color; -ko-attr-href: @leftButtonLink.url\\\">BUTTON</a>\\n                              </td>\\n                            </tr>\\n                          </table>\\n                        </td>\\n                      </tr>\\n                    </table>\\n\\n</div><!--[if (gte mso 9)|(lte ie 8)]></td>\\n<td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"184\\\">\\n<![endif]--><div style=\\\"display:inline-block; max-width:184px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full\\\">\\n\\n                    <table class=\\\"vb-content\\\" border=\\\"0\\\" cellspacing=\\\"9\\\" cellpadding=\\\"0\\\" width=\\\"184\\\" style=\\\"width: 100%\\\" align=\\\"left\\\">\\n                      <tr data-ko-display=\\\"imageVisible\\\">\\n                        <td width=\\\"100%\\\" valign=\\\"top\\\" align=\\\"left\\\" class=\\\"links-color\\\" style=\\\"padding-bottom: 9px\\\">\\n                          <a data-ko-link=\\\"middleImage.url\\\">\\n                            <img data-ko-editable=\\\"middleImage.src\\\" border=\\\"0\\\" hspace=\\\"0\\\" vspace=\\\"0\\\" width=\\\"166\\\" height=\\\"90\\\"\\n                              src=\\\"[PLACEHOLDER_166x90]\\\" class=\\\"mobile-full\\\"\\n                              alt=\\\"\\\" style=\\\"vertical-align:top; width: 100%; height: auto; -ko-attr-height: @imageHeight;\\n                              -ko-attr-alt: @middleImage.alt\\\" />\\n                          </a>\\n                        </td>\\n                      </tr>\\n                      <tr data-ko-display=\\\"titleVisible\\\">\\n                        <td style=\\\"font-size: 18px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; text-align:left;\\n                          -ko-font-size: @[titleTextStyle.size]px; -ko-font-family: @titleTextStyle.face; -ko-color: @titleTextStyle.color\\\">\\n                          <span style=\\\"color: #3f3f3f; -ko-color: @titleTextStyle.color\\\"  data-ko-editable=\\\"middleTitleText\\\">\\n                         Title\\n                          </span>\\n                        </td>\\n                      </tr>\\n                      <tr>\\n                        <td align=\\\"left\\\" style=\\\"text-align: left; font-size: 13px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f;\\n                          -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face; -ko-color: @longTextStyle.color\\\"\\n                          data-ko-editable=\\\"middleLongText\\\" class=\\\"long-text links-color\\\">\\n                          <p>Far far away, behind the word mountains, far from the countries <a href=\\\"\\\">Vokalia and Consonantia</a>, there live the blind texts. </p>\\n                        </td>\\n                      </tr>\\n                      <tr data-ko-display=\\\"buttonVisible\\\">\\n                        <td valign=\\\"top\\\">\\n                          <table cellpadding=\\\"0\\\" border=\\\"0\\\" align=\\\"left\\\" cellspacing=\\\"0\\\" class=\\\"mobile-full\\\" style=\\\"padding-top: 4px\\\">\\n                            <tr>\\n                              <td width=\\\"auto\\\" valign=\\\"middle\\\" bgcolor=\\\"#bfbfbf\\\" align=\\\"center\\\" height=\\\"26\\\"\\n                                style=\\\"font-size: 13px; font-family: Arial, Helvetica, sans-serif; text-align:center; color: #3f3f3f; font-weight: normal;\\n                                padding-left: 18px; padding-right: 18px; background-color: #bfbfbf; border-radius: 4px;\\n                                -ko-border-radius: @[buttonStyle.radius]px;\\n                                -ko-attr-bgcolor: @buttonStyle.buttonColor; -ko-background-color: @buttonStyle.buttonColor;\\n                                -ko-font-size: @[buttonStyle.size]px; -ko-font-family: @buttonStyle.face; -ko-color: @buttonStyle.color; \\\">\\n                                <a data-ko-editable=\\\"middleButtonLink.text\\\" href=\\\"\\\" style=\\\"text-decoration: none; color: #3f3f3f; font-weight: normal;\\n                                  -ko-color: @buttonStyle.color; -ko-attr-href: @middleButtonLink.url\\\">BUTTON</a>\\n                              </td>\\n                            </tr>\\n                          </table>\\n                        </td>\\n                      </tr>\\n                    </table>\\n\\n</div><!--[if (gte mso 9)|(lte ie 8)]></td>\\n<td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"184\\\">\\n<![endif]--><div style=\\\"display:inline-block; max-width:184px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full\\\">\\n\\n                    <table class=\\\"vb-content\\\" border=\\\"0\\\" cellspacing=\\\"9\\\" cellpadding=\\\"0\\\" width=\\\"184\\\" style=\\\"width: 100%\\\" align=\\\"right\\\">\\n                      <tr data-ko-display=\\\"imageVisible\\\">\\n                        <td width=\\\"100%\\\" valign=\\\"top\\\" align=\\\"left\\\" class=\\\"links-color\\\" style=\\\"padding-bottom: 9px\\\">\\n                          <a data-ko-link=\\\"rightImage.url\\\">\\n                            <img data-ko-editable=\\\"rightImage.src\\\" border=\\\"0\\\" hspace=\\\"0\\\" vspace=\\\"0\\\" width=\\\"166\\\" height=\\\"90\\\"\\n                              src=\\\"[PLACEHOLDER_166x90]\\\" class=\\\"mobile-full\\\"\\n                              alt=\\\"\\\" style=\\\"vertical-align:top; width: 100%; height: auto; -ko-attr-height: @imageHeight;\\n                              -ko-attr-alt: @rightImage.alt\\\" />\\n                          </a>\\n                        </td>\\n                      </tr>\\n                      <tr data-ko-display=\\\"titleVisible\\\">\\n                        <td style=\\\"font-size: 18px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; text-align:left;\\n                          -ko-font-size: @[titleTextStyle.size]px; -ko-font-family: @titleTextStyle.face; -ko-color: @titleTextStyle.color\\\">\\n                          <span style=\\\"color: #3f3f3f; -ko-color: @titleTextStyle.color\\\" data-ko-editable=\\\"rightTitleText\\\">\\n                         Title\\n                          </span>\\n                        </td>\\n                      </tr>\\n                      <tr>\\n                        <td align=\\\"left\\\" style=\\\"text-align: left; font-size: 13px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f;\\n                          -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face; -ko-color: @longTextStyle.color\\\"\\n                          data-ko-editable=\\\"rightLongText\\\" class=\\\"long-text links-color\\\">\\n                          <p>Far far away, behind the word mountains, far from the countries <a href=\\\"\\\">Vokalia and Consonantia</a>, there live the blind texts. </p>\\n                        </td>\\n                      </tr>\\n                      <tr data-ko-display=\\\"buttonVisible\\\">\\n                        <td valign=\\\"top\\\">\\n                          <table cellpadding=\\\"0\\\" border=\\\"0\\\" align=\\\"left\\\" cellspacing=\\\"0\\\" class=\\\"mobile-full\\\" style=\\\"padding-top: 4px\\\">\\n                            <tr>\\n                              <td width=\\\"auto\\\" valign=\\\"middle\\\" bgcolor=\\\"#bfbfbf\\\" align=\\\"center\\\" height=\\\"26\\\"\\n                                style=\\\"font-size: 13px; font-family: Arial, Helvetica, sans-serif; text-align:center; color: #3f3f3f; font-weight: normal;\\n                                padding-left: 18px; padding-right: 18px; background-color: #bfbfbf; border-radius: 4px;\\n                                -ko-border-radius: @[buttonStyle.radius]px;\\n                                -ko-attr-bgcolor: @buttonStyle.buttonColor; -ko-background-color: @buttonStyle.buttonColor;\\n                                -ko-font-size: @[buttonStyle.size]px; -ko-font-family: @buttonStyle.face; -ko-color: @buttonStyle.color;\\\">\\n                                <a data-ko-editable=\\\"rightButtonLink.text\\\" href=\\\"\\\" style=\\\"text-decoration: none; color: #3f3f3f; font-weight: normal;\\n                                  -ko-color: @buttonStyle.color; -ko-attr-href: @rightButtonLink.url\\\">BUTTON</a>\\n                              </td>\\n                            </tr>\\n                          </table>\\n                        </td>\\n                      </tr>\\n                    </table>\\n\\n</div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td><![endif]-->\\n<!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]-->\\n\\n            </td>\\n          </tr>\\n        </table>\\n        </div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\\n      </td>\\n    </tr>\\n  </table>\\n  <!-- /tripleArticleBlock -->\\n\\n  <!-- doubleArticleBlock -->\\n  <table class=\\\"vb-outer\\\" width=\\\"100%\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" bgcolor=\\\"#bfbfbf\\\"\\n    style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\" data-ko-block=\\\"doubleArticleBlock\\\">\\n    <tr>\\n      <td class=\\\"vb-outer\\\" align=\\\"center\\\" valign=\\\"top\\\" bgcolor=\\\"#bfbfbf\\\"\\n        style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"570\\\"><tr><td align=\\\"center\\\" valign=\\\"top\\\"><![endif]-->\\n        <div class=\\\"oldwebkit\\\">\\n        <table width=\\\"570\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"9\\\" class=\\\"vb-row fullpad\\\" bgcolor=\\\"#ffffff\\\"\\n          style=\\\"width: 100%; max-width: 570px; background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor;\\\">\\n          <tr>\\n            <td align=\\\"center\\\" valign=\\\"top\\\" style=\\\"font-size: 0\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"552\\\"><tr><![endif]-->\\n<!--[if (gte mso 9)|(lte ie 8)]><td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"276\\\"><![endif]-->\\n<div style=\\\"display:inline-block; max-width:276px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full\\\">\\n\\n                    <table class=\\\"vb-content\\\" border=\\\"0\\\" cellspacing=\\\"9\\\" cellpadding=\\\"0\\\" width=\\\"276\\\" style=\\\"width: 100%\\\" align=\\\"left\\\">\\n                      <tr data-ko-display=\\\"imageVisible\\\">\\n                        <td width=\\\"100%\\\" align=\\\"left\\\" class=\\\"links-color\\\" style=\\\"padding-bottom: 9px\\\">\\n                          <a data-ko-link=\\\"leftImage.url\\\">\\n                            <img data-ko-editable=\\\"leftImage.src\\\" border=\\\"0\\\" hspace=\\\"0\\\" vspace=\\\"0\\\" width=\\\"258\\\" height=\\\"100\\\"\\n                              src=\\\"[PLACEHOLDER_258x100]\\\" class=\\\"mobile-full\\\"\\n                              alt=\\\"\\\" style=\\\"vertical-align:top; width: 100%; height: auto; -ko-attr-height: @imageHeight;\\n                              -ko-attr-alt: @leftImage.alt\\\" />\\n                          </a>\\n                        </td>\\n                      </tr>\\n                      <tr data-ko-display=\\\"titleVisible\\\">\\n                        <td style=\\\"font-size: 18px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; text-align:left;\\n                          -ko-font-size: @[titleTextStyle.size]px; -ko-font-family: @titleTextStyle.face; -ko-color: @titleTextStyle.color\\\">\\n                          <span style=\\\"color: #3f3f3f; -ko-color: @titleTextStyle.color\\\" data-ko-editable=\\\"leftTitleText\\\">\\n                          Title\\n                          </span>\\n                        </td>\\n                      </tr>\\n                      <tr>\\n                        <td align=\\\"left\\\" style=\\\"text-align: left; font-size: 13px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f;\\n                          -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face; -ko-color: @longTextStyle.color\\\"\\n                          data-ko-editable=\\\"leftLongText\\\" class=\\\"long-text links-color\\\">\\n                          <p>Far far away, behind the word mountains, far from the countries <a href=\\\"\\\">Vokalia and Consonantia</a>, there live the blind texts. </p>\\n                        </td>\\n                      </tr>\\n                      <tr data-ko-display=\\\"buttonVisible\\\">\\n                        <td valign=\\\"top\\\">\\n                          <table cellpadding=\\\"0\\\" border=\\\"0\\\" align=\\\"left\\\" cellspacing=\\\"0\\\" class=\\\"mobile-full\\\" style=\\\"padding-top: 4px;\\\">\\n                            <tr>\\n                              <td width=\\\"auto\\\" valign=\\\"middle\\\" bgcolor=\\\"#bfbfbf\\\" align=\\\"center\\\" height=\\\"26\\\"\\n                                style=\\\"font-size: 13px; font-family: Arial, Helvetica, sans-serif; text-align:center; color: #3f3f3f; font-weight: normal;\\n                                padding-left: 18px; padding-right: 18px; background-color: #bfbfbf; border-radius: 4px;\\n                                -ko-border-radius: @[buttonStyle.radius]px;\\n                                -ko-attr-bgcolor: @buttonStyle.buttonColor; -ko-background-color: @buttonStyle.buttonColor;\\n                                -ko-font-size: @[buttonStyle.size]px; -ko-font-family: @buttonStyle.face; -ko-color: @buttonStyle.color; \\\">\\n                                <a data-ko-editable=\\\"leftButtonLink.text\\\" href=\\\"\\\" style=\\\"text-decoration: none; color: #3f3f3f; font-weight: normal;\\n                                  -ko-color: @buttonStyle.color; -ko-attr-href: @leftButtonLink.url\\\">BUTTON</a>\\n                              </td>\\n                            </tr>\\n                          </table>\\n                        </td>\\n                      </tr>\\n                    </table>\\n\\n</div><!--[if (gte mso 9)|(lte ie 8)]></td>\\n<td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"276\\\">\\n<![endif]--><div style=\\\"display:inline-block; max-width:276px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full\\\">\\n\\n                    <table class=\\\"vb-content\\\" border=\\\"0\\\" cellspacing=\\\"9\\\" cellpadding=\\\"0\\\" width=\\\"276\\\" style=\\\"width: 100%\\\" align=\\\"right\\\">\\n                      <tr data-ko-display=\\\"imageVisible\\\">\\n                        <td width=\\\"100%\\\" valign=\\\"top\\\" align=\\\"left\\\" class=\\\"links-color\\\" style=\\\"padding-bottom: 9px\\\">\\n                          <a data-ko-link=\\\"rightImage.url\\\">\\n                            <img data-ko-editable=\\\"rightImage.src\\\" border=\\\"0\\\" hspace=\\\"0\\\" vspace=\\\"0\\\" width=\\\"258\\\" height=\\\"100\\\"\\n                              src=\\\"[PLACEHOLDER_258x100]\\\" class=\\\"mobile-full\\\"\\n                              alt=\\\"\\\" style=\\\"vertical-align:top; width: 100%; height: auto; -ko-attr-height: @imageHeight;\\n                              -ko-attr-alt: @rightImage.alt\\\" />\\n                          </a>\\n                        </td>\\n                      </tr>\\n                      <tr data-ko-display=\\\"titleVisible\\\">\\n                        <td style=\\\"font-size: 18px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; text-align:left;\\n                          -ko-font-size: @[titleTextStyle.size]px; -ko-font-family: @titleTextStyle.face; -ko-color: @titleTextStyle.color\\\">\\n                          <span style=\\\"color: #3f3f3f; -ko-color: @titleTextStyle.color\\\" data-ko-editable=\\\"rightTitleText\\\">\\n                         Title\\n                          </span>\\n                        </td>\\n                      </tr>\\n                      <tr>\\n                        <td align=\\\"left\\\" style=\\\"text-align: left; font-size: 13px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f;\\n                          -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face; -ko-color: @longTextStyle.color\\\"\\n                          data-ko-editable=\\\"rightLongText\\\" class=\\\"long-text links-color\\\">\\n                          <p>Far far away, behind the word mountains, far from the countries <a href=\\\"\\\">Vokalia and Consonantia</a>, there live the blind texts.</p>\\n                        </td>\\n                      </tr>\\n                      <tr data-ko-display=\\\"buttonVisible\\\">\\n                        <td valign=\\\"top\\\">\\n                          <table cellpadding=\\\"0\\\" border=\\\"0\\\" align=\\\"left\\\" cellspacing=\\\"0\\\" class=\\\"mobile-full\\\" style=\\\"padding-top: 4px;\\\">\\n                            <tr>\\n                              <td width=\\\"auto\\\" valign=\\\"middle\\\" bgcolor=\\\"#bfbfbf\\\" align=\\\"center\\\" height=\\\"26\\\"\\n                                style=\\\"font-size: 13px; font-family: Arial, Helvetica, sans-serif; text-align:center; color: #3f3f3f; font-weight: normal;\\n                                padding-left: 18px; padding-right: 18px; background-color: #bfbfbf; border-radius: 4px;\\n                                -ko-border-radius: @[buttonStyle.radius]px;\\n                                -ko-attr-bgcolor: @buttonStyle.buttonColor; -ko-background-color: @buttonStyle.buttonColor;\\n                                -ko-font-size: @[buttonStyle.size]px; -ko-font-family: @buttonStyle.face; -ko-color: @buttonStyle.color; \\\">\\n                                <a data-ko-editable=\\\"rightButtonLink.text\\\" href=\\\"\\\" style=\\\"text-decoration: none; color: #3f3f3f; font-weight: normal;\\n                                  -ko-color: @buttonStyle.color; -ko-attr-href: @rightButtonLink.url\\\">BUTTON</a>\\n                              </td>\\n                            </tr>\\n                          </table>\\n                        </td>\\n                      </tr>\\n                    </table>\\n\\n</div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td><![endif]-->\\n<!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]-->\\n\\n            </td>\\n          </tr>\\n        </table>\\n        </div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\\n      </td>\\n    </tr>\\n  </table>\\n  <!-- /doubleArticleBlock -->\\n\\n  <!-- hrBlock -->\\n  <table class=\\\"vb-outer\\\" width=\\\"100%\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" bgcolor=\\\"#bfbfbf\\\"\\n    style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\" data-ko-block=\\\"hrBlock\\\">\\n    <tr>\\n      <td class=\\\"vb-outer\\\" align=\\\"center\\\" valign=\\\"top\\\" bgcolor=\\\"#bfbfbf\\\"\\n        style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"570\\\"><tr><td align=\\\"center\\\" valign=\\\"top\\\"><![endif]-->\\n        <div class=\\\"oldwebkit\\\">\\n        <table width=\\\"570\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"9\\\" class=\\\"vb-container halfpad\\\" bgcolor=\\\"#ffffff\\\"\\n          style=\\\"width: 100%; max-width: 570px; background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor;\\\">\\n          <tr>\\n            <td valign=\\\"top\\\" bgcolor=\\\"#ffffff\\\" style=\\\"background-color: #ffffff;\\n              -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor\\\" align=\\\"center\\\">\\n              <table width=\\\"100%\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" border=\\\"0\\\"\\n                style=\\\"width:100%; -ko-width: @[hrStyle.hrWidth]%; -ko-attr-width: @[hrStyle.hrWidth]%\\\">\\n                <tr>\\n                  <td width=\\\"100%\\\" height=\\\"1\\\" style=\\\"font-size:1px; line-height: 1px; width: 100%; background-color: #3f3f3f;\\n                  -ko-background-color: @hrStyle.color; -ko-attr-height: @hrStyle.hrHeight; -ko-line-height: @[hrStyle.hrHeight]px\\\">&nbsp;</td>\\n                </tr>\\n              </table>\\n            </td>\\n          </tr>\\n        </table>\\n        </div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\\n      </td>\\n    </tr>\\n  </table>\\n  <!-- /hrBlock -->\\n\\n  <!-- buttonBlock -->\\n  <table class=\\\"vb-outer\\\" width=\\\"100%\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" bgcolor=\\\"#bfbfbf\\\"\\n    style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\"  data-ko-block=\\\"buttonBlock\\\">\\n    <tr>\\n      <td class=\\\"vb-outer\\\" align=\\\"center\\\" valign=\\\"top\\\" bgcolor=\\\"#bfbfbf\\\"\\n        style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"570\\\"><tr><td align=\\\"center\\\" valign=\\\"top\\\"><![endif]-->\\n        <div class=\\\"oldwebkit\\\">\\n        <table width=\\\"570\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"18\\\" class=\\\"vb-container fullpad\\\" bgcolor=\\\"#ffffff\\\"\\n          style=\\\"width: 100%; max-width: 570px; background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor;\\\">\\n          <tr>\\n            <td valign=\\\"top\\\" bgcolor=\\\"#ffffff\\\" style=\\\"background-color: #ffffff;\\n              -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor\\\" align=\\\"center\\\">\\n\\n              <table cellpadding=\\\"0\\\" border=\\\"0\\\" align=\\\"center\\\" cellspacing=\\\"0\\\" class=\\\"mobile-full\\\">\\n                <tr>\\n                  <td width=\\\"auto\\\" valign=\\\"middle\\\" bgcolor=\\\"#bfbfbf\\\" align=\\\"center\\\" height=\\\"50\\\"\\n                    style=\\\"font-size:22px; font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; font-weight: normal;\\n                    padding-left: 14px; padding-right: 14px; background-color: #bfbfbf; border-radius: 4px;\\n                    -ko-attr-bgcolor: @bigButtonStyle.buttonColor; -ko-background-color: @bigButtonStyle.buttonColor;\\n                     -ko-border-radius: @[bigButtonStyle.radius]px;\\n                    -ko-font-size: @[bigButtonStyle.size]px; -ko-font-family: @bigButtonStyle.face; -ko-color: @bigButtonStyle.color; \\\">\\n                    <a data-ko-link=\\\"link.url\\\" data-ko-editable=\\\"link.text\\\" href=\\\"\\\" style=\\\"text-decoration: none; color: #3f3f3f; font-weight: normal;\\n                      -ko-color: @bigButtonStyle.color;\\\">BUTTON</a>\\n                  </td>\\n                </tr>\\n              </table>\\n\\n            </td>\\n          </tr>\\n        </table>\\n        </div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\\n      </td>\\n    </tr>\\n  </table>\\n  <!-- /buttonBlock -->\\n\\n  <!-- imageBlock  -->\\n  <table class=\\\"vb-outer\\\" width=\\\"100%\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" bgcolor=\\\"#bfbfbf\\\" style=\\\"background-color: #bfbfbf;\\n    -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\" data-ko-block=\\\"imageBlock\\\">\\n    <tr>\\n      <td class=\\\"vb-outer\\\" valign=\\\"top\\\" align=\\\"center\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"570\\\"><tr><td align=\\\"center\\\" valign=\\\"top\\\"><![endif]-->\\n        <div class=\\\"oldwebkit\\\">\\n        <table data-ko-display=\\\"gutterVisible eq false\\\" width=\\\"570\\\" class=\\\"vb-container fullwidth\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" bgcolor=\\\"#ffffff\\\" align=\\\"center\\\"\\n          cellspacing=\\\"0\\\" style=\\\"width: 100%; max-width: 570px; background-color: #ffffff; -ko-background-color: @backgroundColor; -ko-attr-bgcolor: @backgroundColor;\\\">\\n          <tr>\\n            <td valign=\\\"top\\\" align=\\\"center\\\">\\n              <a data-ko-link=\\\"image.url\\\" href=\\\"\\\" style=\\\"text-decoration: none;\\\"><img data-ko-editable=\\\"image.src\\\"\\n                  hspace=\\\"0\\\" border=\\\"0\\\" vspace=\\\"0\\\" width=\\\"570\\\" data-ko-placeholder-height=\\\"200\\\"\\n                  src=\\\"[PLACEHOLDER_570x200]\\\" class=\\\"mobile-full\\\"\\n                  alt=\\\"\\\" style=\\\"max-width: 570px; display: block; border-radius: 0px; width: 100%; height: auto; font-size: 13px;\\n                  font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px;\\n                  -ko-font-family: @longTextStyle.face; -ko-color: @longTextStyle.color; -ko-attr-alt: @image.alt;\\\" /></a>\\n            </td>\\n          </tr>\\n        </table>\\n        <table data-ko-display=\\\"gutterVisible\\\" width=\\\"570\\\" class=\\\"vb-container fullpad\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" bgcolor=\\\"#ffffff\\\" align=\\\"center\\\"\\n          cellspacing=\\\"18\\\" style=\\\"width: 100%; max-width: 570px; background-color: #ffffff; -ko-background-color: @backgroundColor; -ko-attr-bgcolor: @backgroundColor; display: none;\\\">\\n          <tr>\\n            <td valign=\\\"top\\\" align=\\\"center\\\">\\n              <a data-ko-link=\\\"image.url\\\" href=\\\"\\\" style=\\\"text-decoration: none;\\\"><img data-ko-editable=\\\"image.src\\\"\\n                  hspace=\\\"0\\\" border=\\\"0\\\" vspace=\\\"0\\\" width=\\\"534\\\" data-ko-placeholder-height=\\\"280\\\"\\n                  src=\\\"[PLACEHOLDER_534x280]\\\" class=\\\"mobile-full\\\"\\n                  alt=\\\"\\\" style=\\\"max-width: 534px; display: block; border-radius: 0px; width: 100%; height: auto; font-size: 13px;\\n                  font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px;\\n                  -ko-font-family: @longTextStyle.face; -ko-color: @longTextStyle.color; -ko-attr-alt: @image.alt;\\\" /></a>\\n            </td>\\n          </tr>\\n        </table>\\n        </div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\\n      </td>\\n    </tr>\\n  </table>\\n  <!-- imageBlock -->\\n\\n  <!-- doubleImageBlock -->\\n  <table class=\\\"vb-outer\\\" width=\\\"100%\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" bgcolor=\\\"#bfbfbf\\\" style=\\\"background-color: #bfbfbf;\\n    -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\" data-ko-block=\\\"doubleImageBlock\\\">\\n    <tr>\\n      <td class=\\\"vb-outer\\\" align=\\\"center\\\" valign=\\\"top\\\" bgcolor=\\\"#bfbfbf\\\"\\n        style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\">\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"570\\\"><tr><td align=\\\"center\\\" valign=\\\"top\\\"><![endif]-->\\n        <div class=\\\"oldwebkit\\\">\\n        <table data-ko-display=\\\"gutterVisible eq false\\\" width=\\\"570\\\" class=\\\"vb-container fullwidth\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" bgcolor=\\\"#ffffff\\\" align=\\\"center\\\"\\n          cellspacing=\\\"0\\\" style=\\\"width: 100%; max-width: 570px; background-color: #ffffff; -ko-background-color: @backgroundColor; -ko-attr-bgcolor: @backgroundColor;\\\">\\n          <tr>\\n            <td valign=\\\"top\\\" align=\\\"center\\\" class=\\\"mobile-row\\\" style=\\\"font-size: 0\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"570\\\"><tr><![endif]-->\\n<!--[if (gte mso 9)|(lte ie 8)]><td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"285\\\"><![endif]-->\\n<div style=\\\"display:inline-block; max-width:285px; vertical-align:top; width:100%; width:100%; \\\" class=\\\"mobile-full\\\">\\n              <a data-ko-link=\\\"leftImage.url\\\" href=\\\"\\\" style=\\\"text-decoration: none;\\\"><img data-ko-editable=\\\"leftImage.src\\\"\\n                  hspace=\\\"0\\\" align=\\\"left\\\" border=\\\"0\\\" vspace=\\\"0\\\" width=\\\"285\\\" height=\\\"180\\\" class=\\\"mobile-full\\\"\\n                  src=\\\"[PLACEHOLDER_285x180]\\\"\\n                  alt=\\\"\\\" style=\\\"display: block; border-radius: 0px; width: 100%; height: auto;font-size: 13px;\\n                  font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face;\\n                  -ko-color: @longTextStyle.color; -ko-attr-height: @imageHeight; -ko-attr-alt: @leftImage.alt;\\\" /></a>\\n</div><!--[if (gte mso 9)|(lte ie 8)]></td>\\n<td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"285\\\">\\n<![endif]--><div style=\\\"display:inline-block; max-width:285px; vertical-align:top; width:100%; width:100%; \\\" class=\\\"mobile-full\\\">\\n              <a data-ko-link=\\\"rightImage.url\\\" href=\\\"\\\" style=\\\"text-decoration: none;\\\"><img data-ko-editable=\\\"rightImage.src\\\"\\n                  hspace=\\\"0\\\" align=\\\"right\\\" border=\\\"0\\\" vspace=\\\"0\\\" width=\\\"285\\\" height=\\\"180\\\" class=\\\"mobile-full\\\"\\n                  src=\\\"[PLACEHOLDER_285x180]\\\"\\n                  alt=\\\"\\\" style=\\\"display: block; border-radius: 0px; width: 100%; height: auto;font-size: 13px;\\n                  font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face;\\n                  -ko-color: @longTextStyle.color; -ko-attr-height: @imageHeight; -ko-attr-alt: @rightImage.alt;\\\" /></a>\\n</div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td><![endif]-->\\n<!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]-->\\n            </td>\\n          </tr>\\n        </table>\\n        <table data-ko-display=\\\"gutterVisible\\\" width=\\\"570\\\" class=\\\"vb-row fullpad\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"9\\\" bgcolor=\\\"#ffffff\\\"\\n            style=\\\"width: 100%; max-width: 570px; background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor; display: none;\\\">\\n          <tr>\\n            <td align=\\\"center\\\" valign=\\\"top\\\" bgcolor=\\\"#ffffff\\\" style=\\\"background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor; font-size: 0\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"552\\\"><tr><![endif]-->\\n<!--[if (gte mso 9)|(lte ie 8)]><td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"276\\\"><![endif]-->\\n<div style=\\\"display:inline-block; max-width:276px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full\\\">\\n\\n              <table class=\\\"vb-content\\\" width=\\\"276\\\" style=\\\"width: 100%\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"9\\\" align=\\\"left\\\">\\n                <tr>\\n                  <td valign=\\\"top\\\">\\n                    <a data-ko-link=\\\"leftImage.url\\\" href=\\\"\\\" style=\\\"text-decoration: none;\\\">\\n                      <img data-ko-editable=\\\"leftImage.src\\\"\\n                        hspace=\\\"0\\\" align=\\\"left\\\" border=\\\"0\\\" vspace=\\\"0\\\" width=\\\"258\\\" height=\\\"180\\\"\\n                        src=\\\"[PLACEHOLDER_258x180]\\\" class=\\\"mobile-full\\\"\\n                        alt=\\\"\\\" style=\\\"display: block; border-radius: 0px; width: 100%; height: auto;font-size: 13px;\\n                        font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face;\\n                        -ko-color: @longTextStyle.color; -ko-attr-height: @imageHeight; -ko-attr-alt: @leftImage.alt;\\\" /></a>\\n                  </td>\\n                </tr>\\n              </table>\\n\\n</div><!--[if (gte mso 9)|(lte ie 8)]></td>\\n<td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"276\\\">\\n<![endif]--><div style=\\\"display:inline-block; max-width:276px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full\\\">\\n\\n              <table class=\\\"vb-content\\\" width=\\\"276\\\" style=\\\"width: 100%\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"9\\\" align=\\\"right\\\">\\n                <tr>\\n                  <td valign=\\\"top\\\">\\n                    <a data-ko-link=\\\"rightImage.url\\\" href=\\\"\\\" style=\\\"text-decoration: none;\\\"><img data-ko-editable=\\\"rightImage.src\\\"\\n                        hspace=\\\"0\\\" align=\\\"right\\\" border=\\\"0\\\" vspace=\\\"0\\\" width=\\\"258\\\" height=\\\"180\\\"\\n                        src=\\\"[PLACEHOLDER_258x180]\\\" class=\\\"mobile-full\\\"\\n                        alt=\\\"\\\" style=\\\"display: block; border-radius: 0px; width: 100%; height: auto;font-size: 13px;\\n                        font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face;\\n                        -ko-color: @longTextStyle.color; -ko-attr-height: @imageHeight; -ko-attr-alt: @rightImage.alt;\\\" /></a>\\n                  </td>\\n                </tr>\\n              </table>\\n\\n</div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td><![endif]-->\\n<!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]-->\\n\\n            </td>\\n          </tr>\\n        </table>\\n        </div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\\n      </td>\\n    </tr>\\n  </table>\\n  <!-- /doubleImageBlock -->\\n\\n  <!--  tripleImageBlock -->\\n  <table class=\\\"vb-outer\\\" width=\\\"100%\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" bgcolor=\\\"#bfbfbf\\\" style=\\\"background-color: #bfbfbf;\\n    -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\" data-ko-block=\\\"tripleImageBlock\\\">\\n    <tr>\\n      <td class=\\\"vb-outer\\\" valign=\\\"top\\\" align=\\\"center\\\" style=\\\"\\\">\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"570\\\"><tr><td align=\\\"center\\\" valign=\\\"top\\\"><![endif]-->\\n        <div class=\\\"oldwebkit\\\">\\n        <table data-ko-display=\\\"gutterVisible eq false\\\" width=\\\"570\\\" class=\\\"vb-container fullwidth\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" bgcolor=\\\"#ffffff\\\" align=\\\"center\\\"\\n          cellspacing=\\\"0\\\" style=\\\"width: 100%; max-width: 570px; background-color: #ffffff; -ko-background-color: @backgroundColor; -ko-attr-bgcolor: @backgroundColor;\\\">\\n          <tr>\\n            <td valign=\\\"top\\\" align=\\\"center\\\" class=\\\"mobile-row\\\" style=\\\"font-size: 0\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"570\\\"><tr><![endif]-->\\n<!--[if (gte mso 9)|(lte ie 8)]><td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"190\\\"><![endif]-->\\n<div style=\\\"display:inline-block; max-width:190px; vertical-align:top; width:100%; \\\" class=\\\"mobile-full\\\">\\n              <a data-ko-link=\\\"leftImage.url\\\" href=\\\"\\\" style=\\\"text-decoration: none;\\\"><img data-ko-editable=\\\"leftImage.src\\\"\\n                  hspace=\\\"0\\\" align=\\\"left\\\" border=\\\"0\\\" vspace=\\\"0\\\" width=\\\"190\\\" height=\\\"160\\\" class=\\\"mobile-full\\\"\\n                  src=\\\"[PLACEHOLDER_190x160]\\\"\\n                  alt=\\\"\\\" style=\\\"display: block; border-radius: 0px; width: 100%; height: auto;font-size: 13px;\\n                  font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face;\\n                  -ko-color: @longTextStyle.color; -ko-attr-height: @imageHeight; -ko-attr-alt: @leftImage.alt;\\\" /></a>\\n</div><!--[if (gte mso 9)|(lte ie 8)]></td>\\n<td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"190\\\">\\n<![endif]--><div style=\\\"display:inline-block; max-width:190px; vertical-align:top; width:100%; \\\" class=\\\"mobile-full\\\">\\n              <a data-ko-link=\\\"middleImage.url\\\" href=\\\"\\\" style=\\\"text-decoration: none;\\\"><img data-ko-editable=\\\"middleImage.src\\\"\\n                  hspace=\\\"0\\\" align=\\\"left\\\" border=\\\"0\\\" vspace=\\\"0\\\" width=\\\"190\\\" height=\\\"160\\\" class=\\\"mobile-full\\\"\\n                  src=\\\"[PLACEHOLDER_190x160]\\\"\\n                  alt=\\\"\\\" style=\\\"display: block; border-radius: 0px; width: 100%; height: auto;font-size: 13px;\\n                  font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face;\\n                  -ko-color: @longTextStyle.color; -ko-attr-height: @imageHeight; -ko-attr-alt: @middleImage.alt;\\\" /></a>\\n</div><!--[if (gte mso 9)|(lte ie 8)]></td>\\n<td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"190\\\">\\n<![endif]--><div style=\\\"display:inline-block; max-width:190px; vertical-align:top; width:100%; \\\" class=\\\"mobile-full\\\">\\n              <a data-ko-link=\\\"rightImage.url\\\" href=\\\"\\\" style=\\\"text-decoration: none;\\\"><img data-ko-editable=\\\"rightImage.src\\\"\\n                  hspace=\\\"0\\\" align=\\\"right\\\" border=\\\"0\\\" vspace=\\\"0\\\" width=\\\"190\\\" height=\\\"160\\\" class=\\\"mobile-full\\\"\\n                  src=\\\"[PLACEHOLDER_190x160]\\\"\\n                  alt=\\\"\\\" style=\\\"display: block; border-radius: 0px; width: 100%; height: auto;font-size: 13px;\\n                  font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face;\\n                  -ko-color: @longTextStyle.color; -ko-attr-height: @imageHeight; -ko-attr-alt: @rightImage.alt;\\\" /></a>\\n</div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td><![endif]-->\\n<!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]-->\\n            </td>\\n          </tr>\\n        </table>\\n        <table data-ko-display=\\\"gutterVisible\\\" width=\\\"570\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"9\\\" bgcolor=\\\"#ffffff\\\" class=\\\"vb-row fullpad\\\"\\n          style=\\\"width: 100%; max-width: 570px; background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor; display: none;\\\">\\n          <tr>\\n            <td align=\\\"center\\\" valign=\\\"top\\\" bgcolor=\\\"#ffffff\\\" style=\\\"font-size: 0; background-color: #ffffff; -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"552\\\"><tr><![endif]-->\\n<!--[if (gte mso 9)|(lte ie 8)]><td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"184\\\"><![endif]-->\\n<div style=\\\"display:inline-block; max-width:184px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full\\\">\\n\\n              <table class=\\\"vb-content\\\" width=\\\"184\\\" style=\\\"width: 100%\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"9\\\" align=\\\"left\\\">\\n                <tr>\\n                  <td valign=\\\"top\\\">\\n                    <a data-ko-link=\\\"leftImage.url\\\" href=\\\"\\\" style=\\\"text-decoration: none;\\\"><img data-ko-editable=\\\"leftImage.src\\\"\\n                      hspace=\\\"0\\\" align=\\\"left\\\" border=\\\"0\\\" vspace=\\\"0\\\" width=\\\"166\\\" height=\\\"160\\\"\\n                      src=\\\"[PLACEHOLDER_166x160]\\\" class=\\\"mobile-full\\\"\\n                      alt=\\\"\\\" style=\\\"display: block; border-radius: 0px; width: 100%; height: auto;font-size: 13px;\\n                      font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face;\\n                      -ko-color: @longTextStyle.color; -ko-attr-height: @imageHeight; -ko-attr-alt: @leftImage.alt;\\\" /></a>\\n                  </td>\\n                </tr>\\n              </table>\\n\\n</div><!--[if (gte mso 9)|(lte ie 8)]></td>\\n<td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"184\\\">\\n<![endif]--><div style=\\\"display:inline-block; max-width:184px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full\\\">\\n\\n              <table class=\\\"vb-content\\\" width=\\\"184\\\" style=\\\"width: 100%\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"9\\\" align=\\\"left\\\">\\n                <tr>\\n                  <td valign=\\\"top\\\">\\n                    <a data-ko-link=\\\"middleImage.url\\\" href=\\\"\\\" style=\\\"text-decoration: none\\\"><img data-ko-editable=\\\"middleImage.src\\\"\\n                      hspace=\\\"0\\\" align=\\\"left\\\" border=\\\"0\\\" vspace=\\\"0\\\" width=\\\"166\\\" height=\\\"160\\\"\\n                      src=\\\"[PLACEHOLDER_166x160]\\\" class=\\\"mobile-full\\\"\\n                      alt=\\\"\\\" style=\\\"display: block; border-radius: 0px; width: 100%; height: auto;font-size: 13px;\\n                      font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face;\\n                      -ko-color: @longTextStyle.color; -ko-attr-height: @imageHeight; -ko-attr-alt: @middleImage.alt;\\\" /></a>\\n                  </td>\\n                </tr>\\n              </table>\\n\\n</div><!--[if (gte mso 9)|(lte ie 8)]></td>\\n<td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"184\\\">\\n<![endif]--><div style=\\\"display:inline-block; max-width:184px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full\\\">\\n\\n              <table class=\\\"vb-content\\\" width=\\\"184\\\" style=\\\"width: 100%\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"9\\\" align=\\\"right\\\">\\n                <tr>\\n                  <td valign=\\\"top\\\">\\n                    <a data-ko-link=\\\"rightImage.url\\\" href=\\\"\\\" style=\\\"text-decoration: none\\\"><img data-ko-editable=\\\"rightImage.src\\\"\\n                      hspace=\\\"0\\\" align=\\\"right\\\" border=\\\"0\\\" vspace=\\\"0\\\" width=\\\"166\\\" height=\\\"160\\\"\\n                      src=\\\"[PLACEHOLDER_166x160]\\\" class=\\\"mobile-full\\\"\\n                      alt=\\\"\\\" style=\\\"display: block; border-radius: 0px; width: 100%; height: auto;font-size: 13px;\\n                      font-family: Arial, Helvetica, sans-serif; color: #3f3f3f; -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face;\\n                      -ko-color: @longTextStyle.color; -ko-attr-height: @imageHeight; -ko-attr-alt: @rightImage.alt;\\\" /></a>\\n                  </td>\\n                </tr>\\n              </table>\\n\\n</div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td><![endif]-->\\n<!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]-->\\n\\n            </td>\\n          </tr>\\n        </table>\\n        </div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\\n      </td>\\n    </tr>\\n  </table>\\n  <!-- /tripleImageBlock -->\\n\\n  <!-- spacerBlock -->\\n  <table class=\\\"vb-outer\\\" width=\\\"100%\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" bgcolor=\\\"#bfbfbf\\\"\\n    style=\\\"background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor; -ko-attr-bgcolor: @externalBackgroundColor\\\" data-ko-block=\\\"spacerBlock\\\">\\n    <tr>\\n      <td class=\\\"vb-outer\\\" valign=\\\"top\\\" align=\\\"center\\\" bgcolor=\\\"#bfbfbf\\\" height=\\\"24\\\"\\n        style=\\\"-ko-attr-height: @spacerSize; height: 24px; -ko-height: @[spacerSize]px; background-color: #bfbfbf; -ko-background-color: @externalBackgroundColor;\\n        -ko-attr-bgcolor: @externalBackgroundColor; font-size:1px; line-height: 1px;\\\">&nbsp;</td>\\n    </tr>\\n  </table>\\n  <!-- /spacerBlock -->\\n\\n  <!-- socialBlock -->\\n  <table width=\\\"100%\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" bgcolor=\\\"#3f3f3f\\\"\\n    style=\\\"background-color: #3f3f3f; -ko-background-color: @backgroundColor; -ko-attr-bgcolor: @backgroundColor\\\"  data-ko-block=\\\"socialBlock\\\">\\n    <tr>\\n      <td align=\\\"center\\\" valign=\\\"top\\\" bgcolor=\\\"#3f3f3f\\\" style=\\\"background-color: #3f3f3f;\\n        -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor;\\\">\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"570\\\"><tr><td align=\\\"center\\\" valign=\\\"top\\\"><![endif]-->\\n        <div class=\\\"oldwebkit\\\">\\n        <table width=\\\"570\\\" style=\\\"width: 100%; max-width: 570px\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"9\\\" class=\\\"vb-row fullpad\\\" align=\\\"center\\\">\\n          <tr>\\n            <td valign=\\\"top\\\"  align=\\\"center\\\" style=\\\"font-size: 0;\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"552\\\"><tr><![endif]-->\\n<!--[if (gte mso 9)|(lte ie 8)]><td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"276\\\"><![endif]-->\\n<div style=\\\"display:inline-block; max-width:276px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full\\\">\\n\\n                    <table class=\\\"vb-content\\\" border=\\\"0\\\" cellspacing=\\\"9\\\" cellpadding=\\\"0\\\" width=\\\"276\\\" style=\\\"width: 100%\\\" align=\\\"left\\\">\\n                      <tr>\\n                        <td valign=\\\"middle\\\" align=\\\"left\\\"\\n                          style=\\\"font-size: 13px; font-family: Arial, Helvetica, sans-serif; color: #919191; text-align:left;\\n                          -ko-font-size: @[longTextStyle.size]px; -ko-font-family: @longTextStyle.face; -ko-color: @longTextStyle.color\\\"\\n                          data-ko-editable=\\\"longText\\\" class=\\\"long-text links-color mobile-textcenter\\\">\\n                          <p>Address and <a href=\\\"\\\">Contacts</a></p>\\n                        </td>\\n                      </tr>\\n                    </table>\\n\\n</div><!--[if (gte mso 9)|(lte ie 8)]></td>\\n<td align=\\\"left\\\" valign=\\\"top\\\" width=\\\"276\\\">\\n<![endif]--><div style=\\\"display:inline-block; max-width:276px; vertical-align:top; width:100%;\\\" class=\\\"mobile-full\\\">\\n\\n                    <table class=\\\"vb-content\\\" border=\\\"0\\\" cellspacing=\\\"9\\\" cellpadding=\\\"0\\\" width=\\\"276\\\" style=\\\"width: 100%\\\" align=\\\"right\\\">\\n                      <tr>\\n                        <td align=\\\"right\\\" valign=\\\"middle\\\" class=\\\"links-color socialLinks mobile-textcenter\\\" data-ko-display=\\\"socialIconType eq \'colors\'\\\">\\n                          <span data-ko-display=\\\"fbVisible\\\" data-ko-wrap=\\\"false\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"fbVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @fbUrl\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/facebook_ok.png\\\" alt=\\\"Facebook\\\" border=\\\"0\\\" class=\\\"socialIcon\\\" />\\n                          </a>\\n                          <span data-ko-display=\\\"twVisible\\\" data-ko-wrap=\\\"false\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"twVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @twUrl\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/twitter_ok.png\\\" alt=\\\"Twitter\\\" border=\\\"0\\\" class=\\\"socialIcon\\\" />\\n                          </a>\\n                          <span data-ko-display=\\\"ggVisible\\\" data-ko-wrap=\\\"false\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"ggVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @ggUrl\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/google+_ok.png\\\" alt=\\\"Google+\\\" border=\\\"0\\\" class=\\\"socialIcon\\\" />\\n                          </a>\\n                          <span data-ko-display=\\\"webVisible\\\" data-ko-wrap=\\\"false\\\" style=\\\"display: none\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"webVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @webUrl; display: none\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/web_ok.png\\\" alt=\\\"Web\\\" border=\\\"0\\\" class=\\\"socialIcon\\\" />\\n                          </a>\\n                          <span data-ko-display=\\\"inVisible\\\" data-ko-wrap=\\\"false\\\" style=\\\"display: none\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"inVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @inUrl; display: none\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/linkedin_ok.png\\\" alt=\\\"Linkedin\\\" border=\\\"0\\\" class=\\\"socialIcon\\\" />\\n                          </a>\\n                          <span data-ko-display=\\\"flVisible\\\" data-ko-wrap=\\\"false\\\" style=\\\"display: none\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"flVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @flUrl; display: none\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/flickr_ok.png\\\" alt=\\\"Flickr\\\" border=\\\"0\\\" class=\\\"socialIcon\\\" />\\n                          </a>\\n                          <span data-ko-display=\\\"viVisible\\\" data-ko-wrap=\\\"false\\\" style=\\\"display: none\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"viVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @viUrl; display: none\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/vimeo_ok.png\\\" alt=\\\"Vimeo\\\" border=\\\"0\\\" class=\\\"socialIcon\\\" />\\n                          </a>\\n                          <span data-ko-display=\\\"instVisible\\\" data-ko-wrap=\\\"false\\\" style=\\\"display: none\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"instVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @instUrl; display: none\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/instagram_ok.png\\\" alt=\\\"Instagram\\\" border=\\\"0\\\"  class=\\\"socialIcon\\\" />\\n                          </a>\\n                          <span data-ko-display=\\\"youVisible\\\" data-ko-wrap=\\\"false\\\" style=\\\"display: none\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"youVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @youUrl; display: none\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/youtube_ok.png\\\" alt=\\\"Youtube\\\" border=\\\"0\\\" class=\\\"socialIcon\\\" />\\n                          </a>\\n                        </td>\\n                        <td align=\\\"right\\\" valign=\\\"middle\\\" class=\\\"links-color socialLinks mobile-textcenter\\\" data-ko-display=\\\"socialIconType eq \'bw\'\\\"\\n                          style=\\\"display: none\\\">\\n                          <span data-ko-display=\\\"fbVisible\\\" data-ko-wrap=\\\"false\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"fbVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @fbUrl\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/facebook_bw_ok.png\\\" alt=\\\"Facebook\\\" border=\\\"0\\\" class=\\\"socialIcon\\\" />\\n                          </a>\\n                          <span data-ko-display=\\\"twVisible\\\" data-ko-wrap=\\\"false\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"twVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @twUrl\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/twitter_bw_ok.png\\\" alt=\\\"Twitter\\\" border=\\\"0\\\" class=\\\"socialIcon\\\" />\\n                          </a>\\n                          <span data-ko-display=\\\"ggVisible\\\" data-ko-wrap=\\\"false\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"ggVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @ggUrl\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/google+_bw_ok.png\\\" alt=\\\"Google+\\\" border=\\\"0\\\" class=\\\"socialIcon\\\" />\\n                          </a>\\n                          <span data-ko-display=\\\"webVisible\\\" data-ko-wrap=\\\"false\\\" style=\\\"display: none\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"webVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @webUrl; display: none\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/web_bw_ok.png\\\" alt=\\\"Web\\\" border=\\\"0\\\" class=\\\"socialIcon\\\" />\\n                          </a>\\n                          <span data-ko-display=\\\"inVisible\\\" data-ko-wrap=\\\"false\\\" style=\\\"display: none\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"inVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @inUrl; display: none\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/linkedin_bw_ok.png\\\" alt=\\\"Linkedin\\\" border=\\\"0\\\" class=\\\"socialIcon\\\" />\\n                          </a>\\n                          <span data-ko-display=\\\"flVisible\\\" data-ko-wrap=\\\"false\\\" style=\\\"display: none\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"flVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @flUrl; display: none\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/flickr_bw_ok.png\\\" alt=\\\"Flickr\\\" border=\\\"0\\\" class=\\\"socialIcon\\\" />\\n                          </a>\\n                          <span data-ko-display=\\\"viVisible\\\" data-ko-wrap=\\\"false\\\" style=\\\"display: none\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"viVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @viUrl; display: none\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/vimeo_bw_ok.png\\\" alt=\\\"Vimeo\\\" border=\\\"0\\\" class=\\\"socialIcon\\\" />\\n                          </a>\\n                          <span data-ko-display=\\\"instVisible\\\" data-ko-wrap=\\\"false\\\" style=\\\"display: none\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"instVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @instUrl; display: none\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/instagram_bw_ok.png\\\" alt=\\\"Instagram\\\" border=\\\"0\\\"  class=\\\"socialIcon\\\" />\\n                          </a>\\n                          <span data-ko-display=\\\"youVisible\\\" data-ko-wrap=\\\"false\\\" style=\\\"display: none\\\">&nbsp;</span>\\n                          <a data-ko-display=\\\"youVisible\\\" href=\\\"\\\" style=\\\"-ko-attr-href: @youUrl; display: none\\\">\\n                            <img src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/social_def/youtube_bw_ok.png\\\" alt=\\\"Youtube\\\" border=\\\"0\\\" class=\\\"socialIcon\\\" />\\n                          </a>\\n                        </td>\\n                      </tr>\\n                    </table>\\n\\n</div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td><![endif]-->\\n<!--[if (gte mso 9)|(lte ie 8)]></tr></table><![endif]-->\\n\\n            </td>\\n          </tr>\\n        </table>\\n        </div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\\n      </td>\\n    </tr>\\n  </table>\\n  <!-- /socialBlock -->\\n\\n  </div>\\n\\n  <!-- footerBlock -->\\n  <table width=\\\"100%\\\" cellpadding=\\\"0\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" bgcolor=\\\"#3f3f3f\\\"\\n    style=\\\"background-color: #3f3f3f; -ko-background-color: @backgroundColor; -ko-attr-bgcolor: @backgroundColor\\\"  data-ko-block=\\\"footerBlock\\\">\\n    <tr>\\n      <td align=\\\"center\\\" valign=\\\"top\\\" bgcolor=\\\"#3f3f3f\\\" style=\\\"background-color: #3f3f3f;\\n        -ko-attr-bgcolor: @backgroundColor; -ko-background-color: @backgroundColor\\\">\\n\\n<!--[if (gte mso 9)|(lte ie 8)]><table align=\\\"center\\\" border=\\\"0\\\" cellspacing=\\\"0\\\" cellpadding=\\\"0\\\" width=\\\"570\\\"><tr><td align=\\\"center\\\" valign=\\\"top\\\"><![endif]-->\\n        <div class=\\\"oldwebkit\\\">\\n        <table width=\\\"570\\\" style=\\\"width: 100%; max-width: 570px\\\" border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"9\\\" class=\\\"vb-container halfpad\\\" align=\\\"center\\\">\\n          <tr>\\n            <td data-ko-editable=\\\"longText\\\" class=\\\"long-text links-color\\\"\\n                style=\\\"text-align:center; font-size: 13px;color: #919191; font-weight: normal; text-align:center; font-family: Arial, Helvetica, sans-serif;\\n                -ko-font-size: @[longTextStyle.size]px; -ko-color: @longTextStyle.color; -ko-font-family: @longTextStyle.face\\\"><p>Email sent to <a href=\\\"mailto:[EMAIL]\\\">[EMAIL]</a></p></td>\\n          </tr>\\n          <tr>\\n            <td style=\\\"text-align: center;\\\">\\n              <a style=\\\"text-decoration: underline; color: #ffffff; text-align: center; font-size: 13px;\\n                font-weight: normal; font-family: Arial, Helvetica, sans-serif;\\n                -ko-text-decoration: @linkStyle.decoration; -ko-color: @[Color.readability(linkStyle.color, backgroundColor) gt 2 ? linkStyle.color : (Color.isReadable(\'#ffffff\', backgroundColor) ? \'#ffffff\' : \'#000000\')]; -ko-font-size: @[linkStyle.size]px; -ko-font-family: @linkStyle.face\\\"\\n                href=\\\"[LINK_UNSUBSCRIBE]\\\"><span data-ko-editable=\\\"disiscrivitiText\\\">Unsubscribe</span></a>\\n            </td>\\n          </tr>\\n\\n          <tr data-ko-display=\\\"_root_.sponsor.visible\\\" style=\\\"display: none;text-align:center\\\">\\n            <td align=\\\"center\\\">\\n                <a href=\\\"http://www.void.it\\\" target=\\\"_blank\\\" rel=\\\"noreferrer\\\"><img border=\\\"0\\\" hspace=\\\"0\\\" vspace=\\\"0\\\" src=\\\"[URL_BASE]/static/mosaico/templates/versafix-1/img/sponsor.gif\\\" alt=\\\"sponsor\\\"\\n                  style=\\\"Margin:auto;display:inline !important;\\\" /></a>\\n            </td>\\n          </tr>\\n        </table>\\n        </div>\\n<!--[if (gte mso 9)|(lte ie 8)]></td></tr></table><![endif]-->\\n      </td>\\n    </tr>\\n  </table>\\n  <!-- /footerBlock -->\\n\\n  </center>\\n</body>\\n</html>\\n\"}',NOW(),1);
CREATE TABLE `namespaces` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
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
CREATE TABLE `permissions_mosaico_template` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `operation` varchar(128) NOT NULL,
  PRIMARY KEY (`entity`,`user`,`operation`),
  KEY `permissions_mosaico_template_user_foreign` (`user`),
  CONSTRAINT `permissions_mosaico_template_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `mosaico_templates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `permissions_mosaico_template_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO `permissions_mosaico_template` (`entity`, `user`, `operation`) VALUES (1,1,'delete');
INSERT INTO `permissions_mosaico_template` (`entity`, `user`, `operation`) VALUES (1,1,'edit');
INSERT INTO `permissions_mosaico_template` (`entity`, `user`, `operation`) VALUES (1,1,'manageFiles');
INSERT INTO `permissions_mosaico_template` (`entity`, `user`, `operation`) VALUES (1,1,'share');
INSERT INTO `permissions_mosaico_template` (`entity`, `user`, `operation`) VALUES (1,1,'view');
INSERT INTO `permissions_mosaico_template` (`entity`, `user`, `operation`) VALUES (1,1,'viewFiles');
CREATE TABLE `permissions_namespace` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `operation` varchar(128) NOT NULL,
  PRIMARY KEY (`entity`,`user`,`operation`),
  KEY `permissions_namespace_user_foreign` (`user`),
  CONSTRAINT `permissions_namespace_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `namespaces` (`id`) ON DELETE CASCADE,
  CONSTRAINT `permissions_namespace_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO `permissions_namespace` (`entity`, `user`, `operation`) VALUES (1,1,'createCampaign');
INSERT INTO `permissions_namespace` (`entity`, `user`, `operation`) VALUES (1,1,'createCustomForm');
INSERT INTO `permissions_namespace` (`entity`, `user`, `operation`) VALUES (1,1,'createList');
INSERT INTO `permissions_namespace` (`entity`, `user`, `operation`) VALUES (1,1,'createMosaicoTemplate');
INSERT INTO `permissions_namespace` (`entity`, `user`, `operation`) VALUES (1,1,'createNamespace');
INSERT INTO `permissions_namespace` (`entity`, `user`, `operation`) VALUES (1,1,'createReport');
INSERT INTO `permissions_namespace` (`entity`, `user`, `operation`) VALUES (1,1,'createReportTemplate');
INSERT INTO `permissions_namespace` (`entity`, `user`, `operation`) VALUES (1,1,'createSendConfiguration');
INSERT INTO `permissions_namespace` (`entity`, `user`, `operation`) VALUES (1,1,'createTemplate');
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
CREATE TABLE `permissions_send_configuration` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `operation` varchar(128) NOT NULL,
  PRIMARY KEY (`entity`,`user`,`operation`),
  KEY `permissions_send_configuration_user_foreign` (`user`),
  CONSTRAINT `permissions_send_configuration_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `send_configurations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `permissions_send_configuration_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO `permissions_send_configuration` (`entity`, `user`, `operation`) VALUES (1,1,'delete');
INSERT INTO `permissions_send_configuration` (`entity`, `user`, `operation`) VALUES (1,1,'edit');
INSERT INTO `permissions_send_configuration` (`entity`, `user`, `operation`) VALUES (1,1,'sendWithAllowedOverrides');
INSERT INTO `permissions_send_configuration` (`entity`, `user`, `operation`) VALUES (1,1,'sendWithAnyOverrides');
INSERT INTO `permissions_send_configuration` (`entity`, `user`, `operation`) VALUES (1,1,'sendWithoutOverrides');
INSERT INTO `permissions_send_configuration` (`entity`, `user`, `operation`) VALUES (1,1,'share');
INSERT INTO `permissions_send_configuration` (`entity`, `user`, `operation`) VALUES (1,1,'viewPrivate');
INSERT INTO `permissions_send_configuration` (`entity`, `user`, `operation`) VALUES (1,1,'viewPublic');
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
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `campaign` int(10) unsigned NOT NULL,
  `list` int(10) unsigned NOT NULL,
  `subscription` int(10) unsigned NOT NULL,
  `trigger` varchar(255) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `created` (`created`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TABLE `report_templates` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT '',
  `mime_type` varchar(255) NOT NULL DEFAULT 'text/html',
  `description` text DEFAULT NULL,
  `user_fields` longtext DEFAULT NULL,
  `js` longtext DEFAULT NULL,
  `hbs` longtext DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `namespace` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `report_templates_namespace_foreign` (`namespace`),
  CONSTRAINT `report_templates_namespace_foreign` FOREIGN KEY (`namespace`) REFERENCES `namespaces` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `reports` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT '',
  `description` text DEFAULT NULL,
  `report_template` int(10) unsigned NOT NULL,
  `params` longtext DEFAULT NULL,
  `state` int(11) unsigned NOT NULL DEFAULT 0,
  `last_run` timestamp NULL DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
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
  `found` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `parent_2` (`parent`,`guid`),
  KEY `parent` (`parent`),
  CONSTRAINT `rss_ibfk_1` FOREIGN KEY (`parent`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
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
  `subject` varchar(255) DEFAULT NULL,
  `subject_overridable` tinyint(1) DEFAULT 0,
  `verp_hostname` varchar(255) DEFAULT NULL,
  `mailer_type` varchar(255) DEFAULT NULL,
  `mailer_settings` longtext DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `namespace` int(10) unsigned DEFAULT NULL,
  `x_mailer` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `send_configurations_namespace_foreign` (`namespace`),
  CONSTRAINT `send_configurations_namespace_foreign` FOREIGN KEY (`namespace`) REFERENCES `namespaces` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;
INSERT INTO `send_configurations` (`id`, `cid`, `name`, `description`, `from_email`, `from_email_overridable`, `from_name`, `from_name_overridable`, `reply_to`, `reply_to_overridable`, `subject`, `subject_overridable`, `verp_hostname`, `mailer_type`, `mailer_settings`, `created`, `namespace`, `x_mailer`) VALUES (1,'system','System','Send configuration used to deliver system emails','admin@example.com',1,'My Awesome Company',1,'admin@example.com',1,'Test message',1,NULL,'zone_mta','{\"maxConnections\":5,\"throttling\":0,\"logTransactions\":false,\"maxMessages\":100,\"zoneMtaType\":3}',NOW(),1,NULL);
CREATE TABLE `settings` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) CHARACTER SET ascii NOT NULL DEFAULT '',
  `value` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4;
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (51,'uaCode','');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (52,'shoutout','');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (53,'adminEmail','admin@example.com');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (54,'defaultHomepage','http://localhost:3000/');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (55,'pgpPassphrase','');
INSERT INTO `settings` (`id`, `key`, `value`) VALUES (56,'pgpPrivateKey','');
CREATE TABLE `shares_campaign` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `role` varchar(128) NOT NULL,
  `auto` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`entity`,`user`),
  KEY `shares_campaign_user_foreign` (`user`),
  CONSTRAINT `shares_campaign_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shares_campaign_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `shares_custom_form` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `role` varchar(128) NOT NULL,
  `auto` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`entity`,`user`),
  KEY `shares_custom_form_user_foreign` (`user`),
  CONSTRAINT `shares_custom_form_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `custom_forms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shares_custom_form_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `shares_list` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `role` varchar(128) NOT NULL,
  `auto` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`entity`,`user`),
  KEY `shares_list_user_foreign` (`user`),
  CONSTRAINT `shares_list_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `lists` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shares_list_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `shares_mosaico_template` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `role` varchar(128) NOT NULL,
  `auto` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`entity`,`user`),
  KEY `shares_mosaico_template_user_foreign` (`user`),
  CONSTRAINT `shares_mosaico_template_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `mosaico_templates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shares_mosaico_template_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `shares_namespace` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `role` varchar(128) NOT NULL,
  `auto` tinyint(1) DEFAULT 0,
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
  `auto` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`entity`,`user`),
  KEY `shares_report_user_foreign` (`user`),
  CONSTRAINT `shares_report_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `reports` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shares_report_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `shares_report_template` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `role` varchar(128) NOT NULL,
  `auto` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`entity`,`user`),
  KEY `shares_report_template_user_foreign` (`user`),
  CONSTRAINT `shares_report_template_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `report_templates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shares_report_template_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `shares_send_configuration` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `role` varchar(128) NOT NULL,
  `auto` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`entity`,`user`),
  KEY `shares_send_configuration_user_foreign` (`user`),
  CONSTRAINT `shares_send_configuration_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `send_configurations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shares_send_configuration_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `shares_template` (
  `entity` int(10) unsigned NOT NULL,
  `user` int(10) unsigned NOT NULL,
  `role` varchar(128) NOT NULL,
  `auto` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`entity`,`user`),
  KEY `shares_template_user_foreign` (`user`),
  CONSTRAINT `shares_template_entity_foreign` FOREIGN KEY (`entity`) REFERENCES `templates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shares_template_user_foreign` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `template_dep_campaigns` (
  `template` int(10) unsigned NOT NULL,
  `campaign` int(10) unsigned NOT NULL,
  PRIMARY KEY (`campaign`),
  KEY `template_dep_campaigns_template_foreign` (`template`),
  CONSTRAINT `template_dep_campaigns_campaign_foreign` FOREIGN KEY (`campaign`) REFERENCES `campaigns` (`id`),
  CONSTRAINT `template_dep_campaigns_template_foreign` FOREIGN KEY (`template`) REFERENCES `templates` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
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
  PRIMARY KEY (`id`),
  KEY `name` (`name`(191)),
  KEY `templates_namespace_foreign` (`namespace`),
  CONSTRAINT `templates_namespace_foreign` FOREIGN KEY (`namespace`) REFERENCES `namespaces` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `trigger_messages` (
  `trigger` int(10) unsigned NOT NULL,
  `list` int(10) unsigned NOT NULL,
  `subscription` int(10) unsigned NOT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`trigger`,`list`,`subscription`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `tzoffset` (
  `tz` varchar(100) NOT NULL DEFAULT '',
  `offset` int(11) NOT NULL DEFAULT 0,
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
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/casablanca',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/ceuta',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/conakry',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/dakar',0);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/dar_es_salaam',180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/djibouti',180);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/douala',60);
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/el_aaiun',60);
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
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('africa/sao_tome',60);
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
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('america/grand_turk',-300);
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
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('antarctica/casey',480);
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
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('asia/pyongyang',540);
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
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('europe/volgograd',240);
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
INSERT INTO `tzoffset` (`tz`, `offset`) VALUES ('pacific/fiji',780);
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;
INSERT INTO `users` (`id`, `username`, `password`, `email`, `access_token`, `reset_token`, `reset_expire`, `created`, `namespace`, `name`, `role`) VALUES (1,'admin','$2a$10$mzKU71G62evnGB2PvQA4k..Wf9jASk.c7a8zRMHh6qQVjYJ2r/g/K','admin@example.com',NULL,NULL,NULL,NOW(),1,'Administrator','master');

SET UNIQUE_CHECKS=1;
SET FOREIGN_KEY_CHECKS=1;

