# AI Service — Architecture Documentation

This document describes the architecture, design decisions, interfaces, provider abstraction model, and REST API for the **AI Service** in Smart Hire.

---

## 1. Design Philosophy

The AI Service is built around the **Provider Abstraction Pattern**:

- The rest of the codebase depends **only on TypeScript interfaces** — never on a vendor SDK.
- Any LLM backend (OpenAI, Gemini, Anthropic, a fine-tuned model, etc.) can be swapped in at runtime **without touching downstream code**.
- A `NullAIProvider` stub runs by default in development and test, returning structurally valid but empty responses.

---

## 2. Module Structure

```
apps/web/src/services/ai/
├── index.ts                          ← Public barrel export
├── ai-service.ts                     ← Public facade (single entry point)
│
├── interfaces/                       ← Pure TypeScript contracts (no implementation)
│   ├── ai-provider.interface.ts      ← IAIProvider — master aggregating interface
│   ├── resume-parser.interface.ts    ← IResumeParser
│   ├── resume-scorer.interface.ts    ← IResumeScorer
│   ├── skill-extractor.interface.ts  ← ISkillExtractor
│   ├── candidate-ranker.interface.ts ← ICandidateRanker
│   ├── job-matcher.interface.ts      ← IJobMatcher
│   └── question-generator.interface.ts ← IQuestionGenerator
│
└── providers/
    ├── null-provider.ts              ← NullAIProvider (no-op stub)
    └── ai-provider-registry.ts       ← Singleton registry
```

---

## 3. Dependency Graph

```
Route Handlers
     │
     ▼
 AIService (facade)          ← consumers import only this
     │
     ▼
AIProviderRegistry           ← resolves the active provider at runtime
     │
     ▼
 IAIProvider (interface)     ← the contract every provider must satisfy
     │
     ├── IResumeParser
     ├── IResumeScorer
     ├── ISkillExtractor
     ├── ICandidateRanker
     ├── IJobMatcher
     └── IQuestionGenerator
```

---

## 4. Interfaces

### 4.1. `IAIProvider`

The master interface every concrete provider implements.

| Property / Method   | Type                        | Description                      |
| ------------------- | --------------------------- | -------------------------------- |
| `name`              | `string`                    | Human-readable provider name     |
| `version`           | `string`                    | Semantic version                 |
| `healthCheck()`     | `Promise<AIProviderStatus>` | Connectivity and readiness check |
| `resumeParser`      | `IResumeParser`             | Resume parsing capability        |
| `resumeScorer`      | `IResumeScorer`             | Resume scoring capability        |
| `skillExtractor`    | `ISkillExtractor`           | Skill extraction capability      |
| `candidateRanker`   | `ICandidateRanker`          | Candidate ranking capability     |
| `jobMatcher`        | `IJobMatcher`               | Job matching capability          |
| `questionGenerator` | `IQuestionGenerator`        | Question generation capability   |

---

### 4.2. `IResumeParser`

```typescript
interface IResumeParser {
  parse(input: ResumeParserInput): Promise<ParsedResume>;
}
```

**Input**: `{ content: string, mimeType: string, candidateId?: string }`

**Output** key fields:

- `fullName`, `email`, `phone`, `location`, `summary`
- `experience[]`, `education[]`, `skills[]`
- `certifications[]`, `languages[]`
- `confidence` (0–1 parse quality signal)

---

### 4.3. `IResumeScorer`

```typescript
interface IResumeScorer {
  score(input: ResumeScorerInput): Promise<ResumeScore>;
}
```

**Input**: resume content + job description + required/preferred skills + min experience years

**Output** key fields:

- `overallScore` (0–100)
- `breakdown`: `{ skills, experience, education, seniority }` (0–100 each)
- `matchedSkills[]`, `missingSkills[]`
- `strengths[]`, `gaps[]`, `recommendation`

---

### 4.4. `ISkillExtractor`

```typescript
interface ISkillExtractor {
  extract(input: SkillExtractorInput): Promise<ExtractedSkill[]>;
}
```

**Input**: `{ content: string, context?: "resume" | "job_description" | "freeform" }`

**Output per skill**:

- `label`, `category` (programming / framework / tool / soft / …)
- `proficiency` (beginner / intermediate / advanced / expert)
- `yearsOfExperience` (if detectable), `confidence`

---

### 4.5. `ICandidateRanker`

```typescript
interface ICandidateRanker {
  rank(input: CandidateRankerInput): Promise<CandidateRankingEntry[]>;
}
```

**Input**: job description + required skills + `CandidateProfile[]`

**Output per candidate**:

- `rank` (1-indexed position), `score` (0–100)
- `rationale`, `highlights[]`, `gaps[]`

---

### 4.6. `IJobMatcher`

```typescript
interface IJobMatcher {
  match(input: JobMatcherInput): Promise<JobMatch[]>;
}
```

**Input**: candidate skills + experience years + `JobPosting[]` + optional `topN`

**Output per job**:

- `matchScore` (0–100), `matchReasons[]`
- `alignedSkills[]`, `missingSkills[]`
- `meetsExperienceRequirement`

---

### 4.7. `IQuestionGenerator`

```typescript
interface IQuestionGenerator {
  generate(input: QuestionGeneratorInput): Promise<GeneratedQuestion[]>;
}
```

**Input**: job title + description + target skills + optional candidate resume + count + category/difficulty filters

**Output per question**:

- `text`, `category` (technical / behavioral / situational / …)
- `difficulty` (easy / medium / hard)
- `targetSkill`, `expectedAnswerGuidance`, `followUpProbes[]`

---

## 5. Provider Registry

The `AIProviderRegistry` is a singleton. It holds a reference to the active `IAIProvider` implementation.

```typescript
// Register a real provider at application startup (e.g. instrumentation.ts):
AIProviderRegistry.register(new OpenAIProvider());

// The AIService facade resolves the active provider transparently:
const result = await AIService.scoreResume(input);
```

**Default**: `NullAIProvider` — returns structurally valid but empty/zero-value responses with no external network calls.

---

## 6. Adding a New LLM Provider

To wire in a real LLM (e.g. OpenAI):

1. Create `apps/web/src/services/ai/providers/openai-provider.ts`.
2. Implement the `IAIProvider` interface (all 6 sub-interfaces + `healthCheck`).
3. In `apps/web/src/instrumentation.ts`, call:
   ```typescript
   AIProviderRegistry.register(new OpenAIProvider());
   ```

**No other file changes are required.**

---

## 7. REST API Reference

All endpoints are under `/api/ai/`.

| Method | Endpoint                     | Description                                 |
| ------ | ---------------------------- | ------------------------------------------- |
| `GET`  | `/api/ai/health`             | Active provider health check                |
| `POST` | `/api/ai/parse-resume`       | Parse resume into structured fields         |
| `POST` | `/api/ai/score-resume`       | Score resume against a job description      |
| `POST` | `/api/ai/extract-skills`     | Extract skills from free-form text          |
| `POST` | `/api/ai/rank-candidates`    | Rank a candidate pool for a job             |
| `POST` | `/api/ai/match-jobs`         | Match a candidate to a list of job postings |
| `POST` | `/api/ai/generate-questions` | Generate interview/assessment questions     |

### 7.1. `GET /api/ai/health`

**Response `200`**:

```json
{
  "data": {
    "isHealthy": true,
    "message": "NullAIProvider is operational (no-op stub — no external calls are made).",
    "checkedAt": "2026-07-11T12:00:00.000Z",
    "providerName": "NullAIProvider",
    "providerVersion": "0.0.0"
  }
}
```

### 7.2. `POST /api/ai/parse-resume`

**Request body**:

```json
{
  "content": "<raw resume text>",
  "mimeType": "application/pdf",
  "candidateId": "cand_uuid"
}
```

### 7.3. `POST /api/ai/score-resume`

**Request body**:

```json
{
  "resumeContent": "<raw resume text>",
  "jobDescription": "<full job description>",
  "requiredSkills": ["TypeScript", "React", "Node.js"],
  "preferredSkills": ["GraphQL"],
  "minExperienceYears": 3
}
```

### 7.4. `POST /api/ai/extract-skills`

**Request body**:

```json
{
  "content": "<text>",
  "context": "resume"
}
```

### 7.5. `POST /api/ai/rank-candidates`

**Request body**:

```json
{
  "jobDescription": "<full job description>",
  "requiredSkills": ["Python", "Machine Learning"],
  "minExperienceYears": 2,
  "candidates": [
    {
      "candidateId": "cand_uuid_1",
      "skills": ["Python", "TensorFlow"],
      "totalExperienceYears": 4,
      "educationLevel": "master",
      "resumeContent": "..."
    }
  ]
}
```

### 7.6. `POST /api/ai/match-jobs`

**Request body**:

```json
{
  "candidateSkills": ["React", "TypeScript"],
  "candidateExperienceYears": 3,
  "jobs": [
    {
      "jobId": "job_uuid",
      "title": "Senior Frontend Engineer",
      "description": "...",
      "requiredSkills": ["React", "TypeScript", "CSS"],
      "minExperienceYears": 2
    }
  ],
  "topN": 5
}
```

### 7.7. `POST /api/ai/generate-questions`

**Request body**:

```json
{
  "jobTitle": "Backend Engineer",
  "jobDescription": "...",
  "targetSkills": ["Node.js", "PostgreSQL"],
  "count": 10,
  "categories": ["technical", "behavioral"],
  "difficulty": "medium"
}
```

---

## 8. Future Provider Roadmap

| Provider                 | Capabilities                          | Status         |
| ------------------------ | ------------------------------------- | -------------- |
| `NullAIProvider`         | All (no-op stubs)                     | ✅ Implemented |
| `OpenAIProvider`         | All 6 capabilities via GPT-4o         | 🔲 Planned     |
| `GeminiProvider`         | All 6 capabilities via Gemini 1.5 Pro | 🔲 Planned     |
| `AnthropicProvider`      | All 6 capabilities via Claude         | 🔲 Planned     |
| `CustomFinetuneProvider` | Resume scoring + skill extraction     | 🔲 Planned     |
