import { Check, ArrowRight } from "lucide-react";
import { Button } from "@smarthire/ui";
import Link from "next/link";

export interface PricingPlan {
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  ctaText: string;
  popular?: boolean;
}

export const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    description: "Ideal for growing startups onboarding their first hiring squad.",
    monthlyPrice: 49,
    annualPrice: 39,
    features: [
      "Up to 3 active job openings",
      "Standard PDF Resume Parsing",
      "Basic In-App Notifications",
      "Email templates support",
      "Local calendar slots sync",
    ],
    ctaText: "Start Starter Plan",
  },
  {
    name: "Growth",
    description: "Perfect for scaling organizations requiring automated AI screening.",
    monthlyPrice: 149,
    annualPrice: 119,
    features: [
      "Unlimited active job openings",
      "Advanced AI resume scoring & fit Explanations",
      "Custom skill assessment builder",
      "Multi-channel notifications (SMS & Push)",
      "Recruiter scorecard aggregations",
      "Timezone overlap schedule bookings",
    ],
    ctaText: "Start Growth Plan",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "Engineered for high-volume staffing squads needing strict SLAs.",
    monthlyPrice: 399,
    annualPrice: 319,
    features: [
      "Custom applicant workflow pipelines",
      "Anonymized screening bias reduction switches",
      "Stripe team seat license management",
      "Dedicated LLM fine-tuning hosting",
      "ClickHouse realtime analytics metrics",
      "24/7 Priority Support & uptime SLAs",
    ],
    ctaText: "Contact Sales Team",
  },
];

interface PricingCardProps {
  plan: PricingPlan;
  isAnnual: boolean;
}

export function PricingCard({ plan, isAnnual }: PricingCardProps) {
  const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
  const isEnterprise = plan.name === "Enterprise";

  return (
    <div
      className={`rounded-2xl p-8 flex flex-col justify-between border relative overflow-hidden transition-all ${
        plan.popular
          ? "border-blue-600 dark:border-blue-500 bg-blue-50/10 dark:bg-blue-950/10 shadow-xl shadow-blue-500/5 ring-1 ring-blue-500"
          : "border-zinc-200/50 dark:border-zinc-800/80 bg-white dark:bg-[#09090c] hover:border-zinc-300 dark:hover:border-zinc-700"
      }`}
    >
      {plan.popular && (
        <span className="absolute top-4 right-4 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white tracking-wide">
          Most Popular
        </span>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{plan.name}</h3>
          <p className="mt-2 text-sm text-zinc-550 dark:text-zinc-400 min-h-[40px] leading-relaxed">
            {plan.description}
          </p>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">${price}</span>
          <span className="text-sm font-medium text-zinc-500">/ recruiter / month</span>
        </div>

        {isAnnual && (
          <span className="inline-block text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100/30 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
            Billed annually (${price * 12}/yr)
          </span>
        )}

        <ul className="space-y-3 pt-2">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-650 dark:text-zinc-300">
              <Check className="h-4 w-5 text-blue-600 dark:text-blue-500 shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-8">
        <Link href={isEnterprise ? "/contact" : "/register"} className="w-full block">
          <Button
            variant={plan.popular ? "primary" : "outline"}
            className={`w-full justify-center flex items-center gap-1.5 ${
              plan.popular
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-150 text-zinc-700 dark:text-zinc-300"
            }`}
          >
            {plan.ctaText} <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
