# This file is a handlebars template
# To modify several similar tables at once use (replace [] with {}):
#   [[#each tables.tablename]] ALTER TABLE `[[this]]` ... [[/each]]
# NB! as this is a handlebars file, then remember to escape any template sequences

# Header section
# Define incrementing schema version number
SET @schema_version = '34';

# Adds capchtcha settings
ALTER TABLE `lists` ADD `captcha` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'If true, the subscription form requires captcha' AFTER `public_subscribe`;

LOCK TABLES `settings` WRITE;
INSERT INTO `settings` (`key`, `value`) VALUES ('recaptcha_site_key','');
INSERT INTO `settings` (`key`, `value`) VALUES ('recaptcha_secret_key','');
UNLOCK TABLES;


# Footer section. Updates schema version in settings
LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;
