# Assessment Service

The **Assessment Service** handles logic challenges, coding exercises, and skill tests assigned to candidates in the Smart Hire application. It supports auto-grading of objective questions, stores candidate responses for review, and handles time limit timeouts and attempts restrictions.

---

## 1. Directory Structure

The service is fully integrated into the Web app and shared workspaces:
*   **Database Schema Migration**: [supabase/migrations/20260712081212_assessment_expansion.sql](file:///c:/Users/Furkan/Desktop/smart%20hire/supabase/migrations/20260712081212_assessment_expansion.sql)
*   **Schema client**: [apps/web/src/utils/supabase/assessment.ts](file:///c:/Users/Furkan/Desktop/smart%20hire/apps/web/src/utils/supabase/assessment.ts)
*   **Service & Repository**: `apps/web/src/services/assessment/`
    *   [assessment-service.ts](file:///c:/Users/Furkan/Desktop/smart%20hire/apps/web/src/services/assessment/assessment-service.ts) (Business logic, grading, timeout validation)
    *   [assessment-repository.ts](file:///c:/Users/Furkan/Desktop/smart%20hire/apps/web/src/services/assessment/assessment-repository.ts) (CRUD commands, updates)
    *   [assessment-schemas.ts](file:///c:/Users/Furkan/Desktop/smart%20hire/apps/web/src/services/assessment/assessment-schemas.ts) (Zod validations)
    *   [interfaces/assessment.interface.ts](file:///c:/Users/Furkan/Desktop/smart%20hire/apps/web/src/services/assessment/interfaces/assessment.interface.ts) (TypeScript interfaces)
*   **REST API Handlers**: `apps/web/src/app/api/v1/assessment/`

---

## 2. API Reference

All routes are versioned and require an authenticated user.

### 2.1. Assessment Templates

*   **`POST /api/v1/assessment/templates`** (Create Template)
    *   *Body*:
        ```json
        {
          "title": "React Senior Developer Quiz",
          "description": "Optional details",
          "durationMinutes": 45,
          "passingPercentage": 70,
          "questions": [
            {
              "questionText": "Which hook handles side effects?",
              "questionType": "mcq",
              "correctAnswer": "useEffect",
              "points": 10,
              "options": [
                {"id": "c1f71a9e-f00e-4fa0-bd74-32b57577a760", "text": "useState"},
                {"id": "d1e71a9e-f00e-4fa0-bd74-32b57577a761", "text": "useEffect"}
              ],
              "difficulty": "medium",
              "category": "programming",
              "section": "React Hooks"
            }
          ]
        }
        ```
*   **`GET /api/v1/assessment/templates`** (List all templates)
*   **`GET /api/v1/assessment/templates/:id`** (Fetch specific template)
*   **`PUT /api/v1/assessment/templates/:id`** (Update draft template details)
*   **`DELETE /api/v1/assessment/templates/:id`** (Archive template)
*   **`POST /api/v1/assessment/templates/:id/duplicate`** (Duplicate template as draft)
*   **`POST /api/v1/assessment/templates/:id/publish`** (Publish template)

### 2.2. Assignments

*   **`POST /api/v1/assessment/assignments`** (Assign assessment to candidate)
    *   *Body*:
        ```json
        {
          "assessmentId": "uuid-here",
          "candidateId": "uuid-here",
          "applicationId": "uuid-here",
          "expiresAt": "2026-07-20T12:00:00.000Z",
          "attemptLimit": 1
        }
        ```

### 2.3. Attempts (Candidate Workflow)

*   **`POST /api/v1/assessment/attempts`** (Start an attempt)
    *   *Body*:
        ```json
        {
          "assignmentId": "uuid-here"
        }
        ```
*   **`PATCH /api/v1/assessment/attempts/:id/save`** (Save answers progress)
    *   *Body*:
        ```json
        {
          "answers": {
            "q-1": "useEffect"
          },
          "timeSpentSeconds": 120
        }
        ```
*   **`POST /api/v1/assessment/attempts/:id/submit`** (Submit and grade attempt)
    *   *Body*:
        ```json
        {
          "answers": {
            "q-1": "useEffect"
          },
          "timeSpentSeconds": 150
        }
        ```
*   **`GET /api/v1/assessment/attempts/:id`** (Fetch grading score and results details)

---

## 3. Grading Engine Rules

Objective question types are evaluated automatically upon submission:
1.  **MCQ & True/False**: Evaluates candidate selection against `correctAnswer` (case-insensitive).
2.  **Multiple Select**: Compares all items in candidate selection array against expected list (in `correctAnswer`).
3.  **Short Answer**: Standard case-insensitive exact string match.
4.  **Coding / File Upload**: Automatically stores input for future manual code-evaluation or testing pipelines (defaults to 0 points until manually reviewed).

If the total percentage score equals or exceeds the assessment template's `passingPercentage`, the attempt status updates to `completed` and `passed` marks as `true`.
Attempts exceeding the duration limit (plus 30s grace period) are marked as `timed-out` and graded on whatever questions were saved in progress.
