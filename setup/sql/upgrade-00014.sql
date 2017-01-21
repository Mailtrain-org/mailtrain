# Header section
# Define incrementing schema version number
SET @schema_version = '14';

-- {{#each tables.subscription}}

    # Adds new column 'tz' to subscriptions table
    # Indicates subscriber time zone, use UTC as default
    ALTER TABLE `{{this}}` ADD COLUMN `is_test` tinyint(4) unsigned NOT NULL DEFAULT '0' AFTER `status`;
    CREATE INDEX is_test ON `{{this}}` (`is_test`);

-- {{/each}}

# Footer section
LOCK TABLES `settings` WRITE;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
UNLOCK TABLES;
