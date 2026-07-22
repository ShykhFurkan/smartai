/* eslint-disable @typescript-eslint/no-explicit-any */
import test from "node:test";
import assert from "node:assert";
import { AssessmentService } from "../assessment-service";
import { assessmentRepository } from "../assessment-repository";
import { AssessmentTemplate, CandidateAttempt } from "../interfaces/assessment.interface";

// ─────────────────────────────────────────────────────────────────────────────
// Business Logic Mocks
// ─────────────────────────────────────────────────────────────────────────────

const mockTemplate: AssessmentTemplate = {
  id: "temp-001",
  companyId: "comp-123",
  title: "Engineering Quiz",
  durationMinutes: 30,
  status: "published",
  passingPercentage: 60,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  questions: [
    {
      id: "q-1",
      assessmentId: "temp-001",
      questionText: "What is 2+2?",
      questionType: "mcq",
      correctAnswer: "4",
      points: 10,
      options: [{ id: "opt-1", text: "3" }, { id: "opt-2", text: "4" }],
      difficulty: "easy",
      category: "aptitude",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "q-2",
      assessmentId: "temp-001",
      questionText: "Is TypeScript a typed superset of JS?",
      questionType: "true-false",
      correctAnswer: "true",
      points: 20,
      difficulty: "easy",
      category: "programming",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

const mockAttempt: CandidateAttempt = {
  id: "att-001",
  assessmentId: "temp-001",
  applicationId: "app-123",
  candidateId: "cand-123",
  answers: {},
  timeSpentSeconds: 0,
  status: "started",
  sectionScores: {},
  gradingResults: {},
  startedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Override repository methods for unit testing
assessmentRepository.getTemplateById = async (id: string) => {
  if (id === "temp-001") {
    return { ...mockTemplate };
  }
  return null;
};

assessmentRepository.createTemplate = async (companyId: string, createdBy: string, data: any) => {
  return {
    id: "temp-new",
    companyId,
    title: data.title,
    description: data.description,
    durationMinutes: data.durationMinutes ?? 60,
    status: "draft",
    passingPercentage: data.passingPercentage ?? 60,
    createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

assessmentRepository.syncQuestions = async (assessmentId: string, questions: any[]) => {
  return questions.map((q, i) => ({
    id: `q-new-${i}`,
    assessmentId,
    questionText: q.questionText,
    questionType: q.questionType,
    correctAnswer: q.correctAnswer,
    points: q.points,
    difficulty: q.difficulty ?? "medium",
    category: q.category ?? "custom",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
};

assessmentRepository.getAttemptById = async (id: string) => {
  if (id === "att-001") {
    return { ...mockAttempt };
  }
  return null;
};

assessmentRepository.completeAttempt = async (id, score, passed, status, sectionScores, gradingResults) => {
  return {
    ...mockAttempt,
    id,
    score,
    passed,
    status,
    sectionScores,
    gradingResults: gradingResults as any,
    completedAt: new Date().toISOString(),
  };
};

assessmentRepository.updateAssignmentAttempts = async () => {};

// ─────────────────────────────────────────────────────────────────────────────
// Test Cases
// ─────────────────────────────────────────────────────────────────────────────

test("Assessment Service — Template Duplication", async () => {
  const duplicate = await AssessmentService.duplicateTemplate("temp-001", "comp-123", "usr-admin");
  
  assert.strictEqual(duplicate.title, "Copy of Engineering Quiz");
  assert.strictEqual(duplicate.status, "draft");
  assert.strictEqual(duplicate.passingPercentage, 60);
  assert.strictEqual(duplicate.questions?.length, 2);
  assert.strictEqual(duplicate.questions?.[0].questionText, "What is 2+2?");
});

test("Assessment Service — Grading (Passing Attempt)", async () => {
  const result = await AssessmentService.submitAttempt("cand-123", "att-001", {
    answers: {
      "q-1": "4",
      "q-2": "true",
    },
    timeSpentSeconds: 150,
  });

  assert.strictEqual(result.status, "completed");
  assert.strictEqual(result.score, 100); // 100% correct
  assert.strictEqual(result.passed, true);
  assert.strictEqual(result.sectionScores.aptitude, 100);
  assert.strictEqual(result.sectionScores.programming, 100);
  assert.strictEqual(result.gradingResults["q-1"].correct, true);
  assert.strictEqual(result.gradingResults["q-2"].correct, true);
});

test("Assessment Service — Grading (Failing Attempt)", async () => {
  const result = await AssessmentService.submitAttempt("cand-123", "att-001", {
    answers: {
      "q-1": "3", // incorrect
      "q-2": "false", // incorrect
    },
    timeSpentSeconds: 120,
  });

  assert.strictEqual(result.status, "completed");
  assert.strictEqual(result.score, 0); // 0% correct
  assert.strictEqual(result.passed, false);
  assert.strictEqual(result.sectionScores.aptitude, 0);
  assert.strictEqual(result.sectionScores.programming, 0);
  assert.strictEqual(result.gradingResults["q-1"].correct, false);
  assert.strictEqual(result.gradingResults["q-2"].correct, false);
});

test("Assessment Service — Grading (Timeout Auto-submit)", async () => {
  const result = await AssessmentService.submitAttempt("cand-123", "att-001", {
    answers: {
      "q-1": "4",
    },
    timeSpentSeconds: 2000, // exceeds 30 minutes duration (1800 seconds)
  });

  assert.strictEqual(result.status, "timed-out");
  assert.strictEqual(result.passed, false); // failed passing threshold
});
