import { createCandClient } from "@/utils/supabase/candidate";
import { logger } from "@smarthire/logger";
import { z } from "zod";
import {
  candidateProfileSchema,
  candidateEducationSchema,
  candidateExperienceSchema,
  candidateProjectSchema,
  candidateCertificateSchema,
  candidateSocialLinkSchema,
} from "./candidate-schemas";

type CandidateProfileInput = z.infer<typeof candidateProfileSchema>;
type CandidateEducationInput = z.infer<typeof candidateEducationSchema>;
type CandidateExperienceInput = z.infer<typeof candidateExperienceSchema>;
type CandidateProjectInput = z.infer<typeof candidateProjectSchema>;
type CandidateCertificateInput = z.infer<typeof candidateCertificateSchema>;
type CandidateSocialLinkInput = z.infer<typeof candidateSocialLinkSchema>;

/**
 * Data Repository Layer for Candidate Service
 */
export const candidateRepository = {
  /**
   * Fetch complete candidate profile by user ID (loaded with relations)
   */
  getProfileByUserId: async (userId: string) => {
    logger.info(`Repository: Fetching candidate profile for user: ${userId}`);
    const supabase = await createCandClient();

    // Query candidate profile details
    const { data, error } = await supabase
      .from("candidates")
      .select(`
        *,
        education(*),
        experience(*),
        projects(*),
        certificates(*),
        social_links(*),
        candidate_skills(
          years_of_experience,
          skill_id
        )
      `)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      logger.error("Repository error: getProfileByUserId failed", error);
      throw error;
    }
    return data;
  },

  /**
   * Fetch simple candidate profile by ID (without user ID sync)
   */
  getProfileById: async (candidateId: string) => {
    const supabase = await createCandClient();
    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .eq("id", candidateId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      logger.error("Repository error: getProfileById failed", error);
      throw error;
    }
    return data;
  },

  /**
   * Upsert/Create profile
   */
  upsertProfile: async (userId: string, profile: CandidateProfileInput) => {
    logger.info(`Repository: Upserting candidate profile for user: ${userId}`);
    const supabase = await createCandClient();

    // Check if candidate record already exists
    const { data: existing } = await supabase
      .from("candidates")
      .select("id")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .maybeSingle();

    let query;
    const now = new Date().toISOString();

    if (existing) {
      query = supabase
        .from("candidates")
        .update({
          first_name: profile.firstName,
          last_name: profile.lastName,
          phone: profile.phone,
          summary: profile.summary,
          updated_at: now,
        })
        .eq("user_id", userId)
        .select()
        .single();
    } else {
      query = supabase
        .from("candidates")
        .insert({
          user_id: userId,
          email: profile.email,
          first_name: profile.firstName,
          last_name: profile.lastName,
          phone: profile.phone,
          summary: profile.summary,
        })
        .select()
        .single();
    }

    const { data, error } = await query;
    if (error) {
      logger.error("Repository error: upsertProfile failed", error);
      throw error;
    }
    return data;
  },

  /**
   * Soft delete candidate profile
   */
  softDeleteProfile: async (candidateId: string) => {
    logger.info(`Repository: Soft deleting candidate: ${candidateId}`);
    const supabase = await createCandClient();
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("candidates")
      .update({ deleted_at: now, updated_at: now })
      .eq("id", candidateId);

    if (error) {
      logger.error("Repository error: softDeleteProfile failed", error);
      throw error;
    }
  },

  /**
   * Add Education
   */
  addEducation: async (candidateId: string, edu: CandidateEducationInput) => {
    const supabase = await createCandClient();
    const { data, error } = await supabase
      .from("education")
      .insert({
        candidate_id: candidateId,
        institution: edu.institution,
        degree: edu.degree,
        field_of_study: edu.fieldOfStudy,
        start_date: edu.startDate,
        end_date: edu.endDate,
        is_current: edu.isCurrent,
      })
      .select()
      .single();

    if (error) {
      logger.error("Repository error: addEducation failed", error);
      throw error;
    }
    return data;
  },

  /**
   * Delete Education
   */
  deleteEducation: async (candidateId: string, eduId: string) => {
    const supabase = await createCandClient();
    const { error } = await supabase
      .from("education")
      .delete()
      .eq("id", eduId)
      .eq("candidate_id", candidateId);

    if (error) {
      logger.error("Repository error: deleteEducation failed", error);
      throw error;
    }
  },

  /**
   * Add Experience
   */
  addExperience: async (candidateId: string, exp: CandidateExperienceInput) => {
    const supabase = await createCandClient();
    const { data, error } = await supabase
      .from("experience")
      .insert({
        candidate_id: candidateId,
        company_name: exp.companyName,
        job_title: exp.jobTitle,
        description: exp.description,
        start_date: exp.startDate,
        end_date: exp.endDate,
        is_current: exp.isCurrent,
      })
      .select()
      .single();

    if (error) {
      logger.error("Repository error: addExperience failed", error);
      throw error;
    }
    return data;
  },

  /**
   * Delete Experience
   */
  deleteExperience: async (candidateId: string, expId: string) => {
    const supabase = await createCandClient();
    const { error } = await supabase
      .from("experience")
      .delete()
      .eq("id", expId)
      .eq("candidate_id", candidateId);

    if (error) {
      logger.error("Repository error: deleteExperience failed", error);
      throw error;
    }
  },

  /**
   * Add Project
   */
  addProject: async (candidateId: string, proj: CandidateProjectInput) => {
    const supabase = await createCandClient();
    const { data, error } = await supabase
      .from("projects")
      .insert({
        candidate_id: candidateId,
        title: proj.title,
        description: proj.description,
        url: proj.url,
        start_date: proj.startDate,
        end_date: proj.endDate,
      })
      .select()
      .single();

    if (error) {
      logger.error("Repository error: addProject failed", error);
      throw error;
    }
    return data;
  },

  /**
   * Delete Project
   */
  deleteProject: async (candidateId: string, projId: string) => {
    const supabase = await createCandClient();
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projId)
      .eq("candidate_id", candidateId);

    if (error) {
      logger.error("Repository error: deleteProject failed", error);
      throw error;
    }
  },

  /**
   * Add Certificate
   */
  addCertificate: async (candidateId: string, cert: CandidateCertificateInput) => {
    const supabase = await createCandClient();
    const { data, error } = await supabase
      .from("certificates")
      .insert({
        candidate_id: candidateId,
        name: cert.name,
        issuer: cert.issuer,
        issue_date: cert.issueDate,
        expiry_date: cert.expiryDate,
        credential_id: cert.credentialId,
        credential_url: cert.credentialUrl,
      })
      .select()
      .single();

    if (error) {
      logger.error("Repository error: addCertificate failed", error);
      throw error;
    }
    return data;
  },

  /**
   * Delete Certificate
   */
  deleteCertificate: async (candidateId: string, certId: string) => {
    const supabase = await createCandClient();
    const { error } = await supabase
      .from("certificates")
      .delete()
      .eq("id", certId)
      .eq("candidate_id", candidateId);

    if (error) {
      logger.error("Repository error: deleteCertificate failed", error);
      throw error;
    }
  },

  /**
   * Add Social Link
   */
  addSocialLink: async (candidateId: string, social: CandidateSocialLinkInput) => {
    const supabase = await createCandClient();
    const { data, error } = await supabase
      .from("social_links")
      .insert({
        candidate_id: candidateId,
        platform: social.platform,
        url: social.url,
      })
      .select()
      .single();

    if (error) {
      logger.error("Repository error: addSocialLink failed", error);
      throw error;
    }
    return data;
  },

  /**
   * Delete Social Link
   */
  deleteSocialLink: async (candidateId: string, socialId: string) => {
    const supabase = await createCandClient();
    const { error } = await supabase
      .from("social_links")
      .delete()
      .eq("id", socialId)
      .eq("candidate_id", candidateId);

    if (error) {
      logger.error("Repository error: deleteSocialLink failed", error);
      throw error;
    }
  },

  /**
   * Add Skill Mapped Relationship
   */
  addSkill: async (candidateId: string, skillId: string, years: number) => {
    const supabase = await createCandClient();
    const { data, error } = await supabase
      .from("candidate_skills")
      .insert({
        candidate_id: candidateId,
        skill_id: skillId,
        years_of_experience: years,
      })
      .select()
      .single();

    if (error) {
      logger.error("Repository error: addSkill failed", error);
      throw error;
    }
    return data;
  },

  /**
   * Delete Skill Mapping
   */
  removeSkill: async (candidateId: string, skillId: string) => {
    const supabase = await createCandClient();
    const { error } = await supabase
      .from("candidate_skills")
      .delete()
      .eq("candidate_id", candidateId)
      .eq("skill_id", skillId);

    if (error) {
      logger.error("Repository error: removeSkill failed", error);
      throw error;
    }
  },
};
