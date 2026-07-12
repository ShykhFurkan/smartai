import { candidateRepository } from "./candidate-repository";
import {
  candidateProfileSchema,
  candidateEducationSchema,
  candidateExperienceSchema,
  candidateProjectSchema,
  candidateCertificateSchema,
  candidateSocialLinkSchema,
  candidateSkillSchema,
} from "./candidate-schemas";
import { logger } from "@smarthire/logger";

/**
 * Service Layer for Candidate Service (Clean Architecture Logic)
 */
export const candidateService = {
  /**
   * Fetch complete candidate profile details
   */
  getProfile: async (userId: string) => {
    logger.info(`Service: getProfile for user: ${userId}`);
    return await candidateRepository.getProfileByUserId(userId);
  },

  /**
   * Update or initialize candidate profile details
   */
  updateProfile: async (userId: string, payload: unknown) => {
    logger.info(`Service: updateProfile for user: ${userId}`);
    const result = candidateProfileSchema.safeParse(payload);
    if (!result.success) {
      logger.error("Service: Profile validation failed", result.error.flatten());
      throw new Error(JSON.stringify(result.error.flatten()));
    }
    return await candidateRepository.upsertProfile(userId, result.data);
  },

  /**
   * Soft delete candidate profile
   */
  deleteProfile: async (candidateId: string) => {
    logger.info(`Service: deleteProfile for candidate: ${candidateId}`);
    return await candidateRepository.softDeleteProfile(candidateId);
  },

  /**
   * Add education history record
   */
  addEducation: async (candidateId: string, payload: unknown) => {
    logger.info(`Service: addEducation for candidate: ${candidateId}`);
    const result = candidateEducationSchema.safeParse(payload);
    if (!result.success) {
      throw new Error(JSON.stringify(result.error.flatten()));
    }
    return await candidateRepository.addEducation(candidateId, result.data);
  },

  /**
   * Delete education record
   */
  deleteEducation: async (candidateId: string, eduId: string) => {
    logger.info(`Service: deleteEducation for candidate: ${candidateId}`);
    return await candidateRepository.deleteEducation(candidateId, eduId);
  },

  /**
   * Add experience history record
   */
  addExperience: async (candidateId: string, payload: unknown) => {
    logger.info(`Service: addExperience for candidate: ${candidateId}`);
    const result = candidateExperienceSchema.safeParse(payload);
    if (!result.success) {
      throw new Error(JSON.stringify(result.error.flatten()));
    }
    return await candidateRepository.addExperience(candidateId, result.data);
  },

  /**
   * Delete experience record
   */
  deleteExperience: async (candidateId: string, expId: string) => {
    logger.info(`Service: deleteExperience for candidate: ${candidateId}`);
    return await candidateRepository.deleteExperience(candidateId, expId);
  },

  /**
   * Add project record
   */
  addProject: async (candidateId: string, payload: unknown) => {
    logger.info(`Service: addProject for candidate: ${candidateId}`);
    const result = candidateProjectSchema.safeParse(payload);
    if (!result.success) {
      throw new Error(JSON.stringify(result.error.flatten()));
    }
    return await candidateRepository.addProject(candidateId, result.data);
  },

  /**
   * Delete project record
   */
  deleteProject: async (candidateId: string, projId: string) => {
    logger.info(`Service: deleteProject for candidate: ${candidateId}`);
    return await candidateRepository.deleteProject(candidateId, projId);
  },

  /**
   * Add certificate record
   */
  addCertificate: async (candidateId: string, payload: unknown) => {
    logger.info(`Service: addCertificate for candidate: ${candidateId}`);
    const result = candidateCertificateSchema.safeParse(payload);
    if (!result.success) {
      throw new Error(JSON.stringify(result.error.flatten()));
    }
    return await candidateRepository.addCertificate(candidateId, result.data);
  },

  /**
   * Delete certificate record
   */
  deleteCertificate: async (candidateId: string, certId: string) => {
    logger.info(`Service: deleteCertificate for candidate: ${candidateId}`);
    return await candidateRepository.deleteCertificate(candidateId, certId);
  },

  /**
   * Add social link
   */
  addSocialLink: async (candidateId: string, payload: unknown) => {
    logger.info(`Service: addSocialLink for candidate: ${candidateId}`);
    const result = candidateSocialLinkSchema.safeParse(payload);
    if (!result.success) {
      throw new Error(JSON.stringify(result.error.flatten()));
    }
    return await candidateRepository.addSocialLink(candidateId, result.data);
  },

  /**
   * Delete social link
   */
  deleteSocialLink: async (candidateId: string, socialId: string) => {
    logger.info(`Service: deleteSocialLink for candidate: ${candidateId}`);
    return await candidateRepository.deleteSocialLink(candidateId, socialId);
  },

  /**
   * Add skill mapping
   */
  addSkill: async (candidateId: string, payload: unknown) => {
    logger.info(`Service: addSkill for candidate: ${candidateId}`);
    const result = candidateSkillSchema.safeParse(payload);
    if (!result.success) {
      throw new Error(JSON.stringify(result.error.flatten()));
    }
    const { skillId, yearsOfExperience } = result.data;
    return await candidateRepository.addSkill(candidateId, skillId, yearsOfExperience);
  },

  /**
   * Remove skill mapping
   */
  removeSkill: async (candidateId: string, skillId: string) => {
    logger.info(`Service: removeSkill for candidate: ${candidateId}`);
    return await candidateRepository.removeSkill(candidateId, skillId);
  },
};
