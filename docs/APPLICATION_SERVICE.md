# Application Service Documentation

This document describes the REST API endpoints, status state-machine transitions, recruiter auditing notes, timeline structures, and event publications for the **Application Service** in Smart Hire.

---

## 1. Application Pipeline States

Job applications progress through the following pipeline statuses:

1. `applied`: Initial state upon candidate submission.
2. `screening`: Initial resume assessment.
3. `interview`: Candidate scheduled for tests/live sessions.
4. `offered`: Formal contract issued to applicant.
5. `rejected`: Pipeline terminated by recruiter.
6. `withdrawn`: Application cancelled by candidate.

---

## 2. Event Publications (Event Bus)

The Application Service publishes structured event logs to the Event Bus upon state changes:

- **`ApplicationSubmitted`**:
  - Emitted when: Candidate applies to a job.
  - Event payload shape:
    ```json
    {
      "applicationId": "app_uuid",
      "candidateId": "cand_uuid",
      "jobId": "job_uuid"
    }
    ```
- **`ApplicationUpdated`**:
  - Emitted when: Status moves (e.g. from `applied` to `screening`).
  - Event payload shape:
    ```json
    {
      "applicationId": "app_uuid",
      "fromStatus": "applied",
      "toStatus": "screening",
      "recruiterUserId": "rec_uuid"
    }
    ```
- **`ApplicationWithdrawn`**:
  - Emitted when: Candidate withdraws their application.
- **`ApplicationRejected`**:
  - Emitted when: Recruiter rejects candidate.
- **`ApplicationAccepted`**:
  - Emitted when: Candidate is moved to `offered` status.

---

## 3. REST API Routes Reference

### 3.1. Pipeline Actions

#### GET `/api/applications`

- **Description**: Returns applications filterable by status, job, or candidate.
- **Query Parameters**:
  - `status`: applied / screening / interview / offered / rejected / withdrawn
  - `jobId`: Job UUID.
  - `candidateId`: Candidate UUID.
- **Response Shape (`200 OK`)**:
  ```json
  {
    "data": [
      {
        "id": "a1f77d3b-967a-42c2-8419-48e0259b360d",
        "job_id": "job_uuid",
        "candidate_id": "cand_uuid",
        "resume_id": "res_uuid",
        "status": "applied",
        "score": null,
        "created_at": "2026-07-11T12:00:00.000Z",
        "updated_at": "2026-07-11T12:00:00.000Z",
        "deleted_at": null
      }
    ]
  }
  ```

#### POST `/api/applications`

- **Description**: Candidate submits a job application.
- **Payload (`application/json`)**:
  ```json
  {
    "jobId": "job_uuid",
    "candidateId": "cand_uuid",
    "resumeId": "res_uuid"
  }
  ```

---

### 3.2. Application Details & Timeline

#### GET `/api/applications/[id]`

- **Description**: Retrieves detailed info on an application, including its status history timeline and recruiter notes.
- **Response Shape (`200 OK`)**:
  ```json
  {
    "data": {
      "id": "a1f77d3b-967a-42c2-8419-48e0259b360d",
      "job_id": "job_uuid",
      "candidate_id": "cand_uuid",
      "resume_id": "res_uuid",
      "status": "screening",
      "application_status_history": [
        {
          "id": "h1f77d3b-967a-42c2-8419-48e0259b360e",
          "from_status": "applied",
          "to_status": "screening",
          "notes": "Resume matches criteria. Moving to screening.",
          "created_at": "2026-07-11T12:30:00.000Z",
          "changed_by": "rec_uuid"
        },
        {
          "id": "h1f77d3b-967a-42c2-8419-48e0259b360d",
          "from_status": "none",
          "to_status": "applied",
          "notes": "Application submitted by candidate",
          "created_at": "2026-07-11T12:00:00.000Z",
          "changed_by": "cand_uuid"
        }
      ]
    }
  }
  ```

---

### 3.3. Pipeline State Transitions

#### PATCH `/api/applications/[id]/status`

- **Description**: Recruiter moves a candidate's pipeline status stage and records notes.
- **Payload (`application/json`)**:
  ```json
  {
    "status": "interview",
    "notes": "Moving to technical interview phase."
  }
  ```

#### PATCH `/api/applications/[id]/withdraw`

- **Description**: Candidate withdraws their application from consideration.
