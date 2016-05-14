# Header section
# Define incrementing schema version number
SET @schema_version = '11';

-- {{#each tables.campaign}}

    # Adds new index for 'status' on campaign messages table
    CREATE INDEX status_index ON `{{this}}` (`status`);

-- {{/each}}

# Footer section
LOCK TABLES `settings` WRITE;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
UNLOCK TABLES;
