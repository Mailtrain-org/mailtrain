# Releasing Mailtrain v3

Release preparation is local. Creating/pushing a tag, running a publishing job,
changing accounts, and creating a GitHub release require the maintainers' go.
The prepared workflow has not activated or publication-verified Docker trust.
A repository administrator configures GitHub publishing and private vulnerability
reporting. A Docker Hub organization owner configures registry publishing.

## Validate without publishing

From the repository root on Node 24:

```sh
node --test scripts/release.test.js
node scripts/release.js v3.0.0-rc.2
```

The second command reads the five first-party manifests and lock roots plus the
matching CHANGELOG entry, and prints the exact image tags, OIDC subject and GitHub
release payload. It makes no network calls or writes and needs no credentials.
Use `--output /path/to/local/evidence` to explicitly save `plan.json`,
`release-notes.md` and `github-release.json`. No tag is created by the script.
`--require-publisher` additionally checks the publishing identity/configuration;
with missing configuration it exits nonzero before any output files are written.
The tests cover prerelease/stable tags, every manifest/lock root, missing and
invalid identity/configuration, and absent/duplicate/empty notes. Future stable
versions are exercised in disposable fixtures, without modifying the checkout.

If available, run `actionlint .github/workflows/release.yml`. This validates
workflow syntax and expressions locally; it does not execute GitHub Actions or
test an OIDC exchange.

For image qualification, initialize the pinned submodule, then build each exact
source/platform once and retain the images. For example:

```sh
git submodule update --init --recursive
docker buildx build --platform linux/amd64 --load -t mailtrain-release:amd64 .
docker buildx build --platform linux/arm64 --load -t mailtrain-release:arm64 .
npm ci --prefix e2e
export PLAYWRIGHT_BROWSERS_PATH=/tmp/mailtrain-e2e-browsers
node e2e/node_modules/playwright/cli.js install chromium
for arch in amd64 arm64; do
    bash scripts/test-release-image.sh "$arch" "mailtrain-release:$arch"
done
```

Linux hosts may need Playwright's `install --with-deps chromium`. Cross-platform
builds/runs need QEMU/binfmt or Docker Desktop emulation. These commands only
pull public build/test dependencies and operate disposable local services; they
do not log in or publish. The E2E runners remove their own database/file volumes.
Set `E2E_EVIDENCE_DIR` to an existing directory to retain upgrade evidence. Record
source/submodule revisions, image IDs, platform, build metadata, test results and
cleanup. Reuse these artifacts for all subsequent checks. Do not rebuild for
release-note changes alone.

## Docker Hub administration required before publication

Official guidance checked 19 November 2026:

- [Docker OIDC connections](https://docs.docker.com/security/authentication/oidc-connections/)
  supports eligible Team, Business and Docker-Sponsored Open Source organizations.
- [Create/manage connections](https://docs.docker.com/security/authentication/oidc-connections/create-manage/)
  documents organization login using `docker/login-action` 4.5+ and
  `DOCKERHUB_OIDC_CONNECTIONID`, with no password.
- [Docker rulesets and claims](https://docs.docker.com/security/authentication/oidc-connections/rulesets-claims/)
  binds subjects to resource scopes; matching rulesets grant their union.
- [GitHub Docker OIDC](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-docker)
  and [custom subjects](https://docs.github.com/en/actions/reference/security/oidc#customizing-the-subject-claims-for-an-organization-or-repository)
  describe `id-token: write` and repository subject templates.

The public Docker profile identifies `mailtrain` as an Organization. Its eligible
subscription, available connection slots and existing trust are not established
by that public metadata. A Docker Hub organization owner can confirm eligibility in Docker Home.
Do not set approval variables merely to make a dry run pass.

The intended binding is deliberately exact:

| Identity | Required value |
| --- | --- |
| GitHub repository | `Mailtrain-org/mailtrain` |
| Workflow | `.github/workflows/release.yml` from that same release tag |
| Trigger | Push of `refs/tags/v3.0.0-rc.2` for this RC |
| GitHub environment | `mailtrain-release` |
| Issuer | `https://token.actions.githubusercontent.com` (GitHub.com) |
| Docker organization/login | `mailtrain` |
| Docker resource | Repository `mailtrain/mailtrain`, Image Pull and Image Push only |
| Login action | `docker/login-action@abd2ef45e78c5afb21d64d4ca52ee8550d9572c7` (4.5.1) |

A repository administrator configures a custom OIDC subject template with this
ordered claim list (administrative payload, not executed by this run):

```json
{"use_default": false, "include_claim_keys": ["repo", "context", "workflow_ref", "ref"]}
```

For the RC, the intended subject/ruleset is the following single exact string,
without wildcards:

```text
repo:Mailtrain-org/mailtrain:environment:mailtrain-release:workflow_ref:Mailtrain-org/mailtrain/.github/workflows/release.yml@refs/tags/v3.0.0-rc.2:ref:refs/tags/v3.0.0-rc.2
```

An environment's default subject omits the workflow and tag. It is insufficient
for this binding. Confirm the actual repository subject format: newer/opted-in
repositories may include immutable owner/repository IDs. If that applies, stop
and adapt the exact expected identity and tests together; do not broaden the
Docker rule to accept arbitrary formats. Changing the repository subject template
can affect other OIDC consumers; inspect them before applying it. Neither the
custom template nor a connection has been installed here. The workflow checks the
issued claims immediately before login; Docker independently verifies the signed
token in its exchange. Never print the token.

Create/activate one GitHub OIDC connection in Docker Home with that subject and
only the `mailtrain/mailtrain` Image Pull and Image Push resource scopes.
Pull access is needed to assemble and read back that repository's manifests. Review other matching rulesets
so their union does not widen authority. Do not grant whole-organization push,
Build Cloud, unrelated repositories or a branch wildcard. GitHub's environment
must allow release tags only (`v3.*`), require Kam's review and disallow approval
bypass/self-review as supported by the repository plan. Protect the tag namespace
against unauthorized creation or replacement. If required environment protection
is unavailable, leave publishing disabled until an equivalent reviewed control
is agreed.

In the `mailtrain-release` environment, after administration and Kam's exact go,
set these nonsecret variables:

- `DOCKERHUB_OIDC_CONNECTIONID`: the actual connection ID from Docker Home.
- `DOCKERHUB_OIDC_SUBJECT`: the exact subject printed by the local release script
  and confirmed against the repository's configured template.
- `RELEASE_APPROVED_TAG`: the exact approved tag for this release only.
- `RELEASE_PROMOTE_LATEST`: set to `true` only for an approved stable Docker
  `latest` channel cutover. Leave it unset for a versioned image.

With neither OIDC variables nor Docker Hub secrets configured, the tag workflow
builds and tests the images and skips Docker and GitHub publishing. Partial
configuration fails validation. Docker validates the connection and signed
runtime identity.

Use `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` in the `mailtrain-release`
environment only where the Docker account cannot use OIDC. Record the Docker
account limitation, the credential owner and expiration, and the rotation and
revocation procedure in the owning secret store. Limit access to
`mailtrain/mailtrain`. A configured OIDC connection takes precedence over a token.

## Authorized publishing run

After review, merge the candidate into `v3`, preserving contributor authorship.
The branch workflow builds and tests amd64 and arm64, validates metadata and runs
the supported v2 upgrade on amd64. Wait for both **Qualify image before tagging**
steps to pass on the exact merged commit. Record the branch workflow URL in the
release handoff and recheck the remote branch head immediately before tagging.

To find the qualifying workflow for the merged commit:

```sh
git fetch origin v3
commit="$(git rev-parse FETCH_HEAD)"
gh run list --repo Mailtrain-org/mailtrain --workflow build.yml --branch v3 --event push \
    --commit "$commit" --limit 1 --json url,status,conclusion,headSha
```

Inspect the generated prerelease or release notes and verify the distribution
plan before requesting approval of the annotated tag and publication. The tag
workflow requires the branch qualification on its exact checkout. It verifies
publishing configuration and the tag, builds and tests the images it will
publish, and checks the issued OIDC claims before sign-in. It pushes the tested
platform tags (`3.0.0-rc.2-amd64`, `3.0.0-rc.2-arm64`), assembles
`mailtrain/mailtrain:3.0.0-rc.2`, and reads back the manifest's exact amd64/arm64
platform set. It never updates `latest` for an alpha, beta or RC. It creates the
GitHub prerelease last, with the exact CHANGELOG body and `make_latest: false`.
There is no automatic notes generator or independent version source.

For `3.0.0`, update the five package roots and their locks, write that CHANGELOG
entry, review tester results, repeat qualification and bind the exact new
subject/tag with Kam's go. Stable releases become the latest GitHub release.
The Docker version tag is published independently of `latest`. Review the
upgrade path for existing Docker `latest` users and get explicit approval
before setting `RELEASE_PROMOTE_LATEST=true`. The workflow verifies the new
Docker `latest` manifest after a promotion.

GitHub and Docker do not provide a shared transaction. A failure after a push
can leave platform/version tags; the workflow fails and does not create a GitHub
release after an earlier failure. Inspect exact registry digests and any release
state before rerunning; never move the source tag or blindly overwrite a published
release. Concurrent runs are serialized. Actual trust acceptance and publication
must be verified through an authorized real run and independent Docker/GitHub
readback, including pull/install of both architectures. Until then, report the
configuration as prepared, not publication-verified. Remove/reset the exact-tag
approval variable and any `RELEASE_PROMOTE_LATEST` setting after completion.

## v2 security patch (separate approval)

Keep the v2 security release separate from this v3 workflow. Review/merge the
`security-v2` history onto upstream `v2`, retain @p-w's authorship, qualify that
exact merged revision and prepare `v2.<yyyymmdd>.0` using the actual approved
release date. The v3 workflow intentionally ignores v2 tags. No v2 tag, release
or registry update is part of local RC preparation.

Draft v2 notes: escape simple merge tags in HTML/public archives (#1396, @p-w);
verify SNS signatures and safe confirmation/certificate URLs (#1389); add optional
provider webhook verification and private reporting guidance; harden DKIM token
handling/cache behavior. Node 10 compatibility is retained. Operators must review
the new `webhooks` settings and topic allowlist; signatures do not add durable
replay protection, and HTML escaping does not validate URL schemes. A full v2
install/image qualification on the final merged patch remains required before
that separate release. See SECURITY.md for configuration and remaining limits.
