"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  Bell,
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

  const isActivePath = (href: string) => {
    if (href === "/dashboard") return pathname === href || pathname.startsWith("/dashboard") && pathname !== "/dashboard/data-sources";
    if (href === "/dashboard/data-sources") return pathname === href || pathname.startsWith("/dashboard/data-sources");
    return pathname === href || pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      <div className="flex h-[118px] items-center justify-between border-b border-[#e7e7ef] px-5 sm:px-7 lg:h-[172px] lg:px-9">
        <Link href="/dashboard" className="flex items-center" aria-label="HexaAds home">
          <Image src="/logo.png" alt="HexaAds" width={184} height={66} className="h-auto w-[148px] lg:w-[184px]" priority />
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

      <nav className="flex-1 space-y-1 px-3 py-5 lg:px-4" aria-label="Main navigation">
        {primaryNavigation.map(({ label, href, icon: Icon }) => {
          const active = isActivePath(href);
          return (
            <Link
              key={label}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex h-[52px] items-center gap-3 rounded-xl px-4 text-[15px] font-medium transition-colors ${active ? "bg-[#4b35f5] text-white shadow-[0_10px_25px_rgba(75,53,245,0.18)]" : "text-[#4e4e4e] hover:bg-[#f1efff] hover:text-[#4b35f5]"}`}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#e7e7ef] px-3 py-4">
        <Link href="/settings" onClick={() => setMobileOpen(false)} className="flex h-[50px] items-center gap-3 rounded-xl px-4 text-[15px] font-medium text-[#4e4e4e] hover:bg-[#f1efff] hover:text-[#4b35f5]">
          <Settings size={18} strokeWidth={1.8} />
          Settings
        </Link>
        <Link href="/help" onClick={() => setMobileOpen(false)} className="flex h-[50px] items-center gap-3 rounded-xl px-4 text-[15px] font-medium text-[#4e4e4e] hover:bg-[#f1efff] hover:text-[#4b35f5]">
          <HelpCircle size={18} strokeWidth={1.8} />
          Help Centre
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex h-[50px] w-full items-center gap-3 rounded-xl px-4 text-left text-[15px] font-medium text-[#4e4e4e] hover:bg-[#f1efff] hover:text-[#4b35f5]"
        >
          <LogOut size={18} strokeWidth={1.8} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-white lg:flex">
      <aside className="hidden w-[340px] shrink-0 flex-col bg-[#fafaff] lg:flex">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-[300px] bg-[#fafaff] shadow-2xl transition-transform duration-200 lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {sidebarContent}
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
