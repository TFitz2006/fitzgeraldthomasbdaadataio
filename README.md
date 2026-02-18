# 🏢 Energy Analytics Dashboard

A real-time energy consumption analytics platform for facility managers and sustainability teams. Built on top of **Databricks** for data processing and **Lovable Cloud** for the backend, this dashboard provides actionable insights into building-level energy usage across an entire campus or portfolio.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Pages](#pages)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Setup & Configuration](#setup--configuration)
- [Data Schema](#data-schema)
- [Environment Variables](#environment-variables)
- [Known Data Notes](#known-data-notes)

---

## Overview

This dashboard connects to a **Databricks SQL Warehouse** to query pre-aggregated energy tables and present them in an interactive UI. It enables facility managers to:

- Monitor portfolio-wide energy KPIs at a glance
- Identify the top energy-consuming buildings
- Detect anomalies and weather-driven demand spikes
- Deep-dive into per-building hourly consumption patterns
- Make data-driven decisions about capital improvements and operational changes

---

## Features

- 📊 **Portfolio KPIs** — Total kWh, number of buildings, weather coverage, and avg. energy intensity
- 🏆 **Top Buildings Ranking** — Bar chart of the 10 highest-consuming buildings
- 🔍 **Deep Dive** — Per-building hourly timeseries, hourly usage profiles, and day/hour heatmaps
- ⚡ **Anomaly Detection** — Automatically flags days where buildings consumed significantly above their median baseline
- 💡 **Insights** — Correlation analysis between weather and energy, with cost-saving recommendations
- 🌤️ **Weather Overlay** — Temperature and precipitation overlaid on energy charts

---

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | **Overview** | Portfolio-level KPIs and top-10 energy consumers |
| `/insights` | **Insights** | Weather-energy correlation, baseload analysis, cost-saving insights |
| `/deep-dive` | **Deep Dive** | Per-building hourly timeseries, usage profiles, and heatmaps |
| `/anomalies` | **Anomalies** | Ranked list of anomalous consumption events with filter by type |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite |
| **UI Components** | shadcn/ui, Tailwind CSS, Recharts |
| **Data Queries** | Databricks SQL Statement API |
| **Backend Functions** | Lovable Cloud (Edge Functions / Deno) |
| **Routing** | React Router v6 |
| **State / Fetching** | TanStack Query (React Query) |

---

## Architecture

```
Browser (React App)
       │
       ▼
Lovable Cloud Edge Function  ──►  Databricks SQL Warehouse
  (databricks-query)                  (workspace.hackathon.*)
       │
       ▼
   JSON response
       │
       ▼
  React Query cache
       │
       ▼
  Charts & Tables
```

All Databricks queries are proxied through a secure edge function (`supabase/functions/databricks-query/index.ts`). The edge function:
1. Validates that queries only reference allowed tables (allowlist)
2. Authenticates with Databricks using a personal access token
3. Returns results as JSON arrays of objects

---

## Setup & Configuration

### Prerequisites

- Node.js 18+ and npm
- A Databricks workspace with a running SQL Warehouse
- Access to the `workspace.hackathon` catalog/schema (or update `SCHEMA` in `src/lib/databricks.ts`)

### 1. Clone the repository

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
```

### 2. Configure Databricks secrets

In **Lovable Cloud → Secrets** (or your Supabase project → Edge Function secrets), add the following:

| Secret | Description |
|--------|-------------|
| `DATABRICKS_HOST` | Your Databricks workspace hostname, e.g. `adb-1234567890.12.azuredatabricks.net` |
| `DATABRICKS_HTTP_PATH` | SQL Warehouse HTTP path, e.g. `/sql/1.0/warehouses/abc123def` |
| `DATABRICKS_TOKEN` | Databricks personal access token (PAT) |

### 3. Run locally

```sh
npm run dev
```

The app will be available at `http://localhost:8080`.

---

## Data Schema

All tables live in the `workspace.hackathon` Databricks catalog/schema. The following views/tables are used:

| Table | Description |
|-------|-------------|
| `ui_kpis` | Aggregate portfolio KPIs (total kWh, building count, etc.) |
| `ui_top10_total_kwh` | Top 10 buildings by total energy consumption |
| `ui_top10_intensity` | Top 10 buildings by average energy intensity |
| `ui_buildings` | Building directory (id, name, campus) |
| `ui_hourly_timeseries` | Hourly energy (kWh) and temperature per building |
| `ui_building_hourly_profile` | Average kWh by hour-of-day per building |
| `ui_building_heatmap` | Average kWh by day-of-week × hour per building |
| `ui_top_anomalies` | Days where buildings significantly exceeded their baseline |

---

## Environment Variables

The following variables are automatically injected by Lovable Cloud and do **not** need to be set manually:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

The Databricks credentials (`DATABRICKS_HOST`, `DATABRICKS_HTTP_PATH`, `DATABRICKS_TOKEN`) must be added as **secrets** in the Lovable Cloud settings, as they are only accessible inside the edge function at runtime.

---

## Known Data Notes

- **Building 53 (McPherson)** has data quality issues after April 1st, 2025. It is excluded from top-10 charts and post-April anomaly results. Timeseries queries for this building are automatically date-filtered.
- Weather data is available for a subset of buildings; the KPI card reports the percentage of buildings with weather coverage.

---

## Deployment

Open [Lovable](https://lovable.dev) and click **Share → Publish** to deploy the latest version. The app will be live at your published URL.

To connect a custom domain, go to **Project → Settings → Domains**.
