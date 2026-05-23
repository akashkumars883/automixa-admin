"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Briefcase, Bot, CreditCard, History, LogOut, Users, LineChart, BrainCircuit, FileText, LifeBuoy, Megaphone, Shield } from "lucide-react";

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const navigation = [
    { name: "Overview", href: "/admin/overview", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Workspaces", href: "/admin/workspaces", icon: Briefcase },
    { name: "Automations", href: "/admin/automations", icon: Bot },
    { name: "Analytics", href: "/admin/analytics", icon: LineChart },
    { name: "Templates", href: "/admin/templates", icon: FileText },
    { name: "Support", href: "/admin/support", icon: LifeBuoy },
    { name: "Marketing", href: "/admin/marketing", icon: Megaphone },
    { name: "Billing & Plans", href: "/admin/billing", icon: CreditCard },
    { name: "History", href: "/admin/history", icon: History },
    { name: "Security", href: "/admin/security", icon: Shield },
  ];

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/admin/login";
  }

  return (
    <div className="flex h-screen overflow-hidden bg-black font-sans selection:bg-indigo-500/30">
      {/* Sidebar - Sticky full height */}
      <div className="w-64 flex-shrink-0 border-r border-white/5 bg-[#0a0a0a] p-3 flex flex-col relative z-10 shadow-2xl h-full overflow-y-auto hidden-scrollbar">
        <div className="mb-6 px-2 py-2 flex items-center gap-3">
          <div className="w-9 h-9 relative overflow-hidden flex items-center justify-center flex-shrink-0">
            <Image 
              src="/logo.jpg" 
              alt="Automixa Logo" 
              fill
              className="object-cover scale-[1.8]" 
              style={{ filter: "invert(1) contrast(120%)", mixBlendMode: "screen", objectPosition: "center" }}
              priority 
            />
          </div>
          <div className="text-lg font-bold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Automixa
          </div>
        </div>
        
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-in-out ${
                  isActive
                    ? "bg-white/10 text-white shadow-sm ring-1 ring-white/10"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 transition-transform duration-300 ${isActive ? "scale-110 text-indigo-400" : "group-hover:scale-110"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6">
          <button
            onClick={logout}
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-all duration-300 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black">
        <div className="w-full h-full p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
