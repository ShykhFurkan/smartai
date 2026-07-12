# Candidate Service Documentation

This document describes the REST API endpoints, input validation schemas, database boundaries, and architectural layers for the **Candidate Service** in Smart Hire.

---

## 1. Architectural Strategy (Clean Architecture)

The Candidate Service is organized into distinct layers to isolate database technology details from domain logic:

1. **Domain Layer (Validations)**: Exposes Zod schemas in [apps/web/src/services/candidate-schemas.ts](file:///c:/Users/Furkan/Desktop/smart%20hire/apps/web/src/services/candidate-schemas.ts) detailing formatting checks (e.g. Hex patterns, URL structures, YYYY-MM-DD checks, and start/end dates compliance).
2. **Data Layer (Repository)**: Abstracts SQL/Supabase interactions under [apps/web/src/services/candidate-repository.ts](file:///c:/Users/Furkan/Desktop/smart%20hire/apps/web/src/services/candidate-repository.ts). Operates exclusively on tables in the `candidate` PostgreSQL schema.
3. **Logic Layer (Service)**: Orchestrates validations, database transactions, and prefaced logs inside [apps/web/src/services/candidate-service.ts](file:///c:/Users/Furkan/Desktop/smart%20hire/apps/web/src/services/candidate-service.ts).
4. **Presentation Layer (Controllers)**: Exposes Route Handlers to Next.js API endpoints, resolving parameters, routing guards, and returning unified JSON envelopes.

---

## 2. PostgreSQL Schema Isolation

All tables used by the Candidate Service reside in the isolated `candidate` database schema:

- `candidate.candidates`: Core applicant profiles linked to users.
- `candidate.education`: Educational historical background logs.
- `candidate.experience`: Professional experience logs.
- `candidate.projects`: Individual candidate projects and portfolio references.
- `candidate.certificates`: Professional credentials and issuances.
- `candidate.social_links`: Personal links mapping (e.g. GitHub, LinkedIn, portfolios).
- `candidate.candidate_skills`: Junction table linking candidates to standardized skills.

---

## 3. REST API Routes Reference

### 3.1. Profile Endpoints

#### GET `/api/candidate/profile`

- **Description**: Retrieves the complete candidate profile for the authenticated session, loading nested education, experience, projects, certificates, social links, and skills.
- **Auth Scope**: Candidate role owner.
- **Response Shape (`200 OK`)**:
  ```json
  {
    "data": {
      "id": "e1f77d3b-967a-42c2-8419-48e0259b360b",
      "user_id": "usr_01",
      "email": "candidate@smarthire.ai",
      "first_name": "Jane",
      "last_name": "Doe",
      "phone": "+15550199",
      "summary": "Full Stack developer specializing in React and Node.",
      "education": [],
      "experience": [],
      "projects": [],
      "certificates": [],
      "social_links": [],
      "candidate_skills": []
    }
  }
  ```

#### POST / PATCH `/api/candidate/profile`

- **Description**: Initializes or updates candidate profile details.
- **Payload (`application/json`)**:
  ```json
  {
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "candidate@smarthire.ai",
    "phone": "+15550199",
    "summary": "Updated resume summary details..."
  }
  ```

#### DELETE `/api/candidate/profile`

- **Description**: Soft deletes the candidate profile (sets `deleted_at = now()`).

---

### 3.2. Education Endpoints

#### POST `/api/candidate/education`

- **Description**: Appends an education record.
- **Payload (`application/json`)**:
  ```json
  {
    "institution": "University of San Francisco",
    "degree": "Bachelor of Science",
    "fieldOfStudy": "Computer Science",
    "startDate": "2022-09-01",
    "endDate": "2026-06-15",
    "isCurrent": false
  }
  ```

#### DELETE `/api/candidate/education/[id]`

- **Description**: Removes the specific education entry.

---

### 3.3. Experience Endpoints

#### POST `/api/candidate/experience`

- **Description**: Appends a professional experience record.
- **Payload (`application/json`)**:
  ```json
  {
    "companyName": "Tech Corp",
    "jobTitle": "Frontend Engineer",
    "description": "Led React App Router migrations...",
    "startDate": "2026-01-10",
    "isCurrent": true
  }
  ```

#### DELETE `/api/candidate/experience/[id]`

- **Description**: Removes the specific experience entry.

---

### 3.4. Projects & Portfolio Endpoints

#### POST `/api/candidate/projects`

- **Description**: Appends a portfolio project.
- **Payload (`application/json`)**:
  ```json
  {
    "title": "Smart Hire Monorepo",
    "description": "Production-grade microservices foundation",
    "url": "https://github.com/smarthire/monorepo",
    "startDate": "2026-07-01"
  }
  ```

#### DELETE `/api/candidate/projects/[id]`

- **Description**: Removes the specific project record.

---

### 3.5. Certificates Endpoints

#### POST `/api/candidate/certificates`

- **Description**: Appends a certificate issuance.
- **Payload (`application/json`)**:
  ```json
  {
    "name": "AWS Certified Solutions Architect",
    "issuer": "Amazon Web Services",
    "issueDate": "2026-05-12",
    "credentialId": "AWS-SA-129983"
  }
  ```

#### DELETE `/api/candidate/certificates/[id]`

- **Description**: Removes the specific certificate entry.

---

### 3.6. Social Links Endpoints

#### POST `/api/candidate/social-links`

- **Description**: Appends a social platform link.
- **Payload (`application/json`)**:
  ```json
  {
    "platform": "GitHub",
    "url": "https://github.com/janedoe"
  }
  ```

#### DELETE `/api/candidate/social-links/[id]`

- **Description**: Removes the specific social link.

---

### 3.7. Skills Mapping Endpoints

#### POST `/api/candidate/skills`

- **Description**: Connects a standardized skill to the candidate.
- **Payload (`application/json`)**:
  ```json
  {
    "skillId": "d1f77d3b-967a-42c2-8419-48e0259b360b",
    "yearsOfExperience": 4
  }
  ```

#### DELETE `/api/candidate/skills?skillId=[uuid]`

- **Description**: Removes the skill association mapping from the profile.
