# Joyride Logistics — Fleet Operations & Schedule Maker

A self-contained React application for managing fleet operations, driver scheduling, and real-time ELD integration for Joyride Logistics LLC.

## Overview

This tool serves two primary functions:

1. **Fleet Operations** — Visualize current driver-block assignments from Amazon Relay CSV exports, with real-time Samsara ELD integration for live HOS (Hours of Service) data, vehicle locations, and duty status.

2. **Schedule Maker** — Generate optimized weekly driver schedules by matching blocks to drivers based on their Operator ID (seat assignment), preferred start times, and HOS compliance constraints.

## Architecture

Single HTML file (`joyride-logistics-diagram.html`) with React 18 via CDN and Babel standalone for in-browser JSX. No build tooling required. Node.js server (`server.js`) handles static file serving + Samsara API proxy.

```
Browser ──► server.js (port 8080) ──► Static files
                                  ──► /api/samsara/* ──► Samsara API (HOS, locations, drivers)
                                  ──► /api/profiles  ──► driver-profiles.json (read/write)
```

## Features

### Fleet Operations Tab

- **Driver-centric rows** — Each row shows one driver with their blocks inline, grouped by domicile (LAS/PHX/ONT/ELP)
- **Block management** — Click to cancel blocks, assign backup drivers, drop blocks permanently
- **Smart backup ranking** — Ranks available backup drivers by start time match, proximity (shared facilities), and cycle hours remaining
- **Samsara ELD integration** — Connect API token for live duty status (Driving/On Duty/Off Duty/Sleeper), shift/drive/break remaining, cycle remaining, and current vehicle location
- **Driver profiles** — Preferred start times computed from historical block data, saved to `driver-profiles.json` for persistence across sessions
- **Region filtering** — Filter by domicile: ALL, ELP, LAS, ONT, PHX
- **Search and sort** — Search drivers by name, sort by availability, alphabetical, miles, or start time
- **Demo mode** — Bayern Munich player names with connection-line visualization (two-column layout with SVG bezier curves)

### Schedule Maker Tab

- **1-click schedule generation** — Upload next week's Amazon Relay CSV, click "Generate Schedule" to produce optimized assignments
- **Driver-first algorithm** — Each driver picks their best 3 blocks based on:
  - **Operator ID match** (50%) — Blocks from the driver's historically assigned seat score highest
  - **Start time match** (50%) — Gaussian scoring against the driver's preferred start windows with ±6h hard cutoff
- **HOS timing compliance** — 37h block + 10h break + 37h block + 34h mandatory restart + 37h block
- **Week-spread bucketing** — Blocks placed in Block 1 (early week), Block 2 (mid week), Block 3 (late week) based on date range
- **Gap-aware vacant slots** — If a driver has blocks on Mar 21 and Mar 28, Block 2 is vacant with a SUGGEST button (not just left-to-right fill)
- **Suggest dropdown** — Click vacant "+" slot to see available unassigned blocks ranked by time fit percentage
- **Drag-and-drop** — Drag blocks between slots and drivers. Swap two filled blocks or move to vacant slots
- **Block removal** — Click × to remove a proposed block (moves to unassigned pool)
- **Reassign dropdown** — Click any proposed block to reassign to another eligible driver
- **Export CSV** — Download proposed schedule as CSV file
- **Push to Main View** — Transfer finalized schedule to Fleet Operations tab

### Samsara ELD Integration

- **Connect** — Enter Samsara API token via "Connect ELD" button (validated against Samsara API)
- **Live data** — HOS clocks (drive/shift/cycle/break remaining), duty status, vehicle location
- **Driver matching** — Fuzzy name matching between CSV driver names and Samsara driver records
- **Auto-polling** — HOS data refreshes every 60 seconds
- **Token security** — Stored in server memory only, never persisted to disk

### Driver Profiles

- **Preferred start times** — Clustered from historical block start hours. Multiple windows supported (e.g., 6:45pm and 3am)
- **Shift classification** — AM (4-10), MID (10-15), PM (15-21), NIGHT (21-4)
- **Consistency score** — Percentage of blocks matching the primary shift band
- **Persistence** — Saved to `driver-profiles.json` via server API, accumulated across weekly CSV uploads
- **Domicile tracking** — Driver's region extracted from Operator ID

## Data Sources

### Amazon Relay CSV (`Trips.csv`)

The primary data source. Export from Amazon Relay with columns including:

| Column | Purpose |
|--------|---------|
| Block ID | Groups trips into blocks |
| Trip ID | Individual trip identifier |
| Driver Name | Driver assigned to the trip |
| Operator ID | Seat/slot identifier (e.g., `JYRG_LAS_Solo2_1000`) — encodes region and seat number |
| Stop 1/2 | Facility names (pickup/delivery) |
| Stop 1/2 Planned Arrival Date/Time | Block timing |
| Estimate Distance | Trip mileage |
| Trip Stage | Tendered, Upcoming, In Transit, History |

### Samsara API

Real-time ELD data via server-side proxy:

| Endpoint | Data |
|----------|------|
| `/fleet/drivers` | Driver list with static vehicle assignments |
| `/fleet/hos/clocks` | Drive/shift/cycle/break remaining (milliseconds) |
| `/fleet/vehicles/locations` | Vehicle GPS with reverse-geocoded addresses |

### Driver Profiles (`driver-profiles.json`)

Persisted driver preference data:

```json
{
  "Dalinza Joynes": {
    "startTimes": [{ "hour": 18.4, "date": "03/20/2026" }],
    "domicile": "LAS",
    "preferredStartLabel": "6:51pm",
    "preferredShift": "PM",
    "shiftConsistency": 100,
    "lastUpdated": "2026-03-22T04:35:19.957Z"
  }
}
```

## Scheduling Algorithm

### Greedy Best-Fit (Driver-First)

1. **Build driver profiles** — Extract primary/secondary seat, preferred start hours from historical CSV
2. **Sort drivers by constraint** — Single-seat drivers scheduled first (most constrained)
3. **For each driver, score all available blocks**:
   - Seat match: primary seat = 1.0, secondary = 0.5, other = 0.1
   - Time match: Gaussian decay centered on preferred hours, σ adapts to consistency
4. **Pick 3 blocks spread across the week** — One from each time bucket (early/mid/late), fill remaining from best available
5. **Enforce HOS rest** — 10h between Block 1→2, 34h mandatory restart before Block 3
6. **Unassigned pool** — Remaining blocks available via suggest dropdown or drag-and-drop

### Start Time Matching

- **Gaussian scoring**: `e^(-delta²/2σ²)` with adaptive sigma based on driver consistency
- **Cluster weighting**: Windows backed by more historical starts score higher
- **±6h hard cutoff**: Blocks >6h from any preferred window rejected in strict pass
- **Multiple windows**: A driver with starts at 6pm and 3am has two scoring windows

## Running Locally

```bash
npm install   # no dependencies, but sets up package.json
npm start     # starts server on port 8080
```

Open `http://localhost:8080` in a browser.

## Deployment

Deployed on Railway at `joyridelogisticsdiagramed-production.up.railway.app`.

```bash
git push origin main  # Railway auto-deploys from GitHub
```

## Project Structure

```
├── joyride-logistics-diagram.html  # Complete React app (single file)
├── server.js                       # Node.js static server + Samsara API proxy + profiles API
├── driver-profiles.json            # Persisted driver preference data
├── Trips.csv                       # Sample Amazon Relay CSV export
├── package.json                    # Node.js config (start script, engine)
├── Joyride-logo-header-footer-01-768x293.png  # Company logo
└── README.md
```

## API Routes

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/samsara/status` | Check if Samsara token is set |
| POST | `/api/samsara/connect` | Validate and store Samsara API token |
| DELETE | `/api/samsara/disconnect` | Clear Samsara token |
| GET | `/api/samsara/drivers` | Proxy to Samsara /fleet/drivers |
| GET | `/api/samsara/hos/clocks` | Proxy to Samsara /fleet/hos/clocks |
| GET | `/api/samsara/locations` | Proxy to Samsara /fleet/vehicles/locations |
| GET | `/api/samsara/vehicles` | Proxy to Samsara /fleet/vehicles |
| GET | `/api/samsara/debug` | Raw Samsara response samples for field inspection |
| GET | `/api/profiles` | Load all driver profiles |
| POST | `/api/profiles` | Save/merge driver profiles |
| DELETE | `/api/profiles` | Clear all profiles |

## Key Constraints

- **3 blocks per driver per week** (max)
- **37h block duration** (includes 10h built-in rest)
- **10h break** between Block 1 and Block 2
- **34h mandatory restart** before Block 3
- **34h minimum cycle remaining** for backup eligibility
- **Same domicile** required for block assignment and backup selection
- **±6h preferred start window** for schedule matching
