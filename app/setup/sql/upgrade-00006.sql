# Header section
# Define incrementing schema version number
SET @schema_version = '6';

# Creates table to store timezone offsets required to calculate correct start time for sending
# messages to specific subscribers
CREATE TABLE `tzoffset` (
  `tz` varchar(100) CHARACTER SET ascii NOT NULL DEFAULT '',
  `offset` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`tz`)
) ENGINE=InnoDB DEFAULT CHARSET=ascii;

# Footer section
LOCK TABLES `settings` WRITE;
INSERT INTO `settings` (`key`, `value`) VALUES('db_schema_version', @schema_version) ON DUPLICATE KEY UPDATE `value`=@schema_version;
UNLOCK TABLES;
