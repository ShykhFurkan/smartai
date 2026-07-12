# Analytics Service — Architecture and API Documentation

This document describes the design, database integration, metric processing model, and REST API for the **Analytics Service** in Smart Hire.

---

## 1. Architecture Overview

The Analytics Service operates on a read-optimized query pattern. While candidate profile, application, job, and organization services manage their own write transactions, they publish events (or write database logs). The `analytics` schema consumes these events/logs (via Supabase Webhooks, database triggers, or event workers) and materializes facts and rollup tables for fast retrieval.

```
+-----------------------------------+
|       Write Services (OLTP)       |
|  Auth, Organization, Job, App    |
+-----------------------------------+
                  |
                  | writes events/logs
                  v
+-----------------------------------+
|         Analytics Schema          |
|  Pre-aggregated rollup tables &   |
|         fact tables               |
+-----------------------------------+
                  |
                  | queries via createAnalyticsClient()
                  v
       +--------------------+
       | AnalyticsRepository|
       +--------------------+
                  |
                  v
       +--------------------+
       |  AnalyticsService  |
       +--------------------+
                  |
                  v
       +--------------------+
       | REST API Endpoints |
       +--------------------+
```

---

## 2. Metrics Definition & Contracts

The Analytics Service supports six core metric groups and a dedicated Charts API.

### 2.1. Applications Metrics

- **Usage**: General analytics on volume of applications received.
- **Fields**: Total counts, delta/percentage changes vs prior period, time series trend, status distribution, job categories distribution, and sourcing channels (LinkedIn, Referral, etc.).

### 2.2. Hiring Funnel

- **Usage**: Shows candidate flow through pipeline stages (Applied → Screening → Interview → Offered → Accepted).
- **Fields**: Stage-by-stage counts, stage-to-stage conversion rate, cumulative conversion rate, total enters, and total conversions.

### 2.3. Time To Hire

- **Usage**: Measures efficiency of the recruiting process.
- **Fields**: Average days, median days, 90th percentile (SLA check), and averages broken down by stage and job category.

### 2.4. Recruiter Performance

- **Usage**: Tracks team workload, speed, and conversion efficiency.
- **Fields**: Applications reviewed, interviews scheduled, offers extended, offers accepted, avg response time (days), overall hire rate, and comparative team averages.

### 2.5. Candidate Conversion

- **Usage**: Detailed conversion metrics from a candidate perspective.
- **Fields**: Funnel conversion rates and candidate withdrawal reason counts (e.g., compensation mismatch, competitor offer).

### 2.6. Company Dashboard

- **Usage**: Aggregate Overview for admins and company managers.
- **Fields**: Active jobs, open positions, total applications, total hires, avg time-to-hire, pipeline snapshot, application volume trend, top job categories, and department-level activity rollup.

---

## 3. Database Schema Mapping (analytics schema)

To enable fast response times, queries target pre-aggregated tables in the `analytics` schema:

1. **`analytics.application_facts`**: Denormalized log of application events, statuses, and times. Used for volume, funnel, and time-to-hire queries.
2. **`analytics.recruiter_activity_facts`**: Logs recruiter actions like candidate reviews, schedule events, and offer dispatches.
3. **`analytics.daily_snapshots`**: Daily rolls of key metrics like active jobs, total open positions, and total applications.

_If these tables do not contain data or have not been created yet, the service falls back gracefully to deterministic stub generators to keep the frontend and external integrations functional._

---

## 4. REST API Endpoint Reference

All endpoints accept standard filter parameters:

- `from` (string, required): Start date (YYYY-MM-DD)
- `to` (string, required): End date (YYYY-MM-DD)
- `companyId` (uuid, optional): Filter by company
- `departmentId` (uuid, optional): Filter by department

### 4.1. Applications Metrics

**GET `/api/analytics/applications`**

- Query parameters: `from`, `to`, `companyId`, `departmentId`

### 4.2. Hiring Funnel

**GET `/api/analytics/hiring-funnel`**

- Query parameters: `from`, `to`, `companyId`, `departmentId`

### 4.3. Time to Hire

**GET `/api/analytics/time-to-hire`**

- Query parameters: `from`, `to`, `companyId`, `departmentId`

### 4.4. Recruiter Performance

**GET `/api/analytics/recruiter-performance`**

- Query parameters: `from`, `to`, `companyId`, `recruiterId?`, `limit?`

### 4.5. Candidate Conversion

**GET `/api/analytics/candidate-conversion`**

- Query parameters: `from`, `to`, `companyId`, `departmentId`

### 4.6. Company Dashboard Overview

**GET `/api/analytics/company-dashboard`**

- Query parameters: `from`, `to`, `companyId`, `departmentId`

### 4.7. Charts API

**GET `/api/analytics/charts`**

- Query parameters: `from`, `to`, `companyId`, `metric`, `granularity`
- Supported metrics:
  - `applications_volume` (Line chart trend)
  - `hiring_funnel` (Funnel stage chart)
  - `time_to_hire_trend` (Area chart trend)
  - `conversion_rates` (Bar chart stage rates)
  - `recruiter_leaderboard` (Bar chart leaderboard)
  - `pipeline_snapshot` (Doughnut chart)
- Granularities: `day`, `week`, `month`

---

## 5. Typical Response Payload (Charts API)

**GET `/api/analytics/charts?from=2026-06-01&to=2026-06-07&metric=applications_volume`**

```json
{
  "data": {
    "metric": "applications_volume",
    "chartType": "line",
    "labels": [
      "2026-06-01",
      "2026-06-02",
      "2026-06-03",
      "2026-06-04",
      "2026-06-05",
      "2026-06-06",
      "2026-06-07"
    ],
    "datasets": [
      {
        "label": "Applications",
        "data": [5, 7, 4, 8, 3, 5, 6],
        "color": "#6366f1"
      }
    ],
    "computedAt": "2026-07-12T07:45:00.000Z"
  }
}
```
