---
"neelam-ui": patch
---

Fixed `RadioGroupItem`'s selected dot drifting out of the control. The dot was
an absolutely positioned sibling anchored to a wrapper `<span>`, while
`className` landed on the `<input>` — so any class that moved the input
(`className="mt-0.5"`, the usual nudge to sit a radio on the first line of a
two-line label) shifted the control and left the dot behind.

The dot is now a `radial-gradient` background painted on the input itself, the
way Tailwind's own forms plugin draws one, so it cannot come apart from the
control. The wrapper `<span>` is gone: `RadioGroupItem` renders a single
`<input type="radio">`, which also means `peer` now targets the item's real
siblings inside a `<label>`. A checked-and-disabled dot picks up the muted
`slate-400`/`slate-600` of the rest of the disabled state instead of staying
full-contrast.
