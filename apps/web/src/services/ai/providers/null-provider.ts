/**
 * AI Service — Null Provider (Stub / No-Op Implementation)
 *
 * Satisfies the full IAIProvider contract without making any external calls.
 * Used as the default provider in development and test environments until
 * a concrete LLM provider (OpenAI, Gemini, Anthropic, etc.) is registered.
 *
 * All methods return deterministic, structurally valid placeholder responses
 * so that dependent services can be built and tested end-to-end.
 */

import { IAIProvider, AIProviderStatus } from "../interfaces/ai-provider.interface";
import { IResumeParser, ResumeParserInput, ParsedResume } from "../interfaces/resume-parser.interface";
import { IResumeScorer, ResumeScorerInput, ResumeScore } from "../interfaces/resume-scorer.interface";
import { ISkillExtractor, SkillExtractorInput, ExtractedSkill } from "../interfaces/skill-extractor.interface";
import { ICandidateRanker, CandidateRankerInput, CandidateRankingEntry } from "../interfaces/candidate-ranker.interface";
import { IJobMatcher, JobMatcherInput, JobMatch } from "../interfaces/job-matcher.interface";
import { IQuestionGenerator, QuestionGeneratorInput, GeneratedQuestion } from "../interfaces/question-generator.interface";
import { logger } from "@smarthire/logger";

// ---------------------------------------------------------------------------
// Sub-capability stubs
// ---------------------------------------------------------------------------

const nullResumeParser: IResumeParser = {
  async parse(input: ResumeParserInput): Promise<ParsedResume> {
    logger.info("[NullAIProvider] resumeParser.parse called — returning stub");
    return {
      fullName: null,
      email: null,
      phone: null,
      location: null,
      summary: null,
      experience: [],
      education: [],
      skills: [],
      certifications: [],
      languages: [],
      rawText: input.content,
      confidence: 0,
    };
  },
};

const nullResumeScorer: IResumeScorer = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async score(_: ResumeScorerInput): Promise<ResumeScore> {
    logger.info("[NullAIProvider] resumeScorer.score called — returning stub");
    return {
      overallScore: 0,
      breakdown: { skills: 0, experience: 0, education: 0, seniority: 0 },
      matchedSkills: [],
      missingSkills: [],
      strengths: [],
      gaps: [],
      recommendation: "No AI provider configured. Scores are placeholder values.",
    };
  },
};

const nullSkillExtractor: ISkillExtractor = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async extract(_: SkillExtractorInput): Promise<ExtractedSkill[]> {
    logger.info("[NullAIProvider] skillExtractor.extract called — returning stub");
    return [];
  },
};

const nullCandidateRanker: ICandidateRanker = {
  async rank(input: CandidateRankerInput): Promise<CandidateRankingEntry[]> {
    logger.info("[NullAIProvider] candidateRanker.rank called — executing robust heuristic ranking");
    
    // Core dictionary for dynamic skill keyword extraction
    const dict = [
      "react", "next.js", "vue", "angular", "typescript", "javascript", "html", "css", "tailwind", "sass", "redux",
      "node.js", "express", "nestjs", "python", "django", "flask", "fastapi", "java", "spring", "go", "golang", "ruby", "rails", "php", "laravel",
      "sql", "postgres", "postgresql", "mysql", "mongodb", "redis", "prisma", "docker", "kubernetes", "aws", "gcp", "azure", "ci/cd", "git"
    ];

    const descLower = (input.jobDescription || "").toLowerCase();
    const extractedSkills = dict.filter(skill => descLower.includes(skill.toLowerCase()));

    // Combine required skills and extracted keywords uniquely
    const combinedRequiredSkills = Array.from(new Set([
      ...(input.requiredSkills || []),
      ...extractedSkills.map(s => {
        if (s === "typescript") return "TypeScript";
        if (s === "javascript") return "JavaScript";
        if (s === "react") return "React";
        if (s === "next.js") return "Next.js";
        if (s === "node.js") return "Node.js";
        if (s === "sql") return "SQL";
        if (s === "git") return "Git";
        if (s === "postgres" || s === "postgresql") return "PostgreSQL";
        if (s === "aws") return "AWS";
        if (s === "ci/cd") return "CI/CD";
        return s.charAt(0).toUpperCase() + s.slice(1);
      })
    ]));

    if (combinedRequiredSkills.length === 0) {
      combinedRequiredSkills.push("React", "TypeScript", "JavaScript", "HTML", "CSS");
    }

    // Determine preferred education from job description
    let preferredEducation = "bachelor";
    if (descLower.includes("phd") || descLower.includes("doctorate")) {
      preferredEducation = "phd";
    } else if (descLower.includes("master") || descLower.includes("ms") || descLower.includes("postgraduate")) {
      preferredEducation = "master";
    }

    return input.candidates.map((candidate, index) => {
      const candidateSkillsLower = (candidate.skills || []).map(s => s.toLowerCase());
      const resumeLower = (candidate.resumeContent || "").toLowerCase();

      // 1. Core Skill Match (40%)
      const matchedSkills = combinedRequiredSkills.filter(req => {
        const reqLower = req.toLowerCase();
        return candidateSkillsLower.includes(reqLower) || resumeLower.includes(reqLower);
      });
      const skillScore = (matchedSkills.length / combinedRequiredSkills.length) * 40;

      // 2. Experience Match (30%)
      const minYears = input.minExperienceYears || 2;
      const candYears = candidate.totalExperienceYears || 0;
      let experienceScore = 0;
      if (candYears >= minYears) {
        experienceScore = 24 + Math.min(6, (candYears - minYears) * 2);
      } else {
        experienceScore = (candYears / minYears) * 24;
      }

      // 3. Resume Keyword Density Match (20%)
      const keywordsToSearch = [
        "developer", "engineer", "full-stack", "frontend", "backend", "database",
        "api", "testing", "agile", "scrum", "architecture", "design", "mentorship"
      ];
      const matchedKeywords = keywordsToSearch.filter(kw => 
        resumeLower.includes(kw) || candidateSkillsLower.includes(kw)
      );
      const resumeScore = Math.min(20, matchedKeywords.length * 2.5);

      // 4. Education Match (10%)
      const candEd = (candidate.educationLevel || "").toLowerCase();
      let educationScore = 7; // Default baseline
      
      if (candEd.includes("phd") || candEd.includes("doctor")) {
        educationScore = 10;
      } else if (candEd.includes("master") || candEd.includes("ms")) {
        educationScore = preferredEducation === "phd" ? 8 : 10;
      } else if (candEd.includes("bachelor") || candEd.includes("bs") || candEd.includes("college") || candEd.includes("university")) {
        educationScore = preferredEducation === "phd" ? 6 : preferredEducation === "master" ? 8 : 10;
      } else if (candEd.includes("associate") || candEd.includes("diploma")) {
        educationScore = 5;
      }

      const finalScore = Math.min(100, Math.round(skillScore + experienceScore + resumeScore + educationScore));

      // Build Highlights
      const highlights: string[] = [];
      if (matchedSkills.length > 0) {
        highlights.push(`Matches core skills: ${matchedSkills.slice(0, 3).join(", ")}`);
      }
      if (candYears >= minYears) {
        highlights.push(`Meets experience requirement (${candYears} yrs vs ${minYears} yrs required)`);
      }
      if (candidate.educationLevel && candEd.includes(preferredEducation)) {
        highlights.push(`Matches educational level (${candidate.educationLevel})`);
      }

      const gaps = combinedRequiredSkills.filter(req => !matchedSkills.includes(req));

      const rationaleParts = [
        `Overall Fit: ${finalScore}/100.`,
        `Skills: Matched ${matchedSkills.length}/${combinedRequiredSkills.length} core competencies.`,
        `Experience: Candidate has ${candYears} years of experience (minimum required: ${minYears} years).`,
        educationScore >= 8 ? `Education matches preferred ${preferredEducation} level.` : `Education level is ${candidate.educationLevel || "unspecified"}.`,
        resumeScore > 12 ? "Resume details show high contextual relevance." : "Resume shows standard relevance to role requirements."
      ];

      return {
        candidateId: candidate.candidateId,
        rank: index + 1,
        score: finalScore,
        rationale: rationaleParts.join(" "),
        highlights: highlights.length > 0 ? highlights : ["Strong candidate profile matching default guidelines"],
        gaps: gaps.slice(0, 5),
      };
    }).sort((a, b) => b.score - a.score).map((entry, idx) => ({ ...entry, rank: idx + 1 }));
  },
};

const nullJobMatcher: IJobMatcher = {
  async match(input: JobMatcherInput): Promise<JobMatch[]> {
    logger.info("[NullAIProvider] jobMatcher.match called — returning stub");
    const topN = input.topN ?? input.jobs.length;
    return input.jobs.slice(0, topN).map((job) => ({
      jobId: job.jobId,
      matchScore: 0,
      matchReasons: [],
      alignedSkills: [],
      missingSkills: job.requiredSkills,
      meetsExperienceRequirement: false,
    }));
  },
};

const nullQuestionGenerator: IQuestionGenerator = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async generate(_: QuestionGeneratorInput): Promise<GeneratedQuestion[]> {
    logger.info("[NullAIProvider] questionGenerator.generate called — returning stub");
    return [
      {
        id: "stub-question-1",
        text: "No AI provider configured. This is a placeholder question.",
        category: "general",
        difficulty: "easy",
        targetSkill: null,
        expectedAnswerGuidance: null,
        followUpProbes: [],
      },
    ];
  },
};

// ---------------------------------------------------------------------------
// NullAIProvider — wires all stubs into the IAIProvider contract
// ---------------------------------------------------------------------------

export class NullAIProvider implements IAIProvider {
  readonly name = "NullAIProvider";
  readonly version = "0.0.0";

  resumeParser = nullResumeParser;
  resumeScorer = nullResumeScorer;
  skillExtractor = nullSkillExtractor;
  candidateRanker = nullCandidateRanker;
  jobMatcher = nullJobMatcher;
  questionGenerator = nullQuestionGenerator;

  async healthCheck(): Promise<AIProviderStatus> {
    return {
      isHealthy: true,
      message: "NullAIProvider is operational (no-op stub — no external calls are made).",
      checkedAt: new Date().toISOString(),
    };
  }
}
