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
    setSidebarCollapsed((collapsed) => !collapsed);
  };

  const isActivePath = (href: string) => {
    if (href === "/dashboard") return pathname === href || (pathname.startsWith("/dashboard") && pathname !== "/dashboard/data-sources");
    if (href === "/dashboard/data-sources") return pathname === href || pathname.startsWith("/dashboard/data-sources");
    return pathname === href || pathname.startsWith(href);
  };

  const renderSidebarContent = (isMobile = false) => {
    const compact = !isMobile && sidebarCollapsed;
    const labelClass = `overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ${compact ? "max-w-0 opacity-0" : "max-w-[180px] opacity-100"}`;
    const itemClass = `flex h-[52px] items-center gap-3 text-[14px] font-normal transition-colors ${compact ? "justify-center px-0" : "px-[35px]"}`;

    return (
      <>
        <div className={`relative flex ${isMobile ? "h-[118px] items-center justify-between px-5 sm:px-7" : compact ? "h-[200px] items-start justify-center px-0 pt-[20px]" : "h-[200px] items-start justify-between px-[46px] pt-[72px]"}`}>
          <Link href="/dashboard" className={`flex shrink-0 items-center gap-3 overflow-hidden ${compact ? "h-[73px] w-[73px]" : isMobile ? "h-auto w-[148px]" : "h-[73px] w-[194px]"}`} aria-label="HexaAds home">
            <Image src="/logo.png" alt="HexaAds" width={73} height={73} className="h-[72.58px] w-[72.58px] shrink-0 object-cover" priority />
            {!compact && <span className="font-montserrat text-[23.5687px] font-bold leading-[29px]">
              <span className="text-[#4F39F6]">Hexa</span>
              <span className="text-black">Ads</span>
            </span>}
          </Link>
          {!isMobile && (
            <button
              type="button"
              onClick={toggleSidebar}
              className={`${compact ? "absolute left-1/2 top-[101px] -translate-x-1/2" : "absolute right-[18px] top-[101px]"} flex h-6 w-6 items-center justify-center rounded-none text-[#0060A9]`}
              aria-label={compact ? "Expand sidebar" : "Collapse sidebar"}
              title={compact ? "Expand sidebar" : "Collapse sidebar"}
            >
              {compact ? <ChevronRight size={24} strokeWidth={2.2} /> : <ChevronLeft size={24} strokeWidth={2.2} />}
            </button>
          )}
          <button
            type="button"
            className="rounded-lg p-2 text-[#4b35f5] lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1" aria-label="Main navigation">
          {primaryNavigation.map(({ label, href, icon: Icon }) => {
            const active = isActivePath(href);
            return (
              <Link
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                title={compact ? label : undefined}
                className={`${itemClass} ${active ? "w-full rounded-none bg-[#6D71F9] text-white" : "text-[#6B7280] hover:bg-[#f3f4f6] hover:text-[#374151]"} ${compact ? "justify-center" : ""}`}
              >
                <Icon className="shrink-0" size={18} strokeWidth={1.8} color={active ? "#FFFFFF" : "#9CA3AF"} />
                <span className={labelClass}>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={`pt-4 ${compact ? "px-3" : "px-0"}`}>
          <div className="h-px w-full bg-[#E5E7EB]" />
          <Link href="/settings" onClick={() => setMobileOpen(false)} title={compact ? "Settings" : undefined} className={`${itemClass} mt-2 text-[#6B7280] hover:bg-[#f3f4f6] hover:text-[#374151]`}>
            <Settings className="shrink-0" size={18} strokeWidth={1.8} color="#9CA3AF" />
            <span className={labelClass}>Settings</span>
          </Link>
          <Link href="/help" onClick={() => setMobileOpen(false)} title={compact ? "Help Centre" : undefined} className={`${itemClass} text-[#6B7280] hover:bg-[#f3f4f6] hover:text-[#374151]`}>
            <HelpCircle className="shrink-0" size={18} strokeWidth={1.8} color="#9CA3AF" />
            <span className={labelClass}>Help Centre</span>
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            title={compact ? "Logout" : undefined}
            className={`${itemClass} w-full justify-start text-left text-[#6B7280] hover:bg-[#f3f4f6] hover:text-[#374151] ${compact ? "justify-center" : ""}`}
          >
            <LogOut className="shrink-0" size={18} strokeWidth={1.8} color="#9CA3AF" />
            <span className={labelClass}>Logout</span>
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-white lg:flex">
      <aside className={`hidden shrink-0 flex-col border-r border-[#ACACAC]/50 bg-[#EEEEFB]/30 shadow-[0_0_5px_rgba(0,0,0,0.15)] transition-[width] duration-200 ease-out lg:flex ${sidebarCollapsed ? "w-[76px]" : "w-[338px]"}`}>
        {renderSidebarContent()}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-[300px] bg-[#F9FAFC] shadow-2xl transition-transform duration-200 lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {renderSidebarContent(true)}
      </aside>

      <main className="relative min-w-0 flex-1 bg-white">
        <header className="relative h-[72px] bg-white px-4 sm:px-6 lg:px-0">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-[#4b35f5] lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
          <div className="absolute right-[89px] top-[72px] flex items-center justify-end">
            <HeaderUserMenu />
          </div>
        </header>

        <div className="px-4 pb-10 pt-[20px] sm:px-6 lg:pl-[53px] lg:pr-[40px] lg:pb-10">
          {children}
        </div>
      </main>
    </div>
  );
}
