"use client";

import { useState } from "react";
import { updateTicketStatus } from "./actions";

interface SupportTicket {
  id: string;
  user_id: string | null;
  subject: string;
  message: string;
  priority: string;
  status: string;
  created_at: string;
  auth_users?: {
    email: string;
  } | null;
}

export default function SupportClient({ initialTickets }: { initialTickets: SupportTicket[] }) {
  const [tickets, setTickets] = useState(initialTickets);
  const [filter, setFilter] = useState("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = tickets.filter(t => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  const handleStatusChange = async (id: string, newStatus: string) => {
    setLoadingId(id);
    const res = await updateTicketStatus(id, newStatus);
    if (res.success) {
      setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t));
    } else {
      alert("Failed to update status");
    }
    setLoadingId(null);
  };

  const statusColors: Record<string, string> = {
    open: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    in_progress: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    resolved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    closed: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/5 bg-slate-900/50 flex gap-2">
        {["all", "open", "in_progress", "resolved", "closed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full capitalize transition-colors ${
              filter === f ? "bg-white text-black" : "bg-white/5 text-slate-400 hover:text-slate-200"
            }`}
          >
            {f.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-2">
        <table className="w-full text-left text-sm">
          <thead className="bg-transparent sticky top-0 backdrop-blur-md z-10">
            <tr className="text-slate-400 border-b border-slate-800">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Subject</th>
              <th className="px-4 py-3 font-medium">Message</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filtered.map((t) => (
              <tr key={t.id} className="transition-colors hover:bg-slate-800/30">
                <td className="px-4 py-4 text-xs font-mono text-slate-400">
                  {t.auth_users?.email || t.user_id?.substring(0, 8) || "Guest"}
                </td>
                <td className="px-4 py-4 font-medium text-slate-200 max-w-[200px] truncate">{t.subject}</td>
                <td className="px-4 py-4 text-slate-400 max-w-[300px] truncate">{t.message}</td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-1 rounded-md text-[10px] uppercase tracking-wider font-semibold ${t.priority === 'urgent' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
                    {t.priority}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <select 
                    value={t.status}
                    onChange={(e) => handleStatusChange(t.id, e.target.value)}
                    disabled={loadingId === t.id}
                    className={`text-xs font-medium px-2 py-1 rounded border appearance-none cursor-pointer focus:outline-none ${statusColors[t.status || 'open']}`}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>
                <td className="px-4 py-4 text-slate-500 text-xs">
                  {new Date(t.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                  No tickets found matching this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
