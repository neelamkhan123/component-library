---
"neelam-ui": patch
---

Link the documentation site's new Blocks gallery from the README — whole
screens (a dashboard, settings, sign-in, pricing, a chat panel) assembled from
these components, each with its source. No package code changed: npm only
refreshes a package's README when a new version is published, so this needs a
release to become visible on the package page.
