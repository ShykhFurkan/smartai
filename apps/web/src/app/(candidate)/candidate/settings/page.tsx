"use client";

import * as React from "react";
import { Button } from "@smarthire/ui";
import { Loader2, Save, Key, Mail, ShieldAlert } from "lucide-react";
import { logger } from "@smarthire/logger";

export default function CandidateSettingsPage() {
  const [saving, setSaving] = React.useState(false);
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [smsNotifications, setSmsNotifications] = React.useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Simulate save settings
      await new Promise((res) => setTimeout(res, 500));
      logger.info("Saved candidate notification settings preferences");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-2xl mx-auto py-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block">
          Candidate Portal
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mt-1">
          Portal Settings
        </h1>
        <p className="text-sm text-zinc-700 mt-1">
          Customize email notification alerts, review credentials, or manage privacy preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* Notifications Preferences */}
        <form onSubmit={handleSaveSettings} className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider border-b border-zinc-100 pb-2 flex items-center gap-1.5">
            <Mail className="h-4.5 w-4.5 text-blue-500" /> Notifications Settings
          </h3>
          <div className="space-y-4 text-xs text-zinc-800">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-0"
              />
              <div>
                <p className="font-bold text-zinc-900">Email Alerts</p>
                <p className="text-[10px] text-zinc-700 mt-0.5">Receive notifications when recruiter moves your stage or schedules interviews.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={smsNotifications}
                onChange={(e) => setSmsNotifications(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-0"
              />
              <div>
                <p className="font-bold text-zinc-900">SMS Reminders</p>
                <p className="text-[10px] text-zinc-700 mt-0.5">Receive text message reminders 30 mins before live technical calls.</p>
              </div>
            </label>
          </div>

          <div className="flex justify-end pt-2 border-t border-zinc-100">
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#0071E3] hover:bg-[#006ACC] text-white flex items-center gap-1.5 h-9 px-4 text-xs font-bold rounded-lg shadow-sm"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <>
                  Save Changes <Save className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Security Password */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider border-b border-zinc-100 pb-2 flex items-center gap-1.5">
            <Key className="h-4.5 w-4.5 text-blue-500" /> Password Credentials
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-[10px] font-bold text-zinc-750 uppercase tracking-wider block">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-[10px] font-bold text-zinc-750 uppercase tracking-wider block">Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t border-zinc-100">
              <Button className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-white h-9 px-4 text-xs font-semibold rounded-lg shadow-sm">
                Update Password
              </Button>
            </div>
          </div>
        </div>

        {/* Delete Account */}
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 space-y-4">
          <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider border-b border-red-100 pb-2 flex items-center gap-1.5">
            <ShieldAlert className="h-4.5 w-4.5" /> Danger Zone
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-zinc-800">
              <p className="font-bold text-red-650">Deactivate Candidate Profile</p>
              <p className="mt-0.5">Permanently remove all application timelines and uploaded resume files.</p>
            </div>
            <Button className="bg-red-600 hover:bg-red-500 text-white h-9 px-4 text-xs font-bold rounded-lg shadow-sm shrink-0">
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
