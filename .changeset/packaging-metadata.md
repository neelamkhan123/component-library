---
"@neelamkhan21/ui": patch
---

Packaging metadata only — no functional change to any component. `repository.url` drops its `git+` prefix so npm's OIDC trusted-publishing match is unambiguous, `publishConfig.access` is declared explicitly as `public`, and a `prepublishOnly` script now rebuilds `dist` before any publish, so a stale build can no longer be shipped.
