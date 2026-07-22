"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth";
import { Button } from "@smarthire/ui";
import { ArrowLeft, ArrowRight, Plus, Trash2, Mail, Loader2 } from "lucide-react";
import { logger } from "@smarthire/logger";

interface InviteItem {
  email: string;
  role: "recruiter" | "hiring_manager" | "company-admin";
  status: "pending" | "sending" | "success" | "error";
  error?: string;
}

export default function InviteTeamPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Invites state
  const [invites, setInvites] = React.useState<InviteItem[]>([]);
  const [newEmail, setNewEmail] = React.useState("");
  const [newRole, setNewRole] = React.useState<"recruiter" | "hiring_manager" | "company-admin">("recruiter");

  // Retrieve company ID on mount
  React.useEffect(() => {
    const id = localStorage.getItem("smarthire_onboarding_company_id");
    if (!id) {
      setErrorMsg("No active company found. Please return to company details step.");
    } else {
      setCompanyId(id);
    }
  }, []);

  const handleAddInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;

    // Simple email validation regex
    if (!/\S+@\S+\.\S+/.test(newEmail)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (invites.some((inv) => inv.email === newEmail)) {
      setErrorMsg("Teammate email has already been added.");
      return;
    }

    setErrorMsg(null);
    setInvites([...invites, { email: newEmail, role: newRole, status: "pending" }]);
    setNewEmail("");
  };

  const handleRemoveInvite = (idx: number) => {
    setInvites(invites.filter((_, i) => i !== idx));
  };

  const handleSendInvitations = async () => {
    if (!companyId) return;
    setLoading(true);
    setErrorMsg(null);

    // Filter out already sent invites
    const pendingInvites = invites.filter((inv) => inv.status !== "success");
    if (pendingInvites.length === 0) {
      router.push("/onboarding/complete");
      return;
    }

    let hasErrors = false;

    // Dispatch invitations sequentially to trigger proper audit logs
    const updatedInvites = [...invites];

    for (let i = 0; i < updatedInvites.length; i++) {
      const inv = updatedInvites[i];
      if (inv.status === "success") continue;

      updatedInvites[i] = { ...inv, status: "sending" };
      setInvites([...updatedInvites]);

      try {
        const res = await fetch("/api/organization/invitations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyId,
            email: inv.email,
            role: inv.role,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to dispatch invitation");
        }

        updatedInvites[i] = { ...inv, status: "success" };
      } catch (err: unknown) {
        hasErrors = true;
        const msg = err instanceof Error ? err.message : "Failed";
        updatedInvites[i] = { ...inv, status: "error", error: msg };
        logger.error(`Failed to send invitation to: ${inv.email}`, err);
      }
      setInvites([...updatedInvites]);
    }

    setLoading(false);
    if (!hasErrors) {
      logger.info("[InviteTeamPage] All invitations sent successfully");
      router.push("/onboarding/complete");
    } else {
      setErrorMsg("Some invitations failed to send. Please check the status list.");
    }
  };

  return (
    <AuthCard
      title="Invite Recruiter Teammates"
      subtitle="Invite co-recruiters, hiring managers, or admins to collaborate on assessment scorecards."
    >
      <div className="space-y-6">
        {errorMsg && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs font-medium text-red-500">
            {errorMsg}
          </div>
        )}

        {/* Invite Form */}
        <form onSubmit={handleAddInvite} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-6 space-y-1.5 text-left">
            <label htmlFor="email" className="text-xs font-semibold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider block">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="teammate@company.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              disabled={loading || !companyId}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/80 px-3.5 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="sm:col-span-4 space-y-1.5 text-left">
            <label htmlFor="role" className="text-xs font-semibold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider block">
              Workspace Role
            </label>
            <select
              id="role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as "recruiter" | "hiring_manager" | "company-admin")}
              disabled={loading || !companyId}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/80 px-3.5 py-2 text-sm text-zinc-400 focus:border-blue-500 focus:outline-none transition-colors"
            >
              <option value="recruiter">Recruiter</option>
              <option value="hiring_manager">Hiring Manager</option>
              <option value="company-admin">Administrator</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <Button
              type="submit"
              variant="outline"
              disabled={loading || !companyId || !newEmail}
              className="w-full justify-center flex items-center gap-1 border-zinc-800 text-zinc-300 hover:bg-zinc-900 h-9"
            >
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </form>

        {/* Teammates List */}
        <div className="space-y-3 text-left">
          <h4 className="text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider">
            Teammates to Invite ({invites.length})
          </h4>

          {invites.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-zinc-500 text-xs">
              No teammates added yet. You can skip this step and invite them later.
            </div>
          ) : (
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {invites.map((inv, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-zinc-200/50 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950/40 p-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 text-zinc-500" />
                    <div>
                      <p className="font-semibold text-zinc-300">{inv.email}</p>
                      <p className="text-[10px] text-zinc-500 font-mono capitalize">
                        Role: {inv.role.replace("-", " ")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {inv.status === "sending" && (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    )}
                    {inv.status === "success" && (
                      <span className="text-emerald-500 font-semibold font-mono">Sent</span>
                    )}
                    {inv.status === "error" && (
                      <span className="text-red-500 font-semibold font-mono" title={inv.error}>
                        Failed
                      </span>
                    )}
                    {inv.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => handleRemoveInvite(idx)}
                        disabled={loading}
                        className="text-zinc-500 hover:text-red-500 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-zinc-200/20 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/onboarding/company/logo")}
            disabled={loading}
            className="flex items-center gap-1 border-zinc-800 text-zinc-350 hover:bg-zinc-900"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/onboarding/complete")}
              disabled={loading || !companyId}
              className="border-zinc-800 text-zinc-400 hover:bg-zinc-900 px-4 py-2 text-xs"
            >
              Skip Teammates
            </Button>

            <Button
              type="button"
              onClick={handleSendInvitations}
              disabled={loading || !companyId}
              className="bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 h-10 px-6"
            >
              {loading ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin text-white" />
              ) : (
                <>
                  Send & Continue <ArrowRight className="h-4.5 w-4.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </AuthCard>
  );
}
