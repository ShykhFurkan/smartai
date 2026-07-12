# Job Service Documentation

This document describes the REST API endpoints, input validation schemas, database models, and lifecycle transitions for the **Job Service** in Smart Hire.

---

## 1. Domain Models Validation (Zod)

The Job Service enforces strict domain validations on inputs:

- **`title`**: String, minimum 1 character, maximum 255.
- **`type`**: Must be one of `['full-time', 'part-time', 'contract', 'internship']`.
- **`status`**: Must be one of `['draft', 'published', 'closed']`.
- **`experienceLevel`**: Must be one of `['entry', 'mid', 'senior', 'lead', 'executive']`.
- **`salaryMin` / `salaryMax`**: Non-negative numeric values. Validation enforces `salaryMax >= salaryMin` if both values are supplied.

---

## 2. REST API Routes Reference

### 2.1. Jobs Management Endpoints

#### GET `/api/jobs`

- **Description**: Returns a filtered list of jobs ordered by creation date descending.
- **Query Parameters**:
  - `status`: Filter by status (`draft`, `published`, `closed`).
  - `category`: Filter by category title.
  - `location`: Case-insensitive search on location string.
  - `type`: Filter by job type.
- **Response Shape (`200 OK`)**:
  ```json
  {
    "data": [
      {
        "id": "e2f77d3b-967a-42c2-8419-48e0259b360c",
        "company_id": "c1a77d3b-967a-42c2-8419-48e0259b360a",
        "department_id": null,
        "recruiter_id": "r1a77d3b-967a-42c2-8419-48e0259b360b",
        "title": "Software Engineer",
        "description": "We are seeking a senior Node backend developer...",
        "location": "Remote, US",
        "type": "full-time",
        "status": "published",
        "salary_min": 120000.0,
        "salary_max": 150000.0,
        "experience_level": "senior",
        "category": "Engineering",
        "benefits": ["401k", "Health Insurance"],
        "created_at": "2026-07-11T12:00:00.000Z",
        "updated_at": "2026-07-11T12:00:00.000Z",
        "deleted_at": null
      }
    ]
  }
  ```

#### POST `/api/jobs`

- **Description**: Creates a new job posting. The default status is `draft`.
- **Auth Scope**: Recruiter or Company Admin role.
- **Payload (`application/json`)**:
  ```json
  {
    "title": "Backend Engineer",
    "description": "Looking for Node.js developer.",
    "companyId": "c1a77d3b-967a-42c2-8419-48e0259b360a",
    "recruiterId": "r1a77d3b-967a-42c2-8419-48e0259b360b",
    "location": "San Francisco, CA",
    "type": "full-time",
    "salaryMin": 90000,
    "salaryMax": 110000,
    "experienceLevel": "mid",
    "category": "Engineering",
    "benefits": ["Dental", "Vision"]
  }
  ```

---

### 2.2. Job Detail Endpoints

#### GET `/api/jobs/[id]`

- **Description**: Retrieves single job detail mapping by ID.

#### PATCH `/api/jobs/[id]`

- **Description**: Updates specific fields of the job posting.
- **Auth Scope**: Recruiter owner or Company Admin.

#### DELETE `/api/jobs/[id]`

- **Description**: Soft deletes the job posting (sets `deleted_at = now()`).

---

### 2.3. Lifecycle Transitions Endpoints

#### PATCH `/api/jobs/[id]/publish`

- **Description**: Transitions the job status to `published`, making it visible to candidate searches.
- **Response Shape (`200 OK`)**:
  ```json
  {
    "data": {
      "id": "e2f77d3b-967a-42c2-8419-48e0259b360c",
      "status": "published"
    }
  }
  ```

#### PATCH `/api/jobs/[id]/archive`

- **Description**: Transitions the job status to `closed`, taking it offline.
- **Response Shape (`200 OK`)**:
  ```json
  {
    "data": {
      "id": "e2f77d3b-967a-42c2-8419-48e0259b360c",
      "status": "closed"
    }
  }
  ```
