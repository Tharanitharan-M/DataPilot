/**
 * Dashboard Layout with Sidebar and Header
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, OrganizationSwitcher, useUser, useOrganization } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Database, 
  Sparkles, 
  History, 
  Settings,
  Menu,
  X,
  Building2,
  Zap
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: any;
  description: string;
}

const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview and statistics",
  },
  {
    title: "Connections",
    href: "/dashboard/connections",
    icon: Database,
    description: "Manage databases",
  },
  {
    title: "Query",
    href: "/dashboard/query",
    icon: Sparkles,
    description: "Ask questions",
  },
  {
    title: "History",
    href: "/dashboard/history",
    icon: History,
    description: "View past queries",
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();
  const { organization } = useOrganization();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              DataPilot
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Organization Switcher */}
        <div className="p-4 border-b border-slate-200">
          <OrganizationSwitcher
            hidePersonal={false}
            appearance={{
              elements: {
                rootBox: "w-full",
                organizationSwitcherTrigger: "w-full justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50",
              },
            }}
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon className="h-5 w-5" />
                <div className="flex-1">
                  <div className="font-medium">{item.title}</div>
                  <div className={cn(
                    "text-xs",
                    isActive ? "text-blue-100" : "text-slate-500"
                  )}>
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-900 truncate">
                {user?.firstName || user?.emailAddresses[0]?.emailAddress}
              </div>
              <div className="text-xs text-slate-500 truncate">
                {organization?.name || "Personal"}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
          <div className="h-full px-4 flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb / Page title */}
            <div className="flex-1 lg:block hidden">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-slate-500" />
                <span className="text-slate-600">
                  {organization?.name || "Personal Workspace"}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Link href="/dashboard/query">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Sparkles className="h-4 w-4 mr-2" />
                  New Query
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}

