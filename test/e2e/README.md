# e2e Tests

Running e2e tests requires Node 7.6 or later and a dedicated test database. It uses mocha, selenium-webdriver and phantomjs.

## Installation

These e2e tests have to be performed against predefined resources (e.g. lists, users, etc.) and therefore a dedicated test database and test config is required.

Both can be created by running `sudo sh test/e2e/install.sh` from within your mailtrain directory. This creates a MYSQL user and database called `mailtrain_test`, and generates the required `config/test.toml`.

## Running e2e Tests

For tests to succeed Mailtrian must be started in `test` mode on port 3000 (as http://localhost:3000/ is the predefined service url). The tests itself have to be started in a second Terminal window.

1. Start Mailtrain with `npm run starttest`
2. Start e2e tests with `npm run e2e`

## Using Different Browsers

By default e2e tests use `phantomjs`. If you want to use a different browser you need to install its driver and adjust your `config/test.toml`.

* Install the `firefox` driver with `npm install geckodriver`
* Install the `chrome` driver with `npm install chromedriver`
* Other drivers can be found [here](https://seleniumhq.github.io/selenium/docs/api/javascript/)

Then adjust your config:

```
[seleniumwebdriver]
browser="firefox"
```

Current Firefox issue (and patch): https://github.com/mozilla/geckodriver/issues/683

## Writing e2e Tests

You should spend your time on features rather than writing tests, yet in some cases, like for example the subscription process, manual testing is just silly. You best get started by reading the current test suites, or just open an issue describing the scenario you want to get tested.

Available commands:

* `npm run sqldumptest` - exports the test DB to `setup/sql/mailtrain-test.sql`
* `npm run sqlresettest` - drops all tables then loads `setup/sql/mailtrain-test.sql`
* `npm run _e2e` - just runs e2e tests
* `npm run e2e` - runs `sqlresettest` then `_e2e`
