# Header section
# Define incrementing schema version number
SET @schema_version = '10';

-- {{#each tables.campaign_tracker}}

    # Adds new column 'created' to campaign tracker table
    # Indicates when a subscriber first clicked a link or opened the message
    ALTER TABLE `{{this}}` ADD COLUMN `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `count`;
    CREATE INDEX created_index ON `{{this}}` (`created`);

-- {{/each}}

# Footer section
LOCK TABLES `settings` WRITE;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
UNLOCK TABLES;
