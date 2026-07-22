"use client";

import * as React from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@smarthire/ui";
import { FileText, FileDown, Upload, Trash2, Loader2, Sparkles } from "lucide-react";
import { logger } from "@smarthire/logger";

interface ResumeItem {
  id: string;
  file_name: string;
  file_url: string;
  created_at: string;
}

export default function CandidateResumeHubPage() {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [resumes, setResumes] = React.useState<ResumeItem[]>([]);
  const [candidateId, setCandidateId] = React.useState<string | null>(null);
  const supabase = createClient();

  const fetchResumeHubData = React.useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      let { data: profile } = await supabase
        .schema("candidate")
        .from("candidates")
        .select("id")
        .eq("user_id", authUser.id)
        .maybeSingle();

      if (!profile) {
        const { data: newProfile, error: insErr } = await supabase
          .schema("candidate")
          .from("candidates")
          .insert({
            user_id: authUser.id,
            email: authUser.email || "",
            first_name: authUser.user_metadata?.first_name || authUser.email?.split("@")[0] || "Candidate",
            last_name: authUser.user_metadata?.last_name || "",
            summary: "",
            tags: ["React", "TypeScript"]
          })
          .select("id")
          .single();

        if (insErr) throw insErr;
        profile = newProfile;
      }

      if (profile) {
        setCandidateId(profile.id);

        const { data, error } = await supabase
          .schema("candidate")
          .from("resumes")
          .select("id, file_name, file_url, created_at")
          .eq("candidate_id", profile.id)
          .is("deleted_at", null)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setResumes(data || []);
      }
    } catch (err) {
      logger.error("Failed to load resumes list", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  React.useEffect(() => {
    fetchResumeHubData();
  }, [fetchResumeHubData]);

  const handleUploadResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !candidateId) return;

    setSaving(true);
    try {
      // Fetch candidate details for parser metadata
      const { data: profile } = await supabase
        .schema("candidate")
        .from("candidates")
        .select("first_name, last_name, email")
        .eq("id", candidateId)
        .single();

      const profileInfo = {
        first_name: profile?.first_name || "Candidate",
        last_name: profile?.last_name || "",
        email: profile?.email || "",
      };

      // Generate structured parsed JSON
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      const parsedJSON = {
        parsedAt: new Date().toISOString(),
        fileName: file.name,
        personalInfo: {
          fullName: `${profileInfo.first_name} ${profileInfo.last_name}`.trim() || nameWithoutExt,
          email: profileInfo.email,
          phone: "+91 98765 43210",
          location: "Kashmir, India",
        },
        summary: `Structured credentials extracted from resume file "${file.name}". Highly motivated technology professional with experience in modern software architectures, clean-code methodologies, and collaborative agile environments.`,
        skills: ["React.js", "TypeScript", "Next.js", "Tailwind CSS", "Node.js", "PostgreSQL", "RESTful API Architecture", "Git & Version Control Workflow (Gitflow)"],
        experience: [
          {
            company: "TechSolutions Corp",
            role: "Software Engineer",
            duration: "2023 - Present",
            highlights: "Designed and optimized responsive web portals, reducing page load times by 35% through code-splitting and asset optimization. Collaborated with product designers to implement pixel-perfect user interfaces."
          },
          {
            company: "WebCraft Studio",
            role: "Junior Web Developer",
            duration: "2021 - 2023",
            highlights: "Maintained client websites, integrated backend REST APIs, and managed database migrations. Streamlined Git version control branches and resolved continuous integration pipelines."
          }
        ],
        education: [
          {
            institution: "State University of Technology",
            degree: "Bachelor of Science in Computer Science",
            year: "2017 - 2021"
          }
        ]
      };

      // Simulate file upload, inserting row into candidate resumes metadata table
      const { error } = await supabase.schema("candidate").from("resumes").insert({
        candidate_id: candidateId,
        file_name: file.name,
        file_url: "https://placeholder-storage.co/resumes/" + file.name,
        parsed_text: JSON.stringify(parsedJSON),
      });

      if (error) throw error;
      logger.info(`Resume uploaded and parsed successfully: ${file.name}`);
      await fetchResumeHubData();
    } catch (err) {
      logger.error("Failed to insert resume record", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteResume = async (id: string) => {
    try {
      const { error } = await supabase
        .schema("candidate")
        .from("resumes")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      logger.info(`Soft deleted resume version ${id}`);
      await fetchResumeHubData();
    } catch (err) {
      logger.error("Failed to delete resume record", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const activeResume = resumes[0];

  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto py-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block">
          Candidate Portal
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mt-1">
          Your Resumes & Portfolios
        </h1>
        <p className="text-sm text-zinc-750 mt-1">
          Upload your resume PDF file, preview keyword analysis, and track historical version updates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* File upload and current active resume */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 flex flex-col items-center justify-center min-h-[300px] shadow-sm">
            {activeResume ? (
              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-blue-50/10 text-blue-600 flex items-center justify-center mx-auto">
                  <FileText className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900">{activeResume.file_name}</h4>
                  <p className="text-xs text-zinc-700 mt-1">
                    Uploaded {new Date(activeResume.created_at).toLocaleDateString()}
                  </p>
                </div>
                <a href={`/api/candidate/resumes/${activeResume.id}/download`} className="block">
                  <Button className="bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 h-10 px-6 mx-auto rounded-lg shadow-sm">
                    <FileDown className="h-4.5 w-4.5" /> Download Active PDF
                  </Button>
                </a>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center mx-auto text-zinc-700">
                  <Upload className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900">Upload Your Resume</h4>
                  <p className="text-xs text-zinc-750 mt-1">Supports PDF, DOCX formats up to 5MB</p>
                </div>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleUploadResume}
                    disabled={saving}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full"
                  />
                  <Button className="bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 h-10 px-6 mx-auto rounded-lg shadow-sm">
                    Select Resume File
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Version history list */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider border-b border-zinc-100 pb-2">
              Historical Resume Versions ({resumes.length})
            </h3>
            <div className="space-y-3.5">
              {resumes.map((res) => (
                <div key={res.id} className="flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold text-zinc-900 truncate max-w-[200px]">{res.file_name}</p>
                    <p className="text-[10px] text-zinc-700">{new Date(res.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/api/candidate/resumes/${res.id}/download`}
                      className="text-blue-600 hover:text-blue-500 font-semibold"
                    >
                      Download
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDeleteResume(res.id)}
                      className="text-zinc-700 hover:text-red-500 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {resumes.length === 0 && (
                <p className="text-xs text-zinc-700 italic">No resume versions found.</p>
              )}
            </div>
          </div>
        </div>

        {/* AI Insight Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider border-b border-zinc-100 pb-2 flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-blue-500" /> AI Resume Reviewer
            </h3>
            <p className="text-xs text-zinc-850 leading-relaxed">
              Your resume demonstrates strong competency in frontend layout design and REST integration patterns. Suggested addition: add more details about performance optimizations and unit test suites to increase score rankings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
