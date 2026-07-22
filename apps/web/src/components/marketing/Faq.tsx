"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqData: FaqItem[] = [
  {
    question: "How accurate is the AI resume parser?",
    answer: "Our parsing engine achieves over 97% accuracy in extracting work experiences, educational backgrounds, contact details, and skill sets from PDF, DOCX, and text resume formats, parsing files in less than 2 seconds.",
  },
  {
    question: "Can I customize the recruitment stages and assessments?",
    answer: "Absolutely. You can customize the pipeline stages for each job opening, build specific logic evaluation questions inside assessments, and configure custom scorecard criteria tailored to different teams.",
  },
  {
    question: "Does the scheduler support timezone differences?",
    answer: "Yes. Smart Hire dynamically translates recruiter availability slots to match the candidate's preferred timezone. It performs validation checks to prevent overlapping recruiter schedules and double bookings.",
  },
  {
    question: "How do you handle candidates data privacy and GDPR?",
    answer: "Data privacy is a core architectural tier of our platform. We implement Row Level Security (RLS) scopes across all candidate schemas and support demographic anonymization toggle switches to reduce screening biases.",
  },
  {
    question: "What is your pricing model for large agencies?",
    answer: "We support specialized Enterprise subscriptions matching the agency volume. Contact our Sales squad for personalized licensing models, dedicated custom LLM hosting, and full SLA guarantees.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {faqData.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className="rounded-xl border border-zinc-200/50 dark:border-zinc-800/80 bg-white dark:bg-[#09090c] overflow-hidden transition-colors"
          >
            <button
              onClick={() => toggleFaq(index)}
              className="flex w-full items-center justify-between px-6 py-5 text-left text-zinc-900 dark:text-zinc-100 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors"
              aria-expanded={isOpen}
            >
              <span>{item.question}</span>
              <ChevronDown
                className={`h-5 w-5 text-zinc-500 transition-transform duration-355 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`transition-all duration-355 ease-in-out ${
                isOpen ? "max-h-[300px] border-t border-zinc-100 dark:border-zinc-850 px-6 py-4" : "max-h-0 overflow-hidden"
              }`}
            >
              <p className="text-sm leading-relaxed text-zinc-650 dark:text-zinc-400">
                {item.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
