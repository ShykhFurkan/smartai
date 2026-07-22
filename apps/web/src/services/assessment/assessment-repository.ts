import { createAssessmentClient } from "@/utils/supabase/assessment";
import { logger } from "@smarthire/logger";
import {
  AssessmentTemplate,
  Question,
  AssessmentAssignment,
  CandidateAttempt,
} from "./interfaces/assessment.interface";

export const assessmentRepository = {
  // ─── Assessment Templates ─────────────────────────────────────────────────

  createTemplate: async (
    companyId: string,
    createdBy: string,
    data: Partial<AssessmentTemplate>
  ): Promise<AssessmentTemplate> => {
    logger.info(`[AssessmentRepository] createTemplate for company: ${companyId}`);
    const supabase = await createAssessmentClient();

    const { data: template, error } = await supabase
      .from("assessments")
      .insert({
        company_id: companyId,
        title: data.title,
        description: data.description,
        duration_minutes: data.durationMinutes,
        passing_percentage: data.passingPercentage,
        created_by: createdBy,
        status: "draft",
      })
      .select()
      .single();

    if (error) {
      logger.error("[AssessmentRepository] createTemplate failed", error);
      throw error;
    }

    return {
      id: template.id,
      companyId: template.company_id,
      title: template.title,
      description: template.description,
      durationMinutes: template.duration_minutes,
      status: template.status,
      passingPercentage: template.passing_percentage,
      createdBy: template.created_by,
      createdAt: template.created_at,
      updatedAt: template.updated_at,
    };
  },

  getTemplateById: async (
    id: string,
    includeQuestions = true,
    allowDeleted = false
  ): Promise<AssessmentTemplate | null> => {
    logger.info(`[AssessmentRepository] getTemplateById: ${id}`);
    const supabase = await createAssessmentClient();

    let query = supabase
      .from("assessments")
      .select("*")
      .eq("id", id);

    if (!allowDeleted) {
      query = query.is("deleted_at", null);
    }

    const { data: template, error } = await query.maybeSingle();

    if (error) {
      logger.error("[AssessmentRepository] getTemplateById failed", error);
      throw error;
    }

    if (!template) return null;

    let questions: Question[] = [];
    if (includeQuestions) {
      const { data: qData, error: qError } = await supabase
        .from("questions")
        .select("*")
        .eq("assessment_id", id)
        .order("created_at", { ascending: true });

      if (qError) {
        logger.error("[AssessmentRepository] getTemplateById questions query failed", qError);
        throw qError;
      }
      questions = (qData ?? []).map((q) => ({
        id: q.id,
        assessmentId: q.assessment_id,
        questionText: q.question_text,
        questionType: q.question_type,
        correctAnswer: q.correct_answer,
        points: q.points,
        options: q.options,
        difficulty: q.difficulty,
        category: q.category,
        section: q.section,
        createdAt: q.created_at,
        updatedAt: q.updated_at,
      }));
    }

    return {
      id: template.id,
      companyId: template.company_id,
      title: template.title,
      description: template.description,
      durationMinutes: template.duration_minutes,
      status: template.status,
      passingPercentage: template.passing_percentage,
      createdBy: template.created_by,
      createdAt: template.created_at,
      updatedAt: template.updated_at,
      questions,
    };
  },

  updateTemplate: async (id: string, data: Partial<AssessmentTemplate>): Promise<AssessmentTemplate> => {
    logger.info(`[AssessmentRepository] updateTemplate: ${id}`);
    const supabase = await createAssessmentClient();

    const { data: template, error } = await supabase
      .from("assessments")
      .update({
        title: data.title,
        description: data.description,
        duration_minutes: data.durationMinutes,
        passing_percentage: data.passingPercentage,
        status: data.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      logger.error("[AssessmentRepository] updateTemplate failed", error);
      throw error;
    }

    return {
      id: template.id,
      companyId: template.company_id,
      title: template.title,
      description: template.description,
      durationMinutes: template.duration_minutes,
      status: template.status,
      passingPercentage: template.passing_percentage,
      createdBy: template.created_by,
      createdAt: template.created_at,
      updatedAt: template.updated_at,
    };
  },

  archiveTemplate: async (id: string): Promise<void> => {
    logger.info(`[AssessmentRepository] archiveTemplate: ${id}`);
    const supabase = await createAssessmentClient();

    const { error } = await supabase
      .from("assessments")
      .update({
        status: "archived",
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      logger.error("[AssessmentRepository] archiveTemplate failed", error);
      throw error;
    }
  },

  listTemplates: async (companyId: string): Promise<AssessmentTemplate[]> => {
    logger.info(`[AssessmentRepository] listTemplates for company: ${companyId}`);
    const supabase = await createAssessmentClient();

    const { data, error } = await supabase
      .from("assessments")
      .select("*")
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("[AssessmentRepository] listTemplates failed", error);
      throw error;
    }

    return (data ?? []).map((template) => ({
      id: template.id,
      companyId: template.company_id,
      title: template.title,
      description: template.description,
      durationMinutes: template.duration_minutes,
      status: template.status,
      passingPercentage: template.passing_percentage,
      createdBy: template.created_by,
      createdAt: template.created_at,
      updatedAt: template.updated_at,
    }));
  },

  // ─── Questions ────────────────────────────────────────────────────────────

  syncQuestions: async (assessmentId: string, questions: Partial<Question>[]): Promise<Question[]> => {
    logger.info(`[AssessmentRepository] syncQuestions for assessment: ${assessmentId}`);
    const supabase = await createAssessmentClient();

    // Delete questions not in the incoming list (those with IDs)
    const incomingIds = questions.filter((q) => q.id).map((q) => q.id as string);
    if (incomingIds.length > 0) {
      const { error: delError } = await supabase
        .from("questions")
        .delete()
        .eq("assessment_id", assessmentId)
        .not("id", "in", `(${incomingIds.join(",")})`);
      if (delError) {
        logger.error("[AssessmentRepository] syncQuestions delete failed", delError);
        throw delError;
      }
    } else {
      // If no incoming question IDs exist, delete all questions first
      const { error: delAllError } = await supabase
        .from("questions")
        .delete()
        .eq("assessment_id", assessmentId);
      if (delAllError) {
        logger.error("[AssessmentRepository] syncQuestions delete all failed", delAllError);
        throw delAllError;
      }
    }

    // Insert or update incoming questions
    const results: Question[] = [];
    for (const q of questions) {
      let query;
      if (q.id) {
        query = supabase
          .from("questions")
          .update({
            question_text: q.questionText,
            question_type: q.questionType,
            correct_answer: q.correctAnswer,
            points: q.points,
            options: q.options,
            difficulty: q.difficulty,
            category: q.category,
            section: q.section,
            updated_at: new Date().toISOString(),
          })
          .eq("id", q.id)
          .select()
          .single();
      } else {
        query = supabase
          .from("questions")
          .insert({
            assessment_id: assessmentId,
            question_text: q.questionText,
            question_type: q.questionType,
            correct_answer: q.correctAnswer,
            points: q.points,
            options: q.options,
            difficulty: q.difficulty,
            category: q.category,
            section: q.section,
          })
          .select()
          .single();
      }

      const { data: dbQ, error: qError } = await query;
      if (qError) {
        logger.error("[AssessmentRepository] syncQuestions upsert failed", qError);
        throw qError;
      }

      results.push({
        id: dbQ.id,
        assessmentId: dbQ.assessment_id,
        questionText: dbQ.question_text,
        questionType: dbQ.question_type,
        correctAnswer: dbQ.correct_answer,
        points: dbQ.points,
        options: dbQ.options,
        difficulty: dbQ.difficulty,
        category: dbQ.category,
        section: dbQ.section,
        createdAt: dbQ.created_at,
        updatedAt: dbQ.updated_at,
      });
    }

    return results;
  },

  // ─── Assignments ──────────────────────────────────────────────────────────

  createAssignment: async (
    companyId: string,
    data: Partial<AssessmentAssignment>
  ): Promise<AssessmentAssignment> => {
    logger.info(`[AssessmentRepository] createAssignment for candidate: ${data.candidateId}`);
    const supabase = await createAssessmentClient();

    const { data: assignment, error } = await supabase
      .from("assignments")
      .insert({
        assessment_id: data.assessmentId,
        company_id: companyId,
        application_id: data.applicationId,
        candidate_id: data.candidateId,
        expires_at: data.expiresAt,
        attempt_limit: data.attemptLimit ?? 1,
        attempts_count: 0,
        status: "assigned",
      })
      .select()
      .single();

    if (error) {
      logger.error("[AssessmentRepository] createAssignment failed", error);
      throw error;
    }

    return {
      id: assignment.id,
      assessmentId: assignment.assessment_id,
      companyId: assignment.company_id,
      applicationId: assignment.application_id,
      candidateId: assignment.candidate_id,
      expiresAt: assignment.expires_at,
      attemptLimit: assignment.attempt_limit,
      attemptsCount: assignment.attempts_count,
      status: assignment.status,
      createdAt: assignment.created_at,
      updatedAt: assignment.updated_at,
    };
  },

  getAssignmentById: async (id: string): Promise<AssessmentAssignment | null> => {
    logger.info(`[AssessmentRepository] getAssignmentById: ${id}`);
    const supabase = await createAssessmentClient();

    const { data, error } = await supabase
      .from("assignments")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      logger.error("[AssessmentRepository] getAssignmentById failed", error);
      throw error;
    }

    if (!data) return null;

    return {
      id: data.id,
      assessmentId: data.assessment_id,
      companyId: data.company_id,
      applicationId: data.application_id,
      candidateId: data.candidate_id,
      expiresAt: data.expires_at,
      attemptLimit: data.attempt_limit,
      attemptsCount: data.attempts_count,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  updateAssignmentAttempts: async (id: string, count: number, status: string): Promise<void> => {
    logger.info(`[AssessmentRepository] updateAssignmentAttempts: ${id} count: ${count}`);
    const supabase = await createAssessmentClient();

    const { error } = await supabase
      .from("assignments")
      .update({
        attempts_count: count,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      logger.error("[AssessmentRepository] updateAssignmentAttempts failed", error);
      throw error;
    }
  },

  // ─── Attempts ─────────────────────────────────────────────────────────────

  createAttempt: async (
    assessmentId: string,
    assignmentId: string,
    candidateId: string,
    applicationId: string
  ): Promise<CandidateAttempt> => {
    logger.info(`[AssessmentRepository] createAttempt for assignment: ${assignmentId}`);
    const supabase = await createAssessmentClient();

    const { data, error } = await supabase
      .from("attempts")
      .insert({
        assessment_id: assessmentId,
        assignment_id: assignmentId,
        candidate_id: candidateId,
        application_id: applicationId,
        status: "started",
        answers: {},
        time_spent_seconds: 0,
        section_scores: {},
        grading_results: {},
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error("[AssessmentRepository] createAttempt failed", error);
      throw error;
    }

    return {
      id: data.id,
      assessmentId: data.assessment_id,
      assignmentId: data.assignment_id,
      applicationId: data.application_id,
      candidateId: data.candidate_id,
      score: data.score,
      passed: data.passed,
      answers: data.answers,
      timeSpentSeconds: data.time_spent_seconds,
      status: data.status,
      sectionScores: data.section_scores,
      gradingResults: data.grading_results,
      startedAt: data.started_at,
      completedAt: data.completed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  getAttemptById: async (id: string): Promise<CandidateAttempt | null> => {
    logger.info(`[AssessmentRepository] getAttemptById: ${id}`);
    const supabase = await createAssessmentClient();

    const { data, error } = await supabase
      .from("attempts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      logger.error("[AssessmentRepository] getAttemptById failed", error);
      throw error;
    }

    if (!data) return null;

    return {
      id: data.id,
      assessmentId: data.assessment_id,
      assignmentId: data.assignment_id,
      applicationId: data.application_id,
      candidateId: data.candidate_id,
      score: data.score,
      passed: data.passed,
      answers: data.answers,
      timeSpentSeconds: data.time_spent_seconds,
      status: data.status,
      sectionScores: data.section_scores,
      gradingResults: data.grading_results,
      startedAt: data.started_at,
      completedAt: data.completed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  updateAttemptProgress: async (
    id: string,
    answers: Record<string, string | string[]>,
    timeSpentSeconds: number
  ): Promise<CandidateAttempt> => {
    logger.info(`[AssessmentRepository] updateAttemptProgress: ${id}`);
    const supabase = await createAssessmentClient();

    const { data, error } = await supabase
      .from("attempts")
      .update({
        answers,
        time_spent_seconds: timeSpentSeconds,
        status: "in-progress",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      logger.error("[AssessmentRepository] updateAttemptProgress failed", error);
      throw error;
    }

    return {
      id: data.id,
      assessmentId: data.assessment_id,
      assignmentId: data.assignment_id,
      applicationId: data.application_id,
      candidateId: data.candidate_id,
      score: data.score,
      passed: data.passed,
      answers: data.answers,
      timeSpentSeconds: data.time_spent_seconds,
      status: data.status,
      sectionScores: data.section_scores,
      gradingResults: data.grading_results,
      startedAt: data.started_at,
      completedAt: data.completed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  completeAttempt: async (
    id: string,
    score: number,
    passed: boolean,
    status: "completed" | "timed-out",
    sectionScores: Record<string, number>,
    gradingResults: Record<string, unknown>
  ): Promise<CandidateAttempt> => {
    logger.info(`[AssessmentRepository] completeAttempt: ${id} score: ${score} passed: ${passed}`);
    const supabase = await createAssessmentClient();

    const { data, error } = await supabase
      .from("attempts")
      .update({
        score,
        passed,
        status,
        section_scores: sectionScores,
        grading_results: gradingResults,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      logger.error("[AssessmentRepository] completeAttempt failed", error);
      throw error;
    }

    const row = data || {
      id,
      assessment_id: "",
      assignment_id: "",
      application_id: "",
      candidate_id: "",
      score,
      passed,
      answers: {},
      time_spent_seconds: 0,
      status,
      section_scores: sectionScores,
      grading_results: gradingResults,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return {
      id: row.id,
      assessmentId: row.assessment_id,
      assignmentId: row.assignment_id,
      applicationId: row.application_id,
      candidateId: row.candidate_id,
      score: row.score,
      passed: row.passed,
      answers: row.answers,
      timeSpentSeconds: row.time_spent_seconds,
      status: row.status,
      sectionScores: row.section_scores,
      gradingResults: row.grading_results,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },
};
