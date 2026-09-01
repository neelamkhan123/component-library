---
"neelam-ui": patch
---

Renamed from `@neelamkhan21/ui` to `neelam-ui`. Update your imports and your dependency entry:

```diff
- import { Button } from "@neelamkhan21/ui";
+ import { Button } from "neelam-ui";
```

```diff
- @source "../node_modules/@neelamkhan21/ui/dist";
+ @source "../node_modules/neelam-ui/dist";
```

`@neelamkhan21/ui` is deprecated but stays on the registry, so existing installs keep working and nothing breaks until you choose to move. The documentation link and package `homepage` now point at the documentation site rather than at Storybook.
