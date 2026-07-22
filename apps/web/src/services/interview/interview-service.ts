import { interviewRepository } from "./interview-repository";
import {
  scheduleInterviewSchema,
  rescheduleInterviewSchema,
  recruiterAvailabilitySchema,
  bookSlotSchema,
  scorecardSchema,
} from "./interview-schemas";
import {
  Interview,
  AvailabilitySlot,
  Scorecard,
} from "./interfaces/interview.interface";
import { meetingProviderFactory } from "./providers/meeting-provider-factory";
import { logger } from "@smarthire/logger";

export const InterviewService = {
  // ─── Scheduling ───────────────────────────────────────────────────────────

  scheduleInterview: async (companyId: string, rawInput: unknown): Promise<Interview> => {
    logger.info("[InterviewService] scheduleInterview");
    const input = scheduleInterviewSchema.parse(rawInput);

    // 1. Overlap Checks (Candidate and Recruiters)
    const hasCandidateOverlap = await interviewRepository.checkCandidateOverlap(
      input.applicationId,
      input.startTime,
      input.endTime
    );
    if (hasCandidateOverlap) {
      throw new Error("Candidate already has another interview scheduled at this time");
    }

    const hasRecruiterOverlap = await interviewRepository.checkRecruiterOverlap(
      input.interviewers,
      input.startTime,
      input.endTime
    );
    if (hasRecruiterOverlap) {
      throw new Error("One or more selected interviewers are busy at this time");
    }

    // 2. Resolve Meeting Link via Mock Provider
    const provider = meetingProviderFactory.getMeetingProvider(input.meetingProviderType);
    const meetingLink = await provider.generateMeetingLink(
      input.meetingTitle,
      input.startTime,
      input.durationMinutes
    );

    // 3. Generate Reference Number
    const referenceNumber = `INT-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 4. Save Interview
    const interview = await interviewRepository.createInterview(companyId, {
      applicationId: input.applicationId,
      meetingTitle: input.meetingTitle,
      referenceNumber,
      type: input.type,
      roundNumber: input.roundNumber,
      startTime: input.startTime,
      endTime: input.endTime,
      timezone: input.timezone,
      durationMinutes: input.durationMinutes,
      instructions: input.instructions,
      meetingProviderType: input.meetingProviderType,
      meetingLink,
    });

    // 5. Add Interviewers Panel
    const panel = await interviewRepository.addInterviewers(interview.id, input.interviewers);
    interview.interviewers = panel;

    // 6. Audit Logging & Events
    await interviewRepository.logInterviewEvent(interview.id, "InterviewScheduled", {
      scheduled_by: input.interviewers[0],
      recruiter_count: input.interviewers.length,
    });

    return interview;
  },

  rescheduleInterview: async (
    interviewId: string,
    rawInput: unknown
  ): Promise<Interview> => {
    logger.info(`[InterviewService] rescheduleInterview: ${interviewId}`);
    const input = rescheduleInterviewSchema.parse(rawInput);

    const existing = await interviewRepository.getInterviewById(interviewId, true);
    if (!existing) {
      throw new Error("Interview not found");
    }

    if (existing.status === "cancelled" || existing.status === "completed") {
      throw new Error(`Cannot reschedule an interview that is already ${existing.status}`);
    }

    // Overlap checks
    const hasCandidateOverlap = await interviewRepository.checkCandidateOverlap(
      existing.applicationId,
      input.startTime,
      input.endTime,
      interviewId
    );
    if (hasCandidateOverlap) {
      throw new Error("Candidate already has another interview scheduled at this time");
    }

    if (existing.interviewers && existing.interviewers.length > 0) {
      const recruiterIds = existing.interviewers.map((i) => i.recruiterId);
      const hasRecruiterOverlap = await interviewRepository.checkRecruiterOverlap(
        recruiterIds,
        input.startTime,
        input.endTime,
        interviewId
      );
      if (hasRecruiterOverlap) {
        throw new Error("One or more panel interviewers are busy at this time");
      }
    }

    const updated = await interviewRepository.updateInterview(interviewId, {
      startTime: input.startTime,
      endTime: input.endTime,
      status: "rescheduled",
    });

    await interviewRepository.logInterviewEvent(interviewId, "InterviewRescheduled", {
      old_start: existing.startTime,
      new_start: input.startTime,
    });

    return updated;
  },

  cancelInterview: async (interviewId: string, reason: string): Promise<Interview> => {
    logger.info(`[InterviewService] cancelInterview: ${interviewId}`);

    const existing = await interviewRepository.getInterviewById(interviewId, false);
    if (!existing) {
      throw new Error("Interview not found");
    }

    const updated = await interviewRepository.updateInterview(interviewId, {
      status: "cancelled",
    });

    await interviewRepository.logInterviewEvent(interviewId, "InterviewCancelled", {
      reason,
      cancelled_at: new Date().toISOString(),
    });

    return updated;
  },

  // ─── Availability Slots ───────────────────────────────────────────────────

  createAvailabilitySlot: async (
    companyId: string,
    recruiterId: string,
    rawInput: unknown
  ): Promise<AvailabilitySlot> => {
    logger.info(`[InterviewService] createAvailabilitySlot for recruiter: ${recruiterId}`);
    const input = recruiterAvailabilitySchema.parse(rawInput);

    // Verify recruiter doesn't have overlapping availability slot
    const slots = await interviewRepository.getAvailabilitySlots(companyId, recruiterId);
    const start = new Date(input.startTime);
    const end = new Date(input.endTime);

    const overlap = slots.some((s) => {
      const sStart = new Date(s.startTime);
      const sEnd = new Date(s.endTime);
      return sStart < end && sEnd > start;
    });

    if (overlap) {
      throw new Error("An availability slot already exists that overlaps with this time window");
    }

    return interviewRepository.createAvailabilitySlot(companyId, recruiterId, input.startTime, input.endTime);
  },

  listAvailabilitySlots: async (
    companyId: string,
    recruiterId?: string,
    isBooked?: boolean
  ): Promise<AvailabilitySlot[]> => {
    return interviewRepository.getAvailabilitySlots(companyId, recruiterId, isBooked);
  },

  // ─── Booking ──────────────────────────────────────────────────────────────

  bookInterviewSlot: async (
    companyId: string,
    candidateId: string,
    rawInput: unknown
  ): Promise<Interview> => {
    logger.info(`[InterviewService] bookInterviewSlot for candidate: ${candidateId}`);
    const input = bookSlotSchema.parse(rawInput);

    // 1. Fetch Slot details
    const slot = await interviewRepository.getAvailabilitySlotById(input.slotId);
    if (!slot) {
      throw new Error("Availability slot not found");
    }
    if (slot.isBooked) {
      throw new Error("This availability slot has already been booked");
    }

    // 2. Candidate overlap check
    const hasCandidateOverlap = await interviewRepository.checkCandidateOverlap(
      input.applicationId,
      slot.startTime,
      slot.endTime
    );
    if (hasCandidateOverlap) {
      throw new Error("Candidate already has another interview scheduled at this time");
    }

    // 3. Mark Slot as Booked
    await interviewRepository.updateAvailabilitySlotBooking(slot.id, true);

    // 4. Resolve Meeting Provider URL
    const provider = meetingProviderFactory.getMeetingProvider(input.meetingProviderType);
    const duration = Math.round((new Date(slot.endTime).getTime() - new Date(slot.startTime).getTime()) / 60000);
    const meetingLink = await provider.generateMeetingLink(input.meetingTitle, slot.startTime, duration);

    // 5. Generate Reference
    const referenceNumber = `INT-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 6. Create the Interview under status 'confirmed'
    const interview = await interviewRepository.createInterview(companyId, {
      applicationId: input.applicationId,
      meetingTitle: input.meetingTitle,
      referenceNumber,
      type: input.type,
      roundNumber: 1,
      startTime: slot.startTime,
      endTime: slot.endTime,
      timezone: "UTC", // Slots are timezone-neutral or UTC normalized
      durationMinutes: duration,
      meetingProviderType: input.meetingProviderType,
      meetingLink,
      status: "confirmed",
    });

    // 7. Add Recruiter as the main interviewer
    const panel = await interviewRepository.addInterviewers(interview.id, [slot.recruiterId]);
    interview.interviewers = panel;

    // 8. Log Event
    await interviewRepository.logInterviewEvent(interview.id, "InterviewScheduled", {
      booking_slot_id: slot.id,
      booked_by_candidate: candidateId,
    });

    return interview;
  },

  // ─── Scorecards ───────────────────────────────────────────────────────────

  submitScorecard: async (interviewId: string, rawInput: unknown): Promise<Scorecard> => {
    logger.info(`[InterviewService] submitScorecard for interview: ${interviewId}`);
    const input = scorecardSchema.parse(rawInput);

    const interview = await interviewRepository.getInterviewById(interviewId, true);
    if (!interview) {
      throw new Error("Interview not found");
    }

    // Verify interviewer is on the panel
    const isPanelist = interview.interviewers?.some((i) => i.id === input.interviewerId);
    if (!isPanelist) {
      throw new Error("Access denied: Interviewer is not assigned to this interview panel");
    }

    const scorecard = await interviewRepository.submitScorecard({
      interviewId,
      interviewerId: input.interviewerId,
      recruiterId: input.recruiterId,
      technicalScore: input.technicalScore,
      communicationScore: input.communicationScore,
      problemSolvingScore: input.problemSolvingScore,
      cultureFitScore: input.cultureFitScore,
      confidenceLevel: input.confidenceLevel,
      strengths: input.strengths,
      weaknesses: input.weaknesses,
      notes: input.notes,
      recommendation: input.recommendation,
    });

    // Mark interviewer as status confirmed
    const panelist = interview.interviewers?.find((i) => i.id === input.interviewerId);
    if (panelist) {
      await interviewRepository.updateInterviewerStatus(interviewId, panelist.recruiterId, "confirmed");
    }

    // Check if all interviewers have submitted scorecards
    const scorecards = await interviewRepository.getScorecardsForInterview(interviewId);
    if (interview.interviewers && scorecards.length === interview.interviewers.length) {
      // Transition status to completed
      await interviewRepository.updateInterview(interviewId, { status: "completed" });
    }

    // Calculate average score & recommendation from all scorecards submitted so far and sync to application
    if (interview.applicationId) {
      try {
        const { applicationRepository } = await import("@/services/application-repository");
        const allScorecards = await interviewRepository.getScorecardsForInterview(interviewId);
        
        // Include the newly submitted scorecard in the list if not already there
        const listToCalculate = [...allScorecards];
        const isAlreadyIncluded = allScorecards.some((s) => s.id === scorecard.id);
        if (!isAlreadyIncluded) {
          listToCalculate.push(scorecard);
        }

        if (listToCalculate.length > 0) {
          let totalScore = 0;
          let count = 0;

          for (const sc of listToCalculate) {
            const scoresList = [
              sc.technicalScore,
              sc.communicationScore,
              sc.problemSolvingScore,
              sc.cultureFitScore
            ].filter((val): val is number => val !== undefined && val !== null);

            if (scoresList.length > 0) {
              const avgSc = scoresList.reduce((a, b) => a + b, 0) / scoresList.length;
              totalScore += avgSc;
              count++;
            }
          }

          const finalAvg = count > 0 ? Math.round((totalScore / count) * 10) / 10 : 0;

          await applicationRepository.updateStageScores(interview.applicationId, {
            interview_avg_score: finalAvg,
            interview_recommendation: input.recommendation,
          });
        }
      } catch (err) {
        logger.error("[InterviewService] Failed to sync interview scorecard results to application", err);
      }
    }

    await interviewRepository.logInterviewEvent(interviewId, "ScorecardSubmitted", {
      interviewer_id: input.interviewerId,
      recommendation: input.recommendation,
    });

    return scorecard;
  },

  getInterviewDetails: async (interviewId: string): Promise<Interview> => {
    const interview = await interviewRepository.getInterviewById(interviewId, true);
    if (!interview) {
      throw new Error("Interview not found");
    }
    return interview;
  },

  listInterviews: async (companyId: string): Promise<Interview[]> => {
    return interviewRepository.listInterviews(companyId);
  },
};
