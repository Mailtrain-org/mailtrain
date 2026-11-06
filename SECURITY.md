# Security Policy

## Supported Versions

Mailtrain follows a rolling release model on the current major version. Security
fixes are provided only for the latest release of the actively maintained branch.

| Version        | Supported          |
| -------------- | ------------------ |
| 2.x (current)  | :white_check_mark: |
| 1.x (legacy)   | :x:                |

Please upgrade to the latest 2.x release before reporting an issue, so we can
confirm it still reproduces on supported code.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues,
pull requests, or the community forum.**

Instead, report them privately through GitHub's built-in private vulnerability
reporting:

1. Go to the repository's **Security** tab.
2. Click **Report a vulnerability** (Security Advisories → "Report a vulnerability").
3. Fill in the advisory form with the details below.

This opens a private channel visible only to the maintainers and you.

If you are unable to use GitHub's private reporting, open a regular issue that
contains **only** the sentence "I would like to report a security issue" and no
technical details, so a maintainer can reach out with a private channel.

### What to include

A good report lets us reproduce and triage quickly:

- Affected version / commit and deployment details (Node.js version, database,
  configuration relevant to the issue).
- Vulnerability type (e.g. SQL injection, template injection/SSTI, XSS, SSRF,
  authentication/authorization bypass, path traversal, RCE).
- Clear, minimal step-by-step reproduction, including the exact request(s) and,
  where relevant, whether it is reachable pre-authentication or via the public
  subscription pages.
- A proof of concept, and the impact you can demonstrate.
- Any suggested remediation, if you have one.

Please validate your report before submitting. Automated-scanner output or
unverified, AI-generated reports without a working, reproducible proof of
concept make triage harder and may be closed.

## Our commitment

- We aim to acknowledge your report within **5 business days**.
- We will keep you informed about our progress toward a fix.
- We will coordinate the disclosure timeline with you and credit you in the
  release notes and advisory, unless you prefer to remain anonymous.

## Safe harbour

We will not pursue or support legal action against researchers who:

- Make a good-faith effort to follow this policy.
- Only test against their **own** installation of Mailtrain, never against other
  people's instances or data.
- Do not access, modify, or exfiltrate data that is not their own, and do not
  degrade the service for others (no denial-of-service, spam, or social
  engineering).
- Give us a reasonable time to remediate before any public disclosure.

Thank you for helping keep Mailtrain and its users safe.
