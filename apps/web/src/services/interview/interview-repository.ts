import { createInterviewClient } from "@/utils/supabase/interview";
import { logger } from "@smarthire/logger";
import {
  Interview,
  AvailabilitySlot,
  Interviewer,
  Scorecard,
} from "./interfaces/interview.interface";

export const interviewRepository = {
  // ─── Interviews ───────────────────────────────────────────────────────────

  createInterview: async (
    companyId: string,
    data: Partial<Interview> & { referenceNumber: string }
  ): Promise<Interview> => {
    logger.info(`[InterviewRepository] createInterview for application: ${data.applicationId}`);
    const supabase = await createInterviewClient();

    const { data: dbData, error } = await supabase
      .from("interviews")
      .insert({
        application_id: data.applicationId,
        company_id: companyId,
        meeting_title: data.meetingTitle,
        reference_number: data.referenceNumber,
        type: data.type,
        round_number: data.roundNumber ?? 1,
        status: "scheduled",
        start_time: data.startTime,
        end_time: data.endTime,
        timezone: data.timezone,
        duration_minutes: data.durationMinutes,
        instructions: data.instructions,
        meeting_provider_type: data.meetingProviderType || "google_meet",
        meeting_link: data.meetingLink,
      })
      .select()
      .single();

    if (error) {
      logger.error("[InterviewRepository] createInterview failed", error);
      throw error;
    }

    return {
      id: dbData.id,
      applicationId: dbData.application_id,
      companyId: dbData.company_id,
      meetingTitle: dbData.meeting_title,
      referenceNumber: dbData.reference_number,
      type: dbData.type,
      roundNumber: dbData.round_number,
      status: dbData.status,
      startTime: dbData.start_time,
      endTime: dbData.end_time,
      timezone: dbData.timezone,
      durationMinutes: dbData.duration_minutes,
      instructions: dbData.instructions,
      meetingProviderType: dbData.meeting_provider_type,
      meetingLink: dbData.meeting_link,
      createdAt: dbData.created_at,
      updatedAt: dbData.updated_at,
    };
  },

  getInterviewById: async (id: string, includePanel = true): Promise<Interview | null> => {
    logger.info(`[InterviewRepository] getInterviewById: ${id}`);
    const supabase = await createInterviewClient();

    const { data: dbData, error } = await supabase
      .from("interviews")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      logger.error("[InterviewRepository] getInterviewById failed", error);
      throw error;
    }

    if (!dbData) return null;

    const interview: Interview = {
      id: dbData.id,
      applicationId: dbData.application_id,
      companyId: dbData.company_id,
      meetingTitle: dbData.meeting_title,
      referenceNumber: dbData.reference_number,
      type: dbData.type,
      roundNumber: dbData.round_number,
      status: dbData.status,
      startTime: dbData.start_time,
      endTime: dbData.end_time,
      timezone: dbData.timezone,
      durationMinutes: dbData.duration_minutes,
      instructions: dbData.instructions,
      meetingProviderType: dbData.meeting_provider_type,
      meetingLink: dbData.meeting_link,
      createdAt: dbData.created_at,
      updatedAt: dbData.updated_at,
    };

    if (includePanel) {
      const panel = await interviewRepository.listInterviewersForInterview(id);
      interview.interviewers = panel;
    }

    return interview;
  },

  updateInterview: async (id: string, data: Partial<Interview>): Promise<Interview> => {
    logger.info(`[InterviewRepository] updateInterview: ${id}`);
    const supabase = await createInterviewClient();

    const { data: dbData, error } = await supabase
      .from("interviews")
      .update({
        status: data.status,
        start_time: data.startTime,
        end_time: data.endTime,
        meeting_link: data.meetingLink,
        instructions: data.instructions,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      logger.error("[InterviewRepository] updateInterview failed", error);
      throw error;
    }

    return {
      id: dbData.id,
      applicationId: dbData.application_id,
      companyId: dbData.company_id,
      meetingTitle: dbData.meeting_title,
      referenceNumber: dbData.reference_number,
      type: dbData.type,
      roundNumber: dbData.round_number,
      status: dbData.status,
      startTime: dbData.start_time,
      endTime: dbData.end_time,
      timezone: dbData.timezone,
      durationMinutes: dbData.duration_minutes,
      instructions: dbData.instructions,
      meetingProviderType: dbData.meeting_provider_type,
      meetingLink: dbData.meeting_link,
      createdAt: dbData.created_at,
      updatedAt: dbData.updated_at,
    };
  },

  deleteInterview: async (id: string): Promise<void> => {
    logger.info(`[InterviewRepository] deleteInterview: ${id}`);
    const supabase = await createInterviewClient();

    const { error } = await supabase
      .from("interviews")
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      logger.error("[InterviewRepository] deleteInterview failed", error);
      throw error;
    }
  },

  listInterviews: async (companyId: string, candidateId?: string): Promise<Interview[]> => {
    logger.info(`[InterviewRepository] listInterviews`);
    const supabase = await createInterviewClient();

    const query = supabase
      .from("interviews")
      .select("*")
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .order("start_time", { ascending: true });

    if (candidateId) {
      // In a microservices architecture, we'd query applications filtered by candidateId
      // Because candidateId lives in application schema, let's query candidate applications first.
      // For repository level queries we can fetch list of applications matching candidateId, then feed here.
      // We will handle filtering in the service layer where we fetch from application client,
      // but let's allow optional application ids array as filter.
    }

    const { data, error } = await query;
    if (error) {
      logger.error("[InterviewRepository] listInterviews failed", error);
      throw error;
    }

    return (data ?? []).map((dbData) => ({
      id: dbData.id,
      applicationId: dbData.application_id,
      companyId: dbData.company_id,
      meetingTitle: dbData.meeting_title,
      referenceNumber: dbData.reference_number,
      type: dbData.type,
      roundNumber: dbData.round_number,
      status: dbData.status,
      startTime: dbData.start_time,
      endTime: dbData.end_time,
      timezone: dbData.timezone,
      durationMinutes: dbData.duration_minutes,
      instructions: dbData.instructions,
      meetingProviderType: dbData.meeting_provider_type,
      meetingLink: dbData.meeting_link,
      createdAt: dbData.created_at,
      updatedAt: dbData.updated_at,
    }));
  },

  checkCandidateOverlap: async (
    applicationId: string,
    startTime: string,
    endTime: string,
    excludeInterviewId?: string
  ): Promise<boolean> => {
    logger.info(`[InterviewRepository] checkCandidateOverlap for application: ${applicationId}`);
    const supabase = await createInterviewClient();

    let query = supabase
      .from("interviews")
      .select("id")
      .eq("application_id", applicationId)
      .is("deleted_at", null)
      .not("status", "in", '("cancelled","rejected")')
      .lt("start_time", endTime)
      .gt("end_time", startTime);

    if (excludeInterviewId) {
      query = query.neq("id", excludeInterviewId);
    }

    const { data, error } = await query;
    if (error) {
      logger.error("[InterviewRepository] checkCandidateOverlap failed", error);
      throw error;
    }

    return (data ?? []).length > 0;
  },

  checkRecruiterOverlap: async (
    recruiterIds: string[],
    startTime: string,
    endTime: string,
    excludeInterviewId?: string
  ): Promise<boolean> => {
    logger.info(`[InterviewRepository] checkRecruiterOverlap for recruiters: ${recruiterIds.join(",")}`);
    const supabase = await createInterviewClient();

    let query = supabase
      .from("interviewers")
      .select("interview_id, interviews!inner(start_time, end_time, status)")
      .in("recruiter_id", recruiterIds)
      .is("interviews.deleted_at", null)
      .not("interviews.status", "in", '("cancelled","rejected")')
      .lt("interviews.start_time", endTime)
      .gt("interviews.end_time", startTime);

    if (excludeInterviewId) {
      query = query.neq("interview_id", excludeInterviewId);
    }

    const { data, error } = await query;
    if (error) {
      logger.error("[InterviewRepository] checkRecruiterOverlap failed", error);
      throw error;
    }

    return (data ?? []).length > 0;
  },

  // ─── Availability Slots ───────────────────────────────────────────────────

  createAvailabilitySlot: async (
    companyId: string,
    recruiterId: string,
    startTime: string,
    endTime: string
  ): Promise<AvailabilitySlot> => {
    logger.info(`[InterviewRepository] createAvailabilitySlot for recruiter: ${recruiterId}`);
    const supabase = await createInterviewClient();

    const { data, error } = await supabase
      .from("availability_slots")
      .insert({
        company_id: companyId,
        recruiter_id: recruiterId,
        start_time: startTime,
        end_time: endTime,
        is_booked: false,
      })
      .select()
      .single();

    if (error) {
      logger.error("[InterviewRepository] createAvailabilitySlot failed", error);
      throw error;
    }

    return {
      id: data.id,
      recruiterId: data.recruiter_id,
      companyId: data.company_id,
      startTime: data.start_time,
      endTime: data.end_time,
      isBooked: data.is_booked,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  getAvailabilitySlotById: async (id: string): Promise<AvailabilitySlot | null> => {
    logger.info(`[InterviewRepository] getAvailabilitySlotById: ${id}`);
    const supabase = await createInterviewClient();

    const { data, error } = await supabase
      .from("availability_slots")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      logger.error("[InterviewRepository] getAvailabilitySlotById failed", error);
      throw error;
    }

    if (!data) return null;

    return {
      id: data.id,
      recruiterId: data.recruiter_id,
      companyId: data.company_id,
      startTime: data.start_time,
      endTime: data.end_time,
      isBooked: data.is_booked,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  getAvailabilitySlots: async (
    companyId: string,
    recruiterId?: string,
    isBooked?: boolean
  ): Promise<AvailabilitySlot[]> => {
    logger.info(`[InterviewRepository] getAvailabilitySlots`);
    const supabase = await createInterviewClient();

    let query = supabase
      .from("availability_slots")
      .select("*")
      .eq("company_id", companyId);

    if (recruiterId) {
      query = query.eq("recruiter_id", recruiterId);
    }
    if (isBooked !== undefined) {
      query = query.eq("is_booked", isBooked);
    }

    const { data, error } = await query.order("start_time", { ascending: true });
    if (error) {
      logger.error("[InterviewRepository] getAvailabilitySlots failed", error);
      throw error;
    }

    return (data ?? []).map((item) => ({
      id: item.id,
      recruiterId: item.recruiter_id,
      companyId: item.company_id,
      startTime: item.start_time,
      endTime: item.end_time,
      isBooked: item.is_booked,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  },

  updateAvailabilitySlotBooking: async (id: string, isBooked: boolean): Promise<void> => {
    logger.info(`[InterviewRepository] updateAvailabilitySlotBooking: ${id} to ${isBooked}`);
    const supabase = await createInterviewClient();

    const { error } = await supabase
      .from("availability_slots")
      .update({
        is_booked: isBooked,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      logger.error("[InterviewRepository] updateAvailabilitySlotBooking failed", error);
      throw error;
    }
  },

  deleteAvailabilitySlot: async (id: string): Promise<void> => {
    logger.info(`[InterviewRepository] deleteAvailabilitySlot: ${id}`);
    const supabase = await createInterviewClient();

    const { error } = await supabase
      .from("availability_slots")
      .delete()
      .eq("id", id);

    if (error) {
      logger.error("[InterviewRepository] deleteAvailabilitySlot failed", error);
      throw error;
    }
  },

  // ─── Panel Interviewers ───────────────────────────────────────────────────

  addInterviewers: async (interviewId: string, recruiterIds: string[]): Promise<Interviewer[]> => {
    logger.info(`[InterviewRepository] addInterviewers panel for: ${interviewId}`);
    const supabase = await createInterviewClient();

    const inserts = recruiterIds.map((rid) => ({
      interview_id: interviewId,
      recruiter_id: rid,
      role: "interviewer",
      status: "pending",
    }));

    const { data, error } = await supabase
      .from("interviewers")
      .insert(inserts)
      .select();

    if (error) {
      logger.error("[InterviewRepository] addInterviewers failed", error);
      throw error;
    }

    return (data ?? []).map((item) => ({
      id: item.id,
      interviewId: item.interview_id,
      recruiterId: item.recruiter_id,
      role: item.role,
      status: item.status,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  },

  listInterviewersForInterview: async (interviewId: string): Promise<Interviewer[]> => {
    const supabase = await createInterviewClient();

    const { data, error } = await supabase
      .from("interviewers")
      .select("*")
      .eq("interview_id", interviewId);

    if (error) {
      logger.error("[InterviewRepository] listInterviewersForInterview failed", error);
      throw error;
    }

    return (data ?? []).map((item) => ({
      id: item.id,
      interviewId: item.interview_id,
      recruiterId: item.recruiter_id,
      role: item.role,
      status: item.status,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  },

  updateInterviewerStatus: async (interviewId: string, recruiterId: string, status: string): Promise<void> => {
    const supabase = await createInterviewClient();

    const { error } = await supabase
      .from("interviewers")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("interview_id", interviewId)
      .eq("recruiter_id", recruiterId);

    if (error) {
      logger.error("[InterviewRepository] updateInterviewerStatus failed", error);
      throw error;
    }
  },

  // ─── Scorecards ───────────────────────────────────────────────────────────

  submitScorecard: async (data: Partial<Scorecard>): Promise<Scorecard> => {
    logger.info(`[InterviewRepository] submitScorecard for interview: ${data.interviewId}`);
    const supabase = await createInterviewClient();

    const { data: dbData, error } = await supabase
      .from("scorecards")
      .insert({
        interview_id: data.interviewId,
        interviewer_id: data.interviewerId,
        recruiter_id: data.recruiterId,
        technical_score: data.technicalScore,
        communication_score: data.communicationScore,
        problem_solving_score: data.problemSolvingScore,
        culture_fit_score: data.cultureFitScore,
        confidence_level: data.confidenceLevel,
        strengths: data.strengths,
        weaknesses: data.weaknesses,
        notes: data.notes,
        recommendation: data.recommendation,
      })
      .select()
      .single();

    if (error) {
      logger.error("[InterviewRepository] submitScorecard failed", error);
      throw error;
    }

    return {
      id: dbData.id,
      interviewId: dbData.interview_id,
      interviewerId: dbData.interviewer_id,
      recruiterId: dbData.recruiter_id,
      technicalScore: dbData.technical_score,
      communicationScore: dbData.communication_score,
      problemSolvingScore: dbData.problem_solving_score,
      cultureFitScore: dbData.culture_fit_score,
      confidenceLevel: dbData.confidence_level,
      strengths: dbData.strengths,
      weaknesses: dbData.weaknesses,
      notes: dbData.notes,
      recommendation: dbData.recommendation,
      createdAt: dbData.created_at,
      updatedAt: dbData.updated_at,
    };
  },

  getScorecardsForInterview: async (interviewId: string): Promise<Scorecard[]> => {
    const supabase = await createInterviewClient();

    const { data, error } = await supabase
      .from("scorecards")
      .select("*")
      .eq("interview_id", interviewId);

    if (error) {
      logger.error("[InterviewRepository] getScorecardsForInterview failed", error);
      throw error;
    }

    return (data ?? []).map((dbData) => ({
      id: dbData.id,
      interviewId: dbData.interview_id,
      interviewerId: dbData.interviewer_id,
      recruiterId: dbData.recruiter_id,
      technicalScore: dbData.technical_score,
      communicationScore: dbData.communication_score,
      problemSolvingScore: dbData.problem_solving_score,
      cultureFitScore: dbData.culture_fit_score,
      confidenceLevel: dbData.confidence_level,
      strengths: dbData.strengths,
      weaknesses: dbData.weaknesses,
      notes: dbData.notes,
      recommendation: dbData.recommendation,
      createdAt: dbData.created_at,
      updatedAt: dbData.updated_at,
    }));
  },

  // ─── Events ───────────────────────────────────────────────────────────────

  logInterviewEvent: async (interviewId: string, eventType: string, payload: Record<string, unknown>): Promise<void> => {
    logger.info(`[InterviewRepository] logInterviewEvent: ${eventType} for interview: ${interviewId}`);
    const supabase = await createInterviewClient();

    const { error } = await supabase
      .from("interview_events")
      .insert({
        interview_id: interviewId,
        event_type: eventType,
        payload,
      });

    if (error) {
      logger.warn("[InterviewRepository] logInterviewEvent failed (non-blocking)", error);
    }
  },
};
