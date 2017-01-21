# Header section
# Define incrementing schema version number
SET @schema_version = '13';

-- {{#each tables.campaign}}

    # Adds separate index for 'subscription' on campaign messages table
    CREATE INDEX subscription_index ON `{{this}}` (`subscription`);

-- {{/each}}

# Footer section
LOCK TABLES `settings` WRITE;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
UNLOCK TABLES;
