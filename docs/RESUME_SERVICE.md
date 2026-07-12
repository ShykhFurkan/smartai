# Resume Service Documentation

This document describes the REST API endpoints, storage structures, upload validations, and metadata mappings for the **Resume Service** in Smart Hire.

---

## 1. Supabase Storage Bucket Organization

The Resume Service uploads files to a **private** bucket in Supabase Storage named `resumes`.

- **Access Level**: Private. Signed URLs must be generated to view or download files.
- **Key Hierarchy Path**:
  `resumes/{candidate_id}/v{version_number}/{sanitized_filename}`
  - Example: `resumes/e1f77d3b-967a-42c2-8419-48e0259b360b/v1/cv_janedoe.pdf`

---

## 2. File and Size Validations

Every uploaded file is intercepted and checked before storage:

- **Allowed MIME Types**:
  - `application/pdf` (`.pdf`)
  - `application/msword` (`.doc`)
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (`.docx`)
- **Maximum File Size Limit**: `5MB` (5,242,880 bytes).
- **Security Check (Virus Scan Placeholder)**: Each upload triggers a security verification process. If a virus check fails, storage upload is immediately aborted.

---

## 3. REST API Routes Reference

### 3.1. Upload and List Resumes

#### GET `/api/candidate/resumes`

- **Description**: Returns all resume versions uploaded by the candidate, ordered by version descending.
- **Auth Scope**: Candidate role owner.
- **Response Shape (`200 OK`)**:
  ```json
  {
    "data": [
      {
        "id": "a9b8c7d6-e5f4-3a2b-1c0d-9e8f7a6b5c4d",
        "candidate_id": "e1f77d3b-967a-42c2-8419-48e0259b360b",
        "s3_key": "e1f77d3b-967a-42c2-8419-48e0259b360b/v2/new_cv.pdf",
        "file_name": "new_cv.pdf",
        "file_size": 182490,
        "mime_type": "application/pdf",
        "version": 2,
        "created_at": "2026-07-11T12:00:00.000Z",
        "updated_at": "2026-07-11T12:00:00.000Z",
        "deleted_at": null
      },
      {
        "id": "01234567-89ab-cdef-0123-456789abcdef",
        "candidate_id": "e1f77d3b-967a-42c2-8419-48e0259b360b",
        "s3_key": "e1f77d3b-967a-42c2-8419-48e0259b360b/v1/old_cv.pdf",
        "file_name": "old_cv.pdf",
        "file_size": 178220,
        "mime_type": "application/pdf",
        "version": 1,
        "created_at": "2026-07-10T10:00:00.000Z",
        "updated_at": "2026-07-10T10:00:00.000Z",
        "deleted_at": null
      }
    ]
  }
  ```

#### POST `/api/candidate/resumes`

- **Description**: Uploads a new resume file. Increments the resume version automatically.
- **Request Format**: `multipart/form-data`
- **Fields**:
  - `file`: The resume file binary.
- **Response Shape (`210 Created`)**:
  ```json
  {
    "data": {
      "id": "a9b8c7d6-e5f4-3a2b-1c0d-9e8f7a6b5c4d",
      "candidate_id": "e1f77d3b-967a-42c2-8419-48e0259b360b",
      "s3_key": "e1f77d3b-967a-42c2-8419-48e0259b360b/v2/new_cv.pdf",
      "file_name": "new_cv.pdf",
      "file_size": 182490,
      "mime_type": "application/pdf",
      "version": 2
    }
  }
  ```

---

### 3.2. Retrieve and Delete Resumes

#### GET `/api/candidate/resumes/[id]/download`

- **Description**: Generates a secure, temporary signed download link valid for **15 minutes** (900 seconds).
- **Response Shape (`200 OK`)**:
  ```json
  {
    "data": {
      "signedUrl": "https://placeholder.supabase.co/storage/v1/object/sign/resumes/e1f77d3b-967a-42c2-8419-48e0259b360b/v2/new_cv.pdf?token=...",
      "fileName": "new_cv.pdf",
      "mimeType": "application/pdf"
    }
  }
  ```

#### DELETE `/api/candidate/resumes/[id]`

- **Description**: Soft deletes the resume version metadata (sets `deleted_at = now()`).
- **Response Shape (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Resume version removed successfully"
  }
  ```
