import * as React from "react";
import { Button } from "@smarthire/ui";

export default function LoginPage() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-md">
      <h2 className="text-center text-3xl font-extrabold tracking-tight text-zinc-100">
        Sign in to Smart Hire
      </h2>
      <form className="mt-8 space-y-6">
        <div className="rounded-md shadow-sm -space-y-px">{/* Form fields placeholders */}</div>
        <Button variant="primary" className="w-full">
          Sign In
        </Button>
      </form>
    </div>
  );
}
