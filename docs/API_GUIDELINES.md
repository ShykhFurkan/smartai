# API Design Guidelines

This document outlines the API guidelines, endpoints naming schemes, response objects structures, and error handling policies for **Smart Hire**.

---

## 1. RESTful Path Design

- **Plural Resources**: Endpoint resource paths must use plural nouns (e.g. `/api/v1/jobs`, not `/api/v1/job`).
- **HTTP Methods**: Use standard HTTP methods to represent operations:
  - `GET`: Retrieve a resource or a list of resources.
  - `POST`: Create a new resource.
  - `PUT`: Replace an entire resource structure.
  - `PATCH`: Apply partial modifications to a resource.
  - `DELETE`: Remove a resource.
- **Resource Nesting**: Represent relationships clearly:
  - `GET /api/v1/jobs` - List all jobs.
  - `GET /api/v1/jobs/:jobId/applications` - List applications belonging to a specific job.

---

## 2. API Versioning

API endpoints must be versioned to prevent breaking clients during schema updates.

- **Path Versioning**: Include the major version prefix in the URI:
  - `/api/v1/jobs`
  - `/api/v1/candidates`

---

## 3. Response Structure (JSON Envelope)

All REST API responses must return structured JSON envelopes to simplify client parsing.

### 3.1. Successful Response

A wrapper object containing a `data` field (holding the payload) and optional `meta` field (holding pagination or runtime telemetry).

```json
{
  "data": {
    "id": "job_01",
    "title": "Senior AI Architect",
    "department": "Engineering",
    "status": "published"
  }
}
```

#### Paginated Response:

```json
{
  "data": [{ "id": "job_01", "title": "Senior AI Architect" }],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalCount": 42,
    "totalPages": 5
  }
}
```

---

## 4. Error Handling & Format

When an API request fails, the service must return a uniform error object containing descriptive metadata.

### 4.1. Error Response Envelope

Must return a `error` field containing the details of the failure. Do not return raw stack traces in non-development environments.

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The application payload failed schema verification.",
    "timestamp": "2026-07-11T10:19:00Z",
    "details": [
      {
        "field": "email",
        "issue": "Invalid email address format."
      }
    ]
  }
}
```

---

## 5. HTTP Status Codes

We use HTTP status codes to communicate request results:

| Status Code                     | Type         | Meaning                                                                         |
| :------------------------------ | :----------- | :------------------------------------------------------------------------------ |
| **`200 OK`**                    | Success      | Request succeeded. Returning requested resource.                                |
| **`201 Created`**               | Success      | Resource created successfully (e.g. from `POST` requests).                      |
| **`204 No Content`**            | Success      | Request succeeded, but returning no payload (e.g. from `DELETE` requests).      |
| **`400 Bad Request`**           | Client Error | The request could not be processed due to invalid parameters or malformed JSON. |
| **`401 Unauthorized`**          | Client Error | Missing or invalid authentication token.                                        |
| **`403 Forbidden`**             | Client Error | User is authenticated but lacks permissions to modify or access the resource.   |
| **`404 Not Found`**             | Client Error | The requested resource does not exist.                                          |
| **`429 Too Many Requests`**     | Client Error | Rate limit exceeded.                                                            |
| **`500 Internal Server Error`** | Server Error | An unhandled exception occurred on the server.                                  |
