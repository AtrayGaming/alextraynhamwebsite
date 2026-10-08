# Design system and instructional decisions

## Visual identity

A compact control desk with a dark persistent rail and a light learning workspace. Violet identifies the main practice action, pale lime supports review and completion, and warm peach distinguishes scenario practice. Abstract signal bars reinforce the product identity without imitating real operational equipment or alerts.

Typography: self-hosted DM Sans Variable for interface text; JetBrains Mono Variable for small sequence and label details. No third-party font requests. Palette: ink #182035, page #f5f6fa, sidebar #151827, primary #6743d5, supporting lime #d5ed9c, border #e2e5ed. Buttons use 10px corners; cards use 15–20px corners. Spacing follows an 8px-based rhythm with small optical adjustments.

## Interaction rules

- Native buttons, links, inputs and selects; visible focus and a skip link.
- Correct/incorrect feedback uses written explanations and icons as well as color.
- No automatic question advance or required timer. Users decide when to continue.
- Reduced-motion preference disables transitions and celebration animation.
- Completion means all selected concepts were answered correctly at least once in that session. It is not called mastery or qualification.
- Learn mode is self-review, not scored evidence. Trainer points are manually entered, not learner analytics.
- Match mode has a finite queue: correct removes the item; wrong adds it to the end. Previously cleared concepts are skipped unless the user deliberately replays the full set.
- Scenario mode uses a short, finite fictional set and explanations. Branching was deferred because these scenarios do not need a multi-step decision tree.
- Atmosphere examples are creative festival installations; there are no weather alerts, thresholds, safety actions, or coded operational procedures.
- No badges, streak pressure or artificial learning claims. Completion and visible remaining work provide the achievement moment.

## Layouts

Desktop: navigation rail, session highlight, progress panel, four mode cards. Tablet: two-column mode grid and tighter navigation. Phone: compact top navigation, stacked practice/progress panels, two-column mode selection, and full-width learning controls. Trainer presentation removes navigation while retaining explicit exit controls.

## Content versioning

Draft → review → publication by a different administrator. Publishing retires the previous live revision. Existing sessions retain their content snapshot, preventing mid-session answer changes. The public CMS accepts only content explicitly marked fictional and requires confirmation and review; classification flags cannot themselves prove confidentiality, so review remains essential.
