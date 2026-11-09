# UI contrast and resize correction

User scope: fix resize-triggered React310; lighter neutral grey dark mode with readable text/icons/inputs; align connection controls at far right.

Approach: keep existing layout/components and light theme. Use charcoal canvas #26292e, raised surface #32363e, bright text and blue accents. Use header foreground inheritance instead of contrastText intended for primary-filled surfaces. Group connection controls with auto left margin.

- [x] Map production stack to ContentView: conditional hooks at line93 and malformed mobile callback.
- [x] Add focused resize/callback and contrast tests. Observe hook count, callback TypeError and near-black surface failures before fix.
- [x] Keep hooks unconditional, gate behavior inside effects and clear pending scroll timer.
- [x] Apply palette, editor/gutter colors, readable header controls and right aligned group.
- [x] Verify production build and focused tests; independent patch review.
- [ ] Build version2 packages, install macOS app preserving user settings, publish checked assets and README update.

No browser/live website testing. Native Windows/Linux execution remains unverified. Existing whole-repo lint issues are outside scope.

Review caught pale tree selection backgrounds. Added failing contrast test and corrected action surfaces; all five tests pass. Independent review confirmed selection/hover contrast 5.15:1–9.08:1. Production compilation passed with existing upstream warnings. Added scoped CI job without browser tests.
