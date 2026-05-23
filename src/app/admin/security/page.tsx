import { Shield, Key, AlertCircle, Users } from "lucide-react";
import ModalTrigger from "@/components/admin/ModalTrigger";

export default function AdminSecurityPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Shield className="w-8 h-8 text-rose-500" /> Security & Access
        </h1>
        <p className="mt-1 text-slate-400">Manage admin roles, 2FA settings, API keys, and system security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ModalTrigger
          title="Admin Roles"
          message="Role management configuration interface."
          className="w-full text-left rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl flex items-center gap-4 hover:bg-white/5 transition-colors"
          buttonText={
            <>
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200">Admin Roles</h3>
                <p className="text-xs text-slate-400">Manage permissions</p>
              </div>
            </>
          }
        />

        <ModalTrigger
          title="API Keys"
          message="API Key management interface."
          className="w-full text-left rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl flex items-center gap-4 hover:bg-white/5 transition-colors"
          buttonText={
            <>
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <Key className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200">API Keys</h3>
                <p className="text-xs text-slate-400">Manage developer access</p>
              </div>
            </>
          }
        />

        <ModalTrigger
          title="Security Logs"
          message="Detailed security and audit logs interface."
          className="w-full text-left rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl flex items-center gap-4 hover:bg-white/5 transition-colors"
          buttonText={
            <>
              <div className="p-3 bg-rose-500/10 rounded-xl">
                <AlertCircle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200">Security Logs</h3>
                <p className="text-xs text-slate-400">Login alerts & IP tracking</p>
              </div>
            </>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 lg:p-6 backdrop-blur-xl shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-6">Active API Keys</h2>
          <div className="space-y-4">
            <div className="border border-slate-800 bg-slate-900/50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-200">Production Key (Main App)</p>
                <p className="text-xs font-mono text-slate-500 mt-1">pk_live_8f7d9a2b...</p>
              </div>
              <ModalTrigger
                buttonText="Revoke"
                title="Revoke API Key"
                message="Are you sure you want to permanently revoke this Production API key? Services using it will break."
                className="text-xs text-red-400 hover:text-red-300"
              />
            </div>
            <div className="border border-slate-800 bg-slate-900/50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-200">Development Key (Testing)</p>
                <p className="text-xs font-mono text-slate-500 mt-1">pk_test_1c4e6b8f...</p>
              </div>
              <ModalTrigger
                buttonText="Revoke"
                title="Revoke API Key"
                message="Are you sure you want to permanently revoke this Development API key?"
                className="text-xs text-red-400 hover:text-red-300"
              />
            </div>
          </div>
          <ModalTrigger
            buttonText="Generate New Key"
            title="Generate API Key"
            message="You are about to generate a new API key. Please specify the environment (Production/Development)."
            className="mt-4 w-full py-2 rounded-lg bg-indigo-500/10 text-indigo-400 font-medium hover:bg-indigo-500/20 transition-colors"
          />
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 lg:p-6 backdrop-blur-xl shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-6">Recent Login Alerts</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500"></div>
              <div>
                <p className="text-sm font-medium text-slate-200">Successful login from New Delhi, IN</p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">IP: 103.45.67.89 • Chrome / Windows</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-rose-500"></div>
              <div>
                <p className="text-sm font-medium text-slate-200">Failed login attempt (Invalid password)</p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">IP: 45.33.22.11 • Unknown Device</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
