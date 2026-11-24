# Changelog

## 3.0.0-rc.2

Test this candidate on a fresh installation or an upgrade of a backup copy.
See [README.md](https://github.com/Mailtrain-org/mailtrain/blob/v3.0.0-rc.2/README.md)
for installation and [UPGRADE.md](https://github.com/Mailtrain-org/mailtrain/blob/v3.0.0-rc.2/UPGRADE.md)
for backups, supported upgrades and recovery.

  * Update production dependencies for template rendering, uploads, HTTP,
    password hashing and SMTP delivery. Amazon SES sending now uses the SES v2
    API. Confirm that the configured IAM identity can use `ses:SendEmail`.
  * Refresh the Debian base in the Node 24 Docker images and restrict legacy
    Mosaico image rendering to the uploads directory. Server-side MJML forms
    now use inline markup in place of file includes.
  * Document verification for provider webhooks. Configure the providers you
    use before exposing callbacks and verify their delivery in a test list.
  * Make Docker's `latest` channel an explicit release decision.

## 3.0.0-rc.1

This release candidate is for testing fresh installations and supported v2
upgrades on a copy of the deployment. See [README.md](https://github.com/Mailtrain-org/mailtrain/blob/v3.0.0-rc.1/README.md) for installation
and [UPGRADE.md](https://github.com/Mailtrain-org/mailtrain/blob/v3.0.0-rc.1/UPGRADE.md) before moving existing data.

  * Modernize the server and client on Tomas Bureš's v3 foundation: Node 24
    images, Express 5, Knex 3, React 18, Bootstrap 5 and webpack 5. Keep Mosaico
    and the HTML/MJML code editor, and the more granular v3 permission model.
  * Build from lockfiles with the pinned public MJML submodule. Provide non-root
    amd64/arm64 images, persistent Compose services, healthchecks and an optional
    builtin ZoneMTA profile compatible with Node 24.
  * Escape simple merge-tag values in HTML messages and public archives (#1396,
    @p-w). Verify SNS signatures and restrict confirmation/certificate URLs
    (#1389); add optional provider webhook verification and private reporting
    guidance. Read SECURITY.md for configuration and remaining limits.
  * Preserve v2 data, files and migration history. The administrator archive
    opens original GrapesJS and CKEditor templates, retired campaigns,
    triggers and reports. Templates also open as HTML in the code editor.
    Retired campaigns and queued triggers stay inactive.
  * Fix segment nesting/reordering, dirty-page navigation, date controls,
    Mosaico placeholders and v3 forms. Exercise real campaign delivery,
    unsubscribe, browser areas, restart persistence and v2 admission in CI.
  * Add send-configuration CC/BCC (#1390, @falkensteg-gmbh), stronger generated
    session secrets and configurable Docker UI languages (#1186, #1185,
    @jonathanmmm), subscription email prefilling (#981, @PabloCastellano),
    translated preferences (#1105, @usrflo), and URL-prefix-safe message links.
  * Remove Google Fonts from the UI and default templates (#1219,
    @jonathanmmm). Update German (#1107, @usrflo; #1232, @codiflow; #1253,
    @jonathanmmm), Austrian German and unsubscribe notices (#1393, @caichat),
    Basque (#1367, @enbata), Russian registration (#1303, @iafilin), Spanish
    (#961, @tanoxyz), Brazilian Portuguese (#900, @geisimarrech87) and Dutch
    (#861, @Zir0h) translations for the current v3 interface.

Thanks to @bures for the v3 implementation, the contributors credited above for
their original changes, and @auscaster for integration, security hardening,
builds, regression coverage and release preparation. Original commit authorship
is retained for the community ports.

The external v2 token API, retired editors, automated campaign execution and
custom reporting remain inactive in v3. See the upgrade guide for role checks,
file ownership and backup recovery.

## 2.0.0-rc1 2018-12-25

  * This is a complete rewrite of Mailtrain v1 with many features added. Just check it out.
