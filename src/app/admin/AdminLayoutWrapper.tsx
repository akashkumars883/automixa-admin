"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { LayoutDashboard, Briefcase, Bot, CreditCard, History, LogOut, Users, LineChart, FileText, LifeBuoy, Megaphone, Shield, Settings, Radio, Menu, ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

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
    { name: "Broadcasts", href: "/admin/broadcasts", icon: Radio },
    { name: "History", href: "/admin/history", icon: History },
    { name: "Security", href: "/admin/security", icon: Shield },
    { name: "Global Settings", href: "/admin/settings", icon: Settings },
  ];

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => { });
    window.location.href = "/admin/login";
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-[#09090B] font-sans selection:bg-indigo-500/30" style={{ color: '#09090B' }}>
      {/* Sidebar - Sticky full height */}
      <aside className={`admin-sidebar flex-shrink-0 border-r border-slate-200 bg-white p-3 flex flex-col relative z-10 shadow-sm h-full overflow-y-auto hidden-scrollbar ${collapsed ? 'w-20' : 'w-64'}`}>
        <div className="mb-4 px-2 py-2 flex items-center gap-3">
          <div className="w-11 h-11 relative overflow-hidden flex items-center justify-center flex-shrink-0 rounded-md bg-transparent">
            <Image
              src="/logo.jpg"
              alt="Automixa Logo"
              fill
              className="object-contain"
              style={{ filter: "none", mixBlendMode: "normal", objectPosition: "center" }}
              priority
            />
          </div>
          {!collapsed && (
            <div 
              className="text-xl font-bold tracking-tight text-slate-900"
              style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
            >
              Automixa
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center ${collapsed ? 'justify-center' : 'gap-3'} rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out ${isActive
                  ? "bg-indigo-50/70 text-indigo-600 ring-1 ring-indigo-100/50 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-105 ${isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 flex flex-col items-stretch gap-3">
          <div className="flex items-center justify-between">
            <div className="admin-divider w-full" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={logout}
              className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-rose-50 hover:text-rose-600 flex-1"
            >
              <LogOut className="h-4 w-4 text-slate-500" />
              {!collapsed && 'Logout'}
            </button>

            <button
              aria-label="Toggle sidebar"
              onClick={() => setCollapsed(!collapsed)}
              className="sidebar-toggle ml-1 flex-shrink-0"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <span className="sr-only">Toggle sidebar</span>
              {collapsed ? <ChevronRight className="h-4 w-4 text-slate-700" /> : <ChevronLeft className="h-4 w-4 text-slate-700" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-slate-50 admin-right-side" style={{ color: '#09090B' }}>
        <header className="admin-topbar sticky top-0 z-20 flex items-center gap-4 px-4 py-3">
          <div className="flex items-center gap-3 w-full max-w-[1600px] mx-auto">
            <div className="flex items-center gap-3">
              <button
                aria-label="Toggle sidebar"
                onClick={() => setCollapsed(!collapsed)}
                className="p-2 rounded-md hover:bg-slate-100"
              >
                <Menu className="h-5 w-5 text-slate-700" />
              </button>
            </div>

            <div className="flex-1">
              <div className="relative">
                <input
                  placeholder="Search admin..."
                  className="w-full rounded-md border border-transparent bg-slate-100/60 px-3 py-2 text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-700">Admin</div>
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700">A</div>
            </div>
          </div>
        </header>

        <main className="w-full h-full p-4 lg:p-6">
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
