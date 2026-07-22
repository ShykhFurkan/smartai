import * as React from "react";
import {
  FileSearch,
  BrainCircuit,
  CalendarDays,
  Activity,
  ClipboardList,
  Sparkles,
  CheckCircle,
} from "lucide-react";

export const metadata = {
  title: "Smart Hire - Platform Features",
  description: "Explore the AI-powered recruitment tools, logical assessment builders, scheduling panels, and recruiter analytics in Smart Hire.",
};

const featureDetails = [
  {
    title: "AI Resume Parsing",
    icon: FileSearch,
    description: "Extract candidate capabilities, experience details, and certifications automatically.",
    bullets: [
      "97.8% accurate structured details extraction",
      "Support for PDF, DOCX, and plain text formats",
      "Ingest documents directly to candidate profiles",
    ],
  },
  {
    title: "AI Screening & Match Scoring",
    icon: BrainCircuit,
    description: "Calculate job-candidate compatibility metrics using neural semantic models.",
    bullets: [
      "Context-aware fit scores and textual reasoning",
      "Automated ranking based on custom job keywords",
      "Demographic details anonymization toggle",
    ],
  },
  {
    title: "Assessment Builder",
    icon: ClipboardList,
    description: "Build logic, aptitude, coding, or multiple-choice candidate assessments.",
    bullets: [
      "Custom programming evaluate test compiler",
      "Section-by-section score distributions tracker",
      "Attempt timeouts and automatic submission settings",
    ],
  },
  {
    title: "Scheduling Panel",
    icon: CalendarDays,
    description: "Prevent overlaps, sync availabilities, and book virtual panel rounds.",
    bullets: [
      "Self-booking calendar interface for candidates",
      "Recruiter panel calendar sync integrations",
      "Automatic Zoom, Google Meet, or Teams links",
    ],
  },
  {
    title: "Recruitment Analytics",
    icon: Activity,
    description: "Evaluate sourcing effectiveness and recruiter processing metrics.",
    bullets: [
      "Average, median, and p90 time-to-hire pipelines",
      "Detailed stage-by-stage hiring funnel drop-offs",
      "Granular recruiter activity throughput analytics",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="bg-[#030303] text-zinc-100 min-h-screen relative overflow-hidden font-sans antialiased selection:bg-blue-500/30 selection:text-white py-16 md:py-24">
      {/* Glow elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 h-[500px] w-full max-w-7xl bg-[radial-gradient(ellipse_60%_60%_at_50%_-10%,rgba(99,102,241,0.12),rgba(255,255,255,0))]" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-950/20 px-3 py-1 text-xs font-semibold text-indigo-400">
            <Sparkles className="h-3.5 w-3.5" /> Capabilities
          </div>
          <h1 className="text-4xl font-extrabold sm:text-5xl leading-tight">
            Platform Capabilities
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Discover the powerful features engineered to automate your talent operations from sourcing to offer.
          </p>
        </div>

        {/* Feature Grid Details */}
        <div className="mt-20 space-y-16">
          {featureDetails.map((feat, idx) => {
            const Icon = feat.icon;
            const isEven = idx % 2 === 0;

            return (
              <div
                key={feat.title}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-zinc-900 pb-16 last:border-b-0 ${
                  isEven ? "" : "lg:flex-row-reverse"
                }`}
              >
                {/* Visual Placeholder Panel */}
                <div
                  className={`lg:col-span-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-8 shadow-2xl backdrop-blur-md relative overflow-hidden ${
                    isEven ? "lg:order-1" : "lg:order-2"
                  }`}
                >
                  <div className="absolute top-0 right-0 h-40 w-40 bg-blue-500/5 blur-[50px] rounded-full" />
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-blue-500 mb-6">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold">{feat.title}</h3>
                  <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                {/* Bullets List */}
                <div
                  className={`lg:col-span-7 space-y-6 ${
                    isEven ? "lg:order-2 lg:pl-12" : "lg:order-1 lg:pr-12"
                  }`}
                >
                  <h4 className="text-lg font-semibold text-zinc-300">Why it matters:</h4>
                  <ul className="space-y-4">
                    {feat.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                        <span className="text-zinc-350 text-sm leading-relaxed">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
