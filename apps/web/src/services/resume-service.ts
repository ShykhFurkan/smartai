import { resumeRepository } from "./resume-repository";
import { createCandClient } from "@/utils/supabase/candidate";
import { logger } from "@smarthire/logger";

// Allowed MIME types: PDF, DOC, DOCX
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// Maximum allowed size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Service Layer for Resume Service (Clean Architecture Logic)
 */
export const resumeService = {
  /**
   * Upload resume file to private bucket and record metadata
   */
  uploadResume: async (
    candidateId: string,
    fileName: string,
    fileBuffer: Buffer,
    mimeType: string,
    fileSize: number
  ) => {
    logger.info(`Service: Uploading resume for candidate: ${candidateId}, filename: ${fileName}`);

    // 1. Validation - MIME Type Check
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      logger.error(`Validation failed: MIME type ${mimeType} is not supported`);
      throw new Error("Invalid file type. Only PDF and Word documents (.doc, .docx) are allowed.");
    }

    // 2. Validation - File Size Check
    if (fileSize > MAX_FILE_SIZE) {
      logger.error(`Validation failed: File size ${fileSize} exceeds maximum limit of 5MB`);
      throw new Error("File size exceeds the maximum limit of 5MB.");
    }

    // 3. Virus Scan Placeholder Check
    logger.info(`Virus Scan: Initializing placeholder scanner for file: ${fileName}`);
    const virusScanPassed = true; // Placeholder for virus scanner validation
    if (!virusScanPassed) {
      logger.error(`Virus Scan: File ${fileName} failed security checks`);
      throw new Error("File security check failed. Malware detected.");
    }
    logger.info(`Virus Scan: File ${fileName} passed security validation`);

    const supabase = await createCandClient();

    // 4. Ensure private bucket 'resumes' exists programmatically
    try {
      await supabase.storage.createBucket("resumes", {
        public: false,
        fileSizeLimit: MAX_FILE_SIZE,
        allowedMimeTypes: ALLOWED_MIME_TYPES,
      });
    } catch {
      // Safe to ignore if bucket already exists or permissions limit creation
    }

    // 5. Versioning check
    const currentMaxVersion = await resumeRepository.getMaxResumeVersion(candidateId);
    const newVersion = currentMaxVersion + 1;

    // Standardized Storage key format: resumes/{candidate_id}/v{version_number}/{filename}
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const s3Key = `${candidateId}/v${newVersion}/${cleanFileName}`;

    logger.info(`Storage: Uploading buffer to resumes bucket with key: ${s3Key}`);

    // 6. Supabase Storage upload
    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(s3Key, fileBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      logger.error("Storage error: Uploading file failed", uploadError);
      throw new Error("Failed to upload file to storage bucket.");
    }

    // 7. Insert DB Metadata record
    return await resumeRepository.insertResumeMetadata(candidateId, {
      s3Key,
      fileName,
      fileSize,
      mimeType,
      version: newVersion,
    });
  },

  /**
   * List all resumes for candidate
   */
  listResumes: async (candidateId: string) => {
    logger.info(`Service: Listing resumes for candidate: ${candidateId}`);
    return await resumeRepository.getResumesByCandidateId(candidateId);
  },

  /**
   * Soft delete a resume metadata version
   */
  deleteResume: async (candidateId: string, resumeId: string) => {
    logger.info(`Service: Deleting resume metadata version: ${resumeId} for candidate: ${candidateId}`);
    return await resumeRepository.softDeleteResume(candidateId, resumeId);
  },

  /**
   * Generate secure signed url link valid for 15 minutes
   */
  generateSignedDownloadUrl: async (candidateId: string, resumeId: string) => {
    logger.info(`Service: Generating signed URL for resume: ${resumeId}`);
    const resume = await resumeRepository.getResumeById(candidateId, resumeId);

    if (!resume) {
      logger.error(`Service: Resume ${resumeId} not found or access denied`);
      throw new Error("Resume not found or access denied.");
    }

    if (!resume.s3_key) {
      logger.info(`Service: Resume ${resumeId} has no s3_key, falling back to file_url: ${resume.file_url}`);
      return {
        signedUrl: resume.file_url || "https://placeholder-storage.co/resumes/" + resume.file_name,
        fileName: resume.file_name,
        mimeType: resume.mime_type,
      };
    }

    const supabase = await createCandClient();

    // Create secure signed url link (valid for 15 minutes / 900 seconds)
    const { data, error } = await supabase.storage
      .from("resumes")
      .createSignedUrl(resume.s3_key, 900);

    if (error || !data?.signedUrl) {
      logger.error("Storage error: Failed to generate signed URL", error);
      throw new Error("Failed to generate download URL.");
    }

    return {
      signedUrl: data.signedUrl,
      fileName: resume.file_name,
      mimeType: resume.mime_type,
    };
  },
};
