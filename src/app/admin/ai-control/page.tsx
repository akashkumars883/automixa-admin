import { BrainCircuit, Cpu, DollarSign, TextSelect } from "lucide-react";
import ModalTrigger from "@/components/admin/ModalTrigger";

export default function AdminAiControlPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <BrainCircuit className="w-8 h-8 text-indigo-400" /> AI Control Panel
        </h1>
        <p className="mt-1 text-slate-400">Monitor LLM token usage, API costs, and moderate prompt logs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Cpu className="w-6 h-6 text-indigo-400" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full">Groq API</span>
          </div>
          <p className="text-sm font-medium text-slate-400">Total Tokens Used</p>
          <p className="mt-1 text-3xl font-bold text-white">45.2M</p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-slate-800 text-slate-400 rounded-full">This Month</span>
          </div>
          <p className="text-sm font-medium text-slate-400">Estimated Cost</p>
          <p className="mt-1 text-3xl font-bold text-white">$12.45</p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <TextSelect className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-400">Prompts Processed</p>
          <p className="mt-1 text-3xl font-bold text-white">128k</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 lg:p-6 backdrop-blur-xl shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent AI Prompt Logs</h2>
          <ModalTrigger
            buttonText="View All"
            title="All Prompt Logs"
            message="Viewing full history of AI prompt logs and analytics."
            className="text-sm font-medium text-indigo-400 hover:text-indigo-300"
          />
        </div>
        <div className="overflow-x-auto p-1">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/50">
              <tr className="text-slate-300">
                <th className="px-4 py-3 font-medium">Workspace ID</th>
                <th className="px-4 py-3 font-medium">Model</th>
                <th className="px-4 py-3 font-medium">Tokens</th>
                <th className="px-4 py-3 font-medium">Latency</th>
                <th className="px-4 py-3 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="transition-colors hover:bg-slate-800/50 group">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">ws_8x9a2b{i}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">llama3-8b-8192</span>
                  </td>
                  <td className="px-4 py-3 text-slate-300 font-mono">1,{i}42</td>
                  <td className="px-4 py-3 text-emerald-400 font-mono">{i}40ms</td>
                  <td className="px-4 py-3 text-slate-400">Just now</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
