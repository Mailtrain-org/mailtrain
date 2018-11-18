# Header section
# Define incrementing schema version number
SET @schema_version = '28';

# Add unsubscription mode field to lists
ALTER TABLE `lists` ADD COLUMN `unsubscription_mode` int(11) unsigned DEFAULT 0 NOT NULL AFTER `public_subscribe`;

# Delete all confirmations as we use different structure in "data".
DELETE FROM `confirmations`;

# Change the name of the column to better reflect that confirmations are also used for unsubscription and email address update
# Drop email field as this does not have a clear semantics in change address. Since email is not used to search in the table,
# it can be stored in data
# Create field action to distinguish between different confirmation types (subscribe, unsubscribe, change-address)
ALTER TABLE `confirmations` CHANGE `opt_in_ip` `ip` varchar(100) DEFAULT NULL;
ALTER TABLE `confirmations` DROP `email`;
ALTER TABLE `confirmations` ADD COLUMN `action` varchar(100) NOT NULL AFTER `list`;


# Rename affected forms in custom_forms_data
update custom_forms_data set data_key="mail_confirm_subscription_html" where data_key="mail_confirm_html";
update custom_forms_data set data_key="mail_confirm_subscription_text" where data_key="mail_confirm_text";
update custom_forms_data set data_key="mail_unsubscription_confirmed_html" where data_key="mail_unsubscribe_confirmed_html";
update custom_forms_data set data_key="mail_unsubscription_confirmed_text" where data_key="mail_unsubscribe_confirmed_text";
update custom_forms_data set data_key="web_confirm_subscription_notice" where data_key="web_confirm_notice";
update custom_forms_data set data_key="web_subscribed_notice" where data_key="web_subscribed";
update custom_forms_data set data_key="web_unsubscribed_notice" where data_key="web_unsubscribe_notice";


# Footer section
LOCK TABLES `settings` WRITE;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
UNLOCK TABLES;
