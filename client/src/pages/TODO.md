# IssueDetails layout refactor TODO

- [x] Refactor `NGP-Civics/client/src/pages/IssueDetails.jsx` layout wrapper:
  - [x] Remove `h-screen overflow-hidden` outer constraint
  - [x] Consolidate to a single scroll context (remove inner `overflow-y-auto`)
- [x] Fix sticky header clipping:
  - [x] Remove `-mx-4` from `StickyTopBar` wrapper
- [x] Fix aside alignment:
  - [x] Adjust desktop aside `sticky top-[90px]` to a safe value that matches header stacking


- [x] Ensure responsiveness:
  - [x] Keep existing responsive grid and avoid fixed-height/absolute-position issues in layout
- [x] Run a quick build/dev check (manual in browser) to confirm single page scroll + no overlap
