"use client";

import { useState } from "react";
import { UserCheck } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function ImpersonateButton({ email }: { email?: string }) {
  const [loading, setLoading] = useState(false);

  const handleImpersonate = async () => {
    if (!email) return;
    const confirm = window.confirm(`Log in as ${email}? You will be redirected to their dashboard.`);
    if (!confirm) return;

    setLoading(true);
    try {
      // Create a temporary magic link via an API route we will create
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (data.url) {
        // Open the generated link in a new tab
        window.open(data.url, "_blank");
      } else {
        alert("Failed to generate impersonation link: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Error: " + (err?.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleImpersonate}
      disabled={loading}
      className="text-xs font-medium text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-emerald-300 mr-3 flex items-center gap-1 inline-flex"
      title="Login as User"
    >
      <UserCheck size={14} />
      {loading ? "..." : "Login As"}
    </button>
  );
}
