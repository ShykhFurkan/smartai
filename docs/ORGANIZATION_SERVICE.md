# Organization Service Documentation

This document describes the REST API endpoints, payload validation constraints, permission bounds, and PostgreSQL schema definitions for the **Organization Service** in Smart Hire.

---

## 1. Responsibilities & Service Limits

The Organization Service is responsible for:

- Company registrations and modifications.
- Department subgroups hierarchy management.
- Recruiter profile mappings and permission roles assignment.
- Recruiter invitation dispatch and token tracking.
- Brand assets configuration (Hex primary/accent colors, logo URLs).
- Subscription tier mapping (Free, Growth, Enterprise).

### Microservice Isolation Boundary

This service operates strictly on tables under the `organization` PostgreSQL schema. It does not access other service databases (e.g. Candidates profiles, resumes, application pipelines). All cross-service integration occurs via standard REST APIs or messaging events.

---

## 2. Validation Schemas (Zod)

All API route inputs are validated before database insertions:

- **`createCompanySchema`**: Sanitizes name, slug structure, optional domain, and optional logo URL.
- **`updateCompanySchema`**: Sanitizes partial updates including hex color codes and subscription tiers.
- **`createDepartmentSchema`**: Sanitizes department names and verifies valid UUID bindings.
- **`inviteRecruiterSchema`**: Sanitizes email formats and verifies target role definitions (`recruiter`, `hiring_manager`).

---

## 3. REST API Routes Reference

### 3.1. Company Endpoints

#### GET `/api/organization/companies`

- **Description**: Returns all active companies associated with the authenticated user.
- **Auth Role**: Any authenticated user (`platform-admin`, `recruiter`, `candidate`).
- **Response Shape (`200 OK`)**:
  ```json
  {
    "data": [
      {
        "id": "c1f77d3b-967a-42c2-8419-48e0259b360b",
        "name": "Smart Hire AI",
        "slug": "smart-hire-ai",
        "domain": "smarthire.ai",
        "logo_url": "https://cdn.smarthire.ai/logo.png",
        "created_at": "2026-07-11T16:20:00Z"
      }
    ]
  }
  ```

#### POST `/api/organization/companies`

- **Description**: Creates a new company profile and registers the creator as the Owner (`role: 'owner'`).
- **Auth Role**: Authenticated users.
- **Payload (`application/json`)**:
  ```json
  {
    "name": "Acme Corporation",
    "slug": "acme-corp",
    "domain": "acme.com",
    "logoUrl": "https://acme.com/logo.png"
  }
  ```
- **Response Shape (`210 Created`)**: Returns the inserted company object.

---

### 3.2. Single Company Workspace Endpoints

#### GET `/api/organization/companies/[id]`

- **Description**: Fetch details of a single company.
- **Auth Role**: Recruiters belonging to the company, or Platform Admins.

#### PATCH `/api/organization/companies/[id]`

- **Description**: Update company details, branding primary/accent colors, and subscription parameters.
- **Auth Role**: Company Owner, Recruiters, and Platform Admins.
- **Payload (`application/json`)**:
  ```json
  {
    "name": "Acme Inc.",
    "primaryColor": "#1e40af",
    "accentColor": "#f59e0b",
    "subscriptionTier": "growth"
  }
  ```

#### DELETE `/api/organization/companies/[id]`

- **Description**: Soft delete a company profile (sets `deleted_at = now()`).
- **Auth Role**: Company Owner, Platform Admins.

---

### 3.3. Department Endpoints

#### GET `/api/organization/departments?companyId=[uuid]`

- **Description**: List active departments under a company.
- **Auth Role**: Member recruiters, Platform Admins.

#### POST `/api/organization/departments`

- **Description**: Add a department to a company.
- **Auth Role**: Company Owner, Recruiters, Platform Admins.
- **Payload (`application/json`)**:
  ```json
  {
    "companyId": "c1f77d3b-967a-42c2-8419-48e0259b360b",
    "name": "Engineering"
  }
  ```

#### PATCH `/api/organization/departments/[id]`

- **Description**: Modify department name.
- **Auth Role**: Company Owner, Recruiters, Platform Admins.

#### DELETE `/api/organization/departments/[id]`

- **Description**: Soft delete a department.
- **Auth Role**: Company Owner, Recruiters, Platform Admins.

---

### 3.4. Recruiter Invitations Endpoints

#### GET `/api/organization/invitations?companyId=[uuid]`

- **Description**: List invitations issued for a company workspace.
- **Auth Role**: Member recruiters, Platform Admins.

#### POST `/api/organization/invitations`

- **Description**: Dispatches a new invitation to invite another user as recruiter/hiring manager.
- **Auth Role**: Company Owner, Company Admin, Platform Admins.
- **Payload (`application/json`)**:
  ```json
  {
    "companyId": "c1f77d3b-967a-42c2-8419-48e0259b360b",
    "email": "hiring.manager@acme.com",
    "role": "hiring_manager"
  }
  ```
- **Response Shape (`201 Created`)**:
  ```json
  {
    "data": {
      "id": "e4f8d9b2-36c1-4b11-a8cf-19b48c26f0aa",
      "company_id": "c1f77d3b-967a-42c2-8419-48e0259b360b",
      "email": "hiring.manager@acme.com",
      "role": "hiring_manager",
      "token": "4a18df7b-12d8-4f2a-8926-e918bcde76a3",
      "status": "pending",
      "invited_by": "usr_01",
      "expires_at": "2026-07-18T16:20:00Z"
    }
  }
  ```
