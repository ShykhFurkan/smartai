import { createCandClient } from "@/utils/supabase/candidate";
import { logger } from "@smarthire/logger";

export interface ResumeMetadataInput {
  s3Key: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  version: number;
}

/**
 * Data Repository Layer for Resume Service
 */
export const resumeRepository = {
  /**
   * Fetch all active resumes for a candidate
   */
  getResumesByCandidateId: async (candidateId: string) => {
    logger.info(`Repository: Fetching resumes for candidate: ${candidateId}`);
    const supabase = await createCandClient();

    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("candidate_id", candidateId)
      .is("deleted_at", null)
      .order("version", { ascending: false });

    if (error) {
      logger.error("Repository error: getResumesByCandidateId failed", error);
      throw error;
    }
    return data;
  },

  /**
   * Get specific resume by ID
   */
  getResumeById: async (candidateId: string, resumeId: string) => {
    const supabase = await createCandClient();

    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("candidate_id", candidateId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      logger.error("Repository error: getResumeById failed", error);
      throw error;
    }
    return data;
  },

  /**
   * Determine the maximum version number of existing resumes for a candidate
   */
  getMaxResumeVersion: async (candidateId: string): Promise<number> => {
    const supabase = await createCandClient();

    const { data, error } = await supabase
      .from("resumes")
      .select("version")
      .eq("candidate_id", candidateId)
      .order("version", { ascending: false })
      .limit(1);

    if (error) {
      logger.error("Repository error: getMaxResumeVersion failed", error);
      throw error;
    }

    if (data && data.length > 0) {
      return data[0].version;
    }
    return 0;
  },

  /**
   * Create new resume metadata record
   */
  insertResumeMetadata: async (candidateId: string, metadata: ResumeMetadataInput) => {
    logger.info(`Repository: Inserting resume version ${metadata.version} for candidate: ${candidateId}`);
    const supabase = await createCandClient();

    const { data, error } = await supabase
      .from("resumes")
      .insert({
        candidate_id: candidateId,
        s3_key: metadata.s3Key,
        file_name: metadata.fileName,
        file_size: metadata.fileSize,
        mime_type: metadata.mimeType,
        version: metadata.version,
      })
      .select()
      .single();

    if (error) {
      logger.error("Repository error: insertResumeMetadata failed", error);
      throw error;
    }
    return data;
  },

  /**
   * Soft delete resume metadata record
   */
  softDeleteResume: async (candidateId: string, resumeId: string) => {
    logger.info(`Repository: Soft deleting resume: ${resumeId} for candidate: ${candidateId}`);
    const supabase = await createCandClient();
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("resumes")
      .update({
        deleted_at: now,
        updated_at: now,
      })
      .eq("id", resumeId)
      .eq("candidate_id", candidateId);

    if (error) {
      logger.error("Repository error: softDeleteResume failed", error);
      throw error;
    }
  },
};
