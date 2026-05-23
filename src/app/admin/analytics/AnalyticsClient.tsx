"use client";

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { MessageSquare, MousePointerClick, TrendingUp, Users } from "lucide-react";

export default function AnalyticsClient({ 
  totalMessages,
  successRate,
  linkClicks,
  uniqueLeads,
  conversionData,
  engagementData,
  messageTimingData
}: {
  totalMessages: string;
  successRate: string;
  linkClicks: string;
  uniqueLeads: string;
  conversionData: any[];
  engagementData: any[];
  messageTimingData: any[];
}) {
  const COLORS = ['#818cf8', '#c084fc', '#34d399', '#f472b6'];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Messages Sent", value: totalMessages, icon: MessageSquare, color: "text-blue-400" },
          { title: "Success Rate", value: successRate, icon: TrendingUp, color: "text-emerald-400" },
          { title: "Link Clicks", value: linkClicks, icon: MousePointerClick, color: "text-slate-600" },
          { title: "Unique Leads", value: uniqueLeads, icon: Users, color: "text-slate-600" },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-400">{stat.title}</p>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-6">Automation Success Trends</h2>
          <div className="h-72">
            {conversionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={conversionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Line type="monotone" dataKey="count" stroke="#818cf8" strokeWidth={3} dot={{ fill: '#818cf8', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500">No data available</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-6">Automation Status Distribution</h2>
          <div className="h-72">
             {engagementData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="value" fill="#c084fc" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
             ) : (
                <div className="flex h-full items-center justify-center text-slate-500">No data available</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
