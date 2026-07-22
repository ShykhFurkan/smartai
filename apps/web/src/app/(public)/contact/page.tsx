"use client";

import * as React from "react";
import { Button } from "@smarthire/ui";
import { Sparkles, MessageSquare, Phone, Mail, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [formSubmitted, setFormSubmitted] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    company: "",
    size: "1-10",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    // Simulate submit
    setFormSubmitted(true);
  };

  return (
    <div className="bg-[#030303] text-zinc-100 min-h-screen relative overflow-hidden font-sans antialiased selection:bg-blue-500/30 selection:text-white py-16 md:py-24">
      {/* Background radial gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 h-[500px] w-full max-w-7xl bg-[radial-gradient(ellipse_60%_60%_at_50%_-10%,rgba(59,130,246,0.12),rgba(255,255,255,0))]" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-950/20 px-3 py-1 text-xs font-semibold text-blue-400">
            <Sparkles className="h-3.5 w-3.5" /> Support & Sales
          </div>
          <h1 className="text-4xl font-extrabold sm:text-5xl leading-tight">
            Connect with our Recruiting Architects
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Have questions about custom LLM hosting, subscription seats licensing, or pipeline customization? Drop us a line.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-5xl mx-auto">
          {/* Left: Contact Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 space-y-6">
              <h3 className="text-lg font-bold text-zinc-250">Our Directory</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <span>sales@smarthire.ai</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <Phone className="h-4 w-4 text-blue-500" />
                  <span>+1 (800) 555-HIRE</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  <span>24/7 Live Slack Workspace Channel</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-blue-500/10 bg-blue-500/5 text-xs leading-relaxed text-zinc-400">
              <strong>Enterprise SLAs:</strong> Standard response metrics for custom instances tier support is guaranteed in under 30 minutes.
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-7 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-blue-500/5 blur-[50px] rounded-full" />

            {formSubmitted ? (
              <div className="text-center py-12 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-center">
                  <CheckCircle2 className="h-16 w-16 text-emerald-500 animate-bounce" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-100">Request Sent Successfully!</h3>
                <p className="text-sm text-zinc-450 max-w-sm mx-auto">
                  Thanks for reaching out, <strong>{formData.name}</strong>. A Smart Hire engineering specialist will contact you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="name">
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="email">
                      Corporate Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jane@company.com"
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="company">
                      Company Name
                    </label>
                    <input
                      id="company"
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Acme Corp"
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="size">
                      Hiring Squad Size
                    </label>
                    <select
                      id="size"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-400 focus:border-blue-500 focus:outline-none transition-colors"
                    >
                      <option value="1-10">1 - 10 recruiters</option>
                      <option value="11-50">11 - 50 recruiters</option>
                      <option value="51+">51+ recruiters</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="message">
                    Inquiry Details
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your recruitment volume and requirements..."
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full justify-center bg-blue-600 text-white hover:bg-blue-500">
                  Request Live Platform Demo
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
