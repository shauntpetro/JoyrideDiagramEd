# Changelog — Joyride Logistics Fleet Operations

---

## v1.4.0 — Schedule Maker UX Overhaul + Quality Dashboard
*2026-03-30*

### New Features
- **Sticky Open Blocks Panel** — Unassigned blocks now live in a sticky right-side panel per domicile (CSS Grid + `position: sticky`). Panel scrolls with you as you scan drivers and releases at each domicile boundary.
- **Schedule Quality Dashboard** — Inline metrics bar showing % Seat Match, % Time Match, Avg Rest Gap, Drivers Full, and Open count with color-coded thresholds (green/gold/red).
- **Data Staleness Indicator** — Samsara connection panel now shows "updated Xs ago" with a manual refresh button.
- **Print Stylesheet** — `@media print` rules for clean printed output (white background, hidden interactive elements, flattened sticky positioning).
- **Keyboard Navigation** — Tab cycles through drivers (Shift+Tab reverses), Tab with no selection selects first driver.

### Bug Fixes
- Fixed CSV parser to handle escaped quotes (`""` within fields) and pad short rows
- Fixed O(n^2) driver name lookup — replaced array scan with reverse Map
- Fixed empty bucket edge case in `greedySchedule` quartile logic (`Math.min(...[])`)
- Fixed `trips[0]` undefined access in suggest dropdown when trips array is empty
- Fixed stale HOS cycle display — shows "—" instead of misleading estimate when data unavailable
- Removed dead code: unused `proposedDurationHrs` variable, stale `REST_2_3_MS` constant
- Fixed hardcoded `/3` and `>= 3` references — now all use `MAX_BLOCKS_PER_WEEK`

### Improvements
- Replaced silent `.catch(() => {})` with `console.warn` error logging on all API calls
- Added warning for silently dropped CSV rows (missing Operator ID and Driver Name)
- Performance: hoisted `scheduleBlocks.map().filter()` from driver-level to domicile-level
- Drag-and-drop validation: domicile match + max capacity checks with red/green visual feedback
- Open block count badge ("X open") in domicile headers
- Sticky column headers in schedule maker
- Updated stale comments throughout codebase

---

## v1.3.0 — Schedule Maker
*2026-03*

### New Features
- **Schedule Maker Tab** — Upload next week's CSV blocks and auto-generate optimized driver schedules
- **Greedy Best-Fit Algorithm** — Assigns blocks by Operator ID seat match (primary), then start time preference (secondary), with 10h rest enforcement
- **4-Block Support** — Drivers can be assigned up to 4 blocks per week (upgraded from 3)
- **Drag-and-Drop** — Manually rearrange blocks between drivers in the proposed schedule
- **Suggest Dropdown** — Vacant slots show a "+" button with best-matching unassigned blocks ranked by time fit
- **Block Reassignment** — Click any assigned block to reassign to a different driver
- **Time-Bucketed Columns** — Blocks placed in Block 1/2/3/4 columns based on chronological position in the week
- **Export CSV** — Export proposed schedule as CSV for re-upload to Amazon Relay
- **Push to Main View** — Apply proposed schedule directly to the Fleet Operations diagram

### Algorithm Details
- Operator ID match is top priority (seat affinity)
- Gaussian time-preference scoring with +-6h hard cutoff
- 10h minimum rest between any two adjacent blocks
- Multi-pass: pick from 4 time buckets first, then fill remaining from best scores
- Drivers sorted by constraint level (single-seat drivers first)

---

## v1.2.0 — Backup System + HOS Compliance
*2026-03*

### New Features
- **Block Cancellation** — Click any block to mark it cancelled (red styling + strikethrough)
- **Backup Driver Assignment** — Cancelled blocks show a ranked list of available backup drivers
- **Cascading Backup** — When a primary driver cancels, backup is auto-suggested based on seat history, start time preference, and facility proximity
- **HOS Compliance Rules** — Backup eligibility requires 34h+ cycle remaining and no time conflicts
- **Driver Profile Bank** — Save/load driver preferences (start times, seat history) via `/api/profiles`
- **Block Suggestion Slots** — Empty slots show smart recommendations based on schedule constraints
- **Inline Confirmation** — Backup assignment uses inline banner instead of modal overlay

### Improvements
- Domicile-restricted backup recommendations (same domicile only)
- Seat labels and block duration displayed on each block card
- Domicile stats (available/full driver counts) in section headers
- Sort drivers by start time, name, availability, or miles
- 2-hour cluster analysis for preferred start times with multi-label support
- Driver current location from Samsara displayed on cards

---

## v1.1.0 — Samsara ELD Integration + Driver-Centric Redesign
*2026-03*

### New Features
- **Samsara ELD Integration** — Connect via API token to pull real-time driver HOS data
- **HOS Status Display** — Live duty status (driving/on_duty/sleeper_berth/off_duty) with color indicators
- **Cycle Remaining** — 70h cycle clock with duty/drive/break remaining from Samsara
- **Driver-Centric Layout** — Restructured from truck-centric to driver-centric rows grouped by domicile
- **Domicile Numbering** — Drivers numbered within their domicile section

### Improvements
- Block start/end times with dates displayed on each card
- Scheduled hours per driver computed from block time spans
- Blocks sorted chronologically within each driver row
- Stage color-coding (Upcoming/In Transit/Completed)

---

## v1.0.0 — Initial Release
*2026-03*

### Features
- **Fleet Operations Diagram** — Interactive two-column layout showing drivers and loads with connection lines
- **CSV Upload** — Import Amazon Relay trip data with auto-parsing of Operator IDs, blocks, and routes
- **Region Filtering** — Filter by domicile (SEA, LAS, etc.) from Operator ID structure
- **Dual Model Comparison** — Toggle between "New System" (20 drivers / 10 loads / 4 blocks) and "Legacy System" (20 drivers / 20 loads / 3 blocks)
- **Primary/Secondary Driver Rotation** — Visual indication of driver rotation across blocks
- **Block Details** — Each block shows driver assignment, trip count, mileage
- **Keyboard Navigation** — Arrow keys to cycle drivers, Escape to deselect
- **Dark Theme** — Professional dark UI with Joyride Logistics branding

---

## Backlog — Planned Improvements

### High Priority
- [ ] **Per-Driver Assignment Export** — Generate printable/PDF per-driver assignment sheets with blocks, times, routes, rest gaps
- [ ] **Undo/Revision History** — Undo stack for drag-drop, reassign, and suggest operations in Schedule Maker

### Medium Priority
- [ ] **Multi-Week Comparison** — Load previous week's schedule alongside current for fairness/balance review
- [ ] **Driver Workload Prediction** — Flag drivers exceeding 60h/week or with 3+ consecutive blocks <12h apart
- [ ] **Conflict Detection Dashboard** — Show why the algorithm made each assignment choice
- [ ] **Amazon Relay Direct Integration** — Push schedule directly to Relay API instead of CSV export

### Future
- [ ] **Driver Preference Persistence** — Fallback to localStorage when API unavailable
- [ ] **Block Splitting/Combining** — Split 4-block loads into 2x2 across the week
- [ ] **Historical Performance Tracking** — Per-driver metrics (on-time %, block acceptance rate)
- [ ] **A/B Schedule Testing** — Run multiple algorithm strategies and compare metrics
- [ ] **Audit Trail** — Timestamped log of all schedule changes for compliance
