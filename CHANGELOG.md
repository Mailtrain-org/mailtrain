# Changelog

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
  * Preserve supported v2 data, files and migration history. Refuse unsupported
    editors, campaign sources, reports/triggers and undefined or unsafe role
    mappings before changing the database. The external v2 token API remains
    disabled; saved tokens do not restore that integration.
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

Breaking changes: v3 removes GrapesJS/CKEditor, RSS/triggered/source-URL campaigns,
custom reports/report templates and triggers, and does not serve the external
v2 token API. Existing deployments using these features should stay on the v2
security line. Upgrade admission reports incompatible data; there is no automatic
conversion or rollback. Review configured roles and non-root file ownership.


## 2.0.0-rc1 2018-12-25

  * This is a complete rewrite of Mailtrain v1 with many features added. Just check it out.
