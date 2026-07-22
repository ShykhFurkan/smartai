"use client";

import * as React from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@smarthire/ui";
import { Loader2, Play, CheckCircle2, Calendar, Code, FileText, Layers } from "lucide-react";
import { logger } from "@smarthire/logger";
import Link from "next/link";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

interface AssignmentItem {
  id: string;
  assessment_id: string;
  title: string;
  type: "mcq" | "coding";
  duration_minutes: number;
  scheduled_start_at: string | null;
  expires_at: string | null;
  status: string;
  attempt?: {
    id: string;
    score?: number | null;
    passed?: boolean | null;
    started_at: string;
    completed_at?: string | null;
  } | null;
}

export default function CandidateAssessmentsPage() {
  const [assignments, setAssignments] = React.useState<AssignmentItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [now, setNow] = React.useState(new Date());
  const [activeTab, setActiveTab] = React.useState<"all" | "mcq" | "coding" | "completed">("all");
  
  const supabase = createBrowserClient(supabaseUrl, supabaseKey);

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    const fetchAssessments = async () => {
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
          // 1. Fetch candidate assignments
          const { data: rawAssignments, error: assignErr } = await supabase
            .schema("assessment")
            .from("assignments")
            .select("id, assessment_id, application_id, status, expires_at, created_at, scheduled_start_at")
            .eq("candidate_id", profile.id);

          if (assignErr) throw assignErr;

          // 2. Fetch questions to accurately identify coding vs mcq templates
          const { data: allQuestions } = await supabase
            .schema("assessment")
            .from("questions")
            .select("assessment_id, question_type");

          const codingAssessmentIds = new Set<string>();
          (allQuestions || []).forEach((q) => {
            if (q.question_type === "coding") {
              codingAssessmentIds.add(q.assessment_id);
            }
          });

          // 3. Fetch attempts
          const { data: rawAttempts, error: attemptsErr } = await supabase
            .schema("assessment")
            .from("attempts")
            .select("id, score, passed, started_at, completed_at, assessment_id, assignment_id")
            .eq("candidate_id", profile.id);

          if (attemptsErr) throw attemptsErr;

          // 4. Fetch assessment templates
          const { data: templates } = await supabase
            .schema("assessment")
            .from("assessments")
            .select("id, title, duration_minutes");

          const mapped: AssignmentItem[] = (rawAssignments || []).map((assignment) => {
            const tmpl = (templates || []).find((t) => t.id === assignment.assessment_id);
            const attempt = (rawAttempts || []).find(
              (a) => a.assignment_id === assignment.id || (a.assessment_id === assignment.assessment_id && !a.assignment_id)
            );

            const isCoding =
              codingAssessmentIds.has(assignment.assessment_id) ||
              Boolean(tmpl?.title?.toLowerCase().includes("coding")) ||
              Boolean(tmpl?.title?.toLowerCase().includes("ide"));

            return {
              id: assignment.id,
              assessment_id: assignment.assessment_id,
              title: tmpl ? tmpl.title : isCoding ? "Coding Interview Assessment" : "Technical MCQ Assessment",
              type: isCoding ? "coding" : "mcq",
              duration_minutes: tmpl ? tmpl.duration_minutes : 60,
              scheduled_start_at: assignment.scheduled_start_at,
              expires_at: assignment.expires_at,
              status: assignment.status,
              attempt: attempt
                ? {
                    id: attempt.id,
                    score: attempt.score,
                    passed: attempt.passed,
                    started_at: attempt.started_at,
                    completed_at: attempt.completed_at,
                  }
                : null,
            };
          });

          setAssignments(mapped);
        }
      } catch (err) {
        logger.error("Failed to fetch candidate exam assignments", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
  }, [supabase]);

  const filteredAssignments = assignments.filter((item) => {
    const isCompleted = Boolean(item.attempt?.completed_at || (item.status === "completed" && item.attempt));
    if (activeTab === "completed") return isCompleted;
    if (activeTab === "mcq") return item.type === "mcq" && !isCompleted;
    if (activeTab === "coding") return item.type === "coding" && !isCompleted;
    return true;
  });

  const getStatus = (item: AssignmentItem) => {
    const isCompleted = Boolean(item.attempt?.completed_at || (item.status === "completed" && item.attempt));
    if (isCompleted) {
      return (
        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 shadow-sm">
          <CheckCircle2 className="h-3.5 w-3.5" /> Completed
        </span>
      );
    }

    if (item.scheduled_start_at) {
      const startTime = new Date(item.scheduled_start_at);
      if (startTime > now) {
        return (
          <span className="inline-flex items-center gap-1 text-yellow-600 font-bold text-xs bg-yellow-50 px-2.5 py-0.5 rounded-full border border-yellow-100 shadow-sm">
            <Calendar className="h-3.5 w-3.5 animate-pulse" /> Scheduled
          </span>
        );
      }
    }

    return (
      <span className="inline-flex items-center gap-1 text-blue-600 font-bold text-xs bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 shadow-sm">
        <Play className="h-3.5 w-3.5 animate-pulse" /> Active
      </span>
    );
  };

  const getCountdownText = (scheduledTimeStr: string) => {
    const target = new Date(scheduledTimeStr).getTime();
    const diff = target - now.getTime();
    if (diff <= 0) return "Starting now...";

    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    return parts.join(" ");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const completedCount = assignments.filter((a) => Boolean(a.attempt?.completed_at || (a.status === "completed" && a.attempt))).length;
  const mcqCount = assignments.filter((a) => a.type === "mcq" && !Boolean(a.attempt?.completed_at || (a.status === "completed" && a.attempt))).length;
  const codingCount = assignments.filter((a) => a.type === "coding" && !Boolean(a.attempt?.completed_at || (a.status === "completed" && a.attempt))).length;

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto py-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block">
          Candidate Portal
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mt-1">
          Assigned Job Assessments
        </h1>
        <p className="text-sm text-zinc-700 mt-1">
          Take multiple-choice tests, launch built-in coding IDE rounds, and view evaluation history.
        </p>
      </div>

      {/* Sub-pages Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeTab === "all"
              ? "bg-[#0071E3] text-white shadow-sm"
              : "text-zinc-650 hover:bg-zinc-100"
          }`}
        >
          <Layers className="h-3.5 w-3.5" /> All Assessments ({assignments.length})
        </button>
        <button
          onClick={() => setActiveTab("mcq")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeTab === "mcq"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-zinc-650 hover:bg-zinc-100"
          }`}
        >
          <FileText className="h-3.5 w-3.5" /> MCQ Tests ({mcqCount})
        </button>
        <button
          onClick={() => setActiveTab("coding")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeTab === "coding"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-zinc-650 hover:bg-zinc-100"
          }`}
        >
          <Code className="h-3.5 w-3.5" /> Coding IDE Rounds ({codingCount})
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeTab === "completed"
              ? "bg-teal-600 text-white shadow-sm"
              : "text-zinc-650 hover:bg-zinc-100"
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" /> Completed ({completedCount})
        </button>
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAssignments.map((item) => {
          const isCompleted = Boolean(item.attempt?.completed_at || (item.status === "completed" && item.attempt));
          
          let isFuture = false;
          if (item.scheduled_start_at) {
            isFuture = new Date(item.scheduled_start_at) > now;
          }

          const gradedDateText = item.attempt?.completed_at
            ? new Date(item.attempt.completed_at).toLocaleDateString()
            : item.scheduled_start_at
            ? new Date(item.scheduled_start_at).toLocaleDateString()
            : "Graded";

          return (
            <div
              key={item.id}
              className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between gap-5 text-left shadow-sm hover:border-zinc-300 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 leading-snug">{item.title}</h3>
                    <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                      item.type === "coding" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                    }`}>
                      {item.type === "coding" ? "Built-in IDE Coding Round" : "MCQ Multiple Choice"}
                    </span>
                  </div>
                  {getStatus(item)}
                </div>
                <div className="text-xs text-zinc-650 space-y-1.5 font-semibold">
                  <p>Duration: <span className="text-zinc-900 font-bold">{item.duration_minutes} minutes</span></p>
                  {item.scheduled_start_at && (
                    <p>
                      Scheduled Start:{" "}
                      <span className="text-zinc-900 font-bold">
                        {new Date(item.scheduled_start_at).toLocaleString([], {
                          dateStyle: "full",
                          timeStyle: "short",
                        })}
                      </span>
                    </p>
                  )}
                  {item.attempt?.score !== undefined && item.attempt?.score !== null && (
                    <p className="font-mono text-zinc-900 font-bold">Obtained Score: {item.attempt.score}%</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2.5 pt-3.5 border-t border-zinc-100">
                {isCompleted ? (
                  <span className="text-[10px] text-zinc-500 italic font-medium">
                    Graded on {gradedDateText}
                  </span>
                ) : isFuture ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-yellow-700 bg-yellow-50/50 p-2 rounded-lg border border-yellow-200">
                      <span>Exam starts in:</span>
                      <span className="font-mono">{getCountdownText(item.scheduled_start_at || "")}</span>
                    </div>
                    <Button disabled className="w-full bg-zinc-150 text-zinc-400 cursor-not-allowed text-xs font-bold h-9 rounded-lg border-none">
                      Waiting for Scheduled Time...
                    </Button>
                  </div>
                ) : (
                  <Link
                    href={
                      item.type === "coding"
                        ? `/candidate/coding/${item.id}/exam`
                        : `/candidate/assessments/${item.id}/exam`
                    }
                    className="w-full"
                  >
                    <Button className={`w-full ${item.type === "coding" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-[#0071E3] hover:bg-[#0051A3]"} text-white flex items-center justify-center gap-1.5 h-9 text-xs font-bold rounded-lg shadow-sm cursor-pointer transition-colors`}>
                      {item.type === "coding" ? "Enter Built-in Coding IDE" : "Start MCQ Examination"} <Play className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          );
        })}

        {filteredAssignments.length === 0 && (
          <div className="col-span-2 rounded-xl border border-dashed border-zinc-300 p-12 text-center text-zinc-500 italic text-sm bg-[#F5F5F7]">
            No assessments found in this view category.
          </div>
        )}
      </div>
    </div>
  );
}
