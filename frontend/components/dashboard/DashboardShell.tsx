"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  Database,
  FileText,
  Grid2X2,
  HelpCircle,
  LayoutGrid,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { useState } from "react";
import HeaderUserMenu from "@/components/HeaderUserMenu";

const primaryNavigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Data Sources", href: "/dashboard/data-sources", icon: Database },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Templates", href: "/templates", icon: WalletCards },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Clients", href: "/clients", icon: Users },
  { label: "Connections", href: "/connections", icon: Grid2X2 },
  { label: "Alerts", href: "/alerts", icon: Bell },
  { label: "AI Analyst", href: "/ai-analyst", icon: Sparkles },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed((collapsed) => {
      return !collapsed;
    });
  };

  const isActivePath = (href: string) => {
    if (href === "/dashboard") return pathname === href || pathname.startsWith("/dashboard") && pathname !== "/dashboard/data-sources";
    if (href === "/dashboard/data-sources") return pathname === href || pathname.startsWith("/dashboard/data-sources");
    return pathname === href || pathname.startsWith(href);
  };

  const renderSidebarContent = (isMobile = false) => {
    const compact = !isMobile && sidebarCollapsed;
    const labelClass = `overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ${compact ? "max-w-0 opacity-0" : "max-w-[180px] opacity-100"}`;
    const itemClass = `flex h-[52px] items-center gap-3 rounded-xl text-[15px] font-medium transition-colors ${compact ? "justify-center px-0" : "px-4"}`;

    return (
      <>
        <div className={`flex border-b border-[#e7e7ef] ${isMobile ? "h-[118px] items-center justify-between px-5 sm:px-7" : compact ? "h-[172px] items-start justify-center px-3 pt-[72px]" : "h-[172px] items-start justify-between px-0 pt-[72px] pl-[46px]"}`}>
          <Link href="/dashboard" className={`flex shrink-0 items-center overflow-hidden ${compact ? "h-[44px] w-[44px]" : isMobile ? "h-auto w-[148px]" : "h-[72.6px] w-[194px]"}`} aria-label="HexaAds home">
            <Image src="/logo.png" alt="HexaAds" width={194} height={73} className="h-full w-full object-contain" priority />
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-[#4b35f5] lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <nav className={`flex-1 space-y-1 py-5 ${compact ? "px-3" : "px-4"}`} aria-label="Main navigation">
          {primaryNavigation.map(({ label, href, icon: Icon }) => {
            const active = isActivePath(href);
            return (
              <Link
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                title={compact ? label : undefined}
                className={`${itemClass} ${active ? "bg-[#4b35f5] text-white shadow-[0_10px_25px_rgba(75,53,245,0.18)]" : "text-[#4e4e4e] hover:bg-[#f1efff] hover:text-[#4b35f5]"}`}
              >
                <Icon className="shrink-0" size={18} strokeWidth={1.8} />
                <span className={labelClass}>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#e7e7ef] px-3 py-4">
          {!isMobile && (
            <button
              type="button"
              onClick={toggleSidebar}
              className={`mb-2 flex h-10 items-center rounded-xl text-[#4b35f5] transition-colors hover:bg-[#f1efff] ${compact ? "w-full justify-center" : "ml-auto w-10 justify-center"}`}
              aria-label={compact ? "Expand sidebar" : "Collapse sidebar"}
              title={compact ? "Expand sidebar" : "Collapse sidebar"}
            >
              {compact ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          )}
          <Link href="/settings" onClick={() => setMobileOpen(false)} title={compact ? "Settings" : undefined} className={`${itemClass} text-[#4e4e4e] hover:bg-[#f1efff] hover:text-[#4b35f5]`}>
            <Settings className="shrink-0" size={18} strokeWidth={1.8} />
            <span className={labelClass}>Settings</span>
          </Link>
          <Link href="/help" onClick={() => setMobileOpen(false)} title={compact ? "Help Centre" : undefined} className={`${itemClass} text-[#4e4e4e] hover:bg-[#f1efff] hover:text-[#4b35f5]`}>
            <HelpCircle className="shrink-0" size={18} strokeWidth={1.8} />
            <span className={labelClass}>Help Centre</span>
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            title={compact ? "Logout" : undefined}
            className={`${itemClass} w-full text-left text-[#4e4e4e] hover:bg-[#f1efff] hover:text-[#4b35f5]`}
          >
            <LogOut className="shrink-0" size={18} strokeWidth={1.8} />
            <span className={labelClass}>Logout</span>
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-white lg:flex">
      <aside className={`hidden shrink-0 flex-col border-r border-[#e7e7ef] bg-[#fafaff] transition-[width] duration-200 ease-out lg:flex ${sidebarCollapsed ? "w-[76px]" : "w-[252px]"}`}>
        {renderSidebarContent()}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-[300px] bg-[#fafaff] shadow-2xl transition-transform duration-200 lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {renderSidebarContent(true)}
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex h-[110px] items-center justify-between bg-white px-4 sm:px-6 lg:h-[172px] lg:justify-end lg:px-[88px]">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#e4e2f7] text-[#4b35f5] lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
          <div className="lg:pt-16">
            <HeaderUserMenu />
          </div>
        </header>

        <div className="px-4 pb-10 pt-5 sm:px-6 lg:px-[52px]">
          {children}
        </div>
      </main>
    </div>
  );
}
