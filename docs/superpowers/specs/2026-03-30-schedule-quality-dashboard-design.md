# Schedule Quality Dashboard — Design Spec

## Overview

Add an inline quality metrics bar to the Schedule Maker that gives dispatchers at-a-glance confidence in the generated schedule before pushing it live. Renders as a row of color-coded badges below the existing stats bar.

## Metrics

| Metric | Source | Thresholds |
|---|---|---|
| **% Seat Match** | `matchType === "seat"` count / total assigned | green >= 80%, gold >= 60%, red < 60% |
| **% Time Match** | `matchType === "time"` count / total assigned | green >= 70%, gold >= 40%, red < 40% |
| **Avg Rest Gap** | For each driver with 2+ blocks, avg hours between consecutive block end -> next block start | green >= 14h, gold >= 11h, red < 11h |
| **Drivers Full** | Drivers with `blocks.length >= MAX_BLOCKS_PER_WEEK` / total drivers with blocks | Informational (no color threshold) |
| **Unassigned** | `unassignedBlocks.length` | green = 0, gold = 1-3, red >= 4 |

## Data Computation

Single pass over `Object.values(proposedSchedule).flat()` on each render. Lightweight — no memoization needed for typical data sizes (50-100 blocks, 20-40 drivers).

```javascript
const allAssigned = Object.values(proposedSchedule).flat();
const totalAssigned = allAssigned.length;

// Seat match
const seatMatches = allAssigned.filter(b => b.matchType === "seat").length;
const seatPct = totalAssigned > 0 ? Math.round((seatMatches / totalAssigned) * 100) : 0;

// Time match
const timeMatches = allAssigned.filter(b => b.matchType === "time").length;
const timePct = totalAssigned > 0 ? Math.round((timeMatches / totalAssigned) * 100) : 0;

// Avg rest gap
const parseTQ = (str) => { /* same parseTB pattern already in file */ };
let totalGaps = 0, gapCount = 0;
Object.values(proposedSchedule).forEach(blocks => {
  if (blocks.length < 2) return;
  const sorted = blocks.slice().sort((a, b) =>
    (a.startMs || parseTQ(a.blockStart)) - (b.startMs || parseTQ(b.blockStart))
  );
  for (let i = 1; i < sorted.length; i++) {
    const prevEnd = sorted[i - 1].endMs || parseTQ(sorted[i - 1].blockEnd);
    const nextStart = sorted[i].startMs || parseTQ(sorted[i].blockStart);
    if (prevEnd !== Infinity && nextStart !== Infinity) {
      totalGaps += (nextStart - prevEnd) / 3600000;
      gapCount++;
    }
  }
});
const avgRestGap = gapCount > 0 ? Math.round(totalGaps / gapCount * 10) / 10 : null;

// Drivers full
const driversFull = Object.values(proposedSchedule)
  .filter(blocks => blocks.length >= MAX_BLOCKS_PER_WEEK).length;
const driversTotal = Object.keys(proposedSchedule).length;
```

## UI Layout

Renders inside the existing `{scheduleCsvRows && (...)}` block, after the current stats bar, gated by `{scheduleGenerated && (...)}`.

```
[existing stats: 120 blocks · 36 drivers · 108 assigned · 12 unassigned (SEA:4 LAS:8)]
[quality row:  🟢 72% Seat  ·  🟡 18% Time  ·  🟢 14.2h Rest  ·  28/36 Full  ·  🔴 12 Open ]
```

Each badge is a `<span>` with:
- `fontSize: 11, fontWeight: 700`
- Background: `B.greenBg` / `B.goldBg` / `rgba(193,59,64,0.08)` based on threshold
- Color: `B.green` / `B.gold` / `B.cancelRed` based on threshold
- `padding: "3px 10px", borderRadius: 6`
- Separated by `<span style={{ color: B.dim }}>·</span>` dividers

## File to Modify

**Single file**: `/Users/shauntpetrossian/Desktop/JoyrideDiagramEd/joyride-logistics-diagram.html`

**Location**: Lines ~2484-2503, after the existing stats `<div>` inside `{scheduleCsvRows && (...)}`.

## Verification

1. Generate a schedule from CSV — quality bar appears with correct metric values
2. Drag blocks between drivers — metrics update in real time
3. Remove all blocks from a driver — avg rest recalculates correctly
4. Assign from suggest dropdown — seat/time match percentages update
5. All unassigned assigned — unassigned badge turns green (0)
6. Color thresholds match spec (manually verify green/gold/red boundaries)
7. Zero console errors
