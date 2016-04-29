# Header section
# Define incrementing schema version number
SET @schema_version = '5';

-- {{#each tables.subscription}}

    # Adds new column 'tz' to subscriptions table
    # Indicates subscriber time zone, use UTC as default
    ALTER TABLE `{{this}}` ADD COLUMN `tz` varchar(100) CHARACTER SET ascii DEFAULT NULL AFTER `opt_in_country`;
    CREATE INDEX subscriber_tz ON `{{this}}` (`tz`);

-- {{/each}}

# Footer section
LOCK TABLES `settings` WRITE;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
UNLOCK TABLES;
