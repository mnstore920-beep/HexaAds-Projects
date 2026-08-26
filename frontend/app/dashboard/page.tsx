"use client";

import React, { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-[#5842EC] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-gray-500 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const user = session.user;
  const displayName = user?.name || user?.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#5842EC] flex items-center justify-center text-white font-bold text-lg shadow-sm">
              H
            </div>
            <span className="text-xl font-bold text-[#5842EC] tracking-tight">HexaAds</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={displayName}
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#EAE6FF] text-[#5842EC] font-semibold text-sm flex items-center justify-center border border-[#D0C9FF]">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <div className="text-sm font-semibold text-gray-800 leading-tight">
                  {displayName}
                </div>
                <div className="text-xs text-gray-500 leading-tight">
                  {user?.email}
                </div>
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="px-3.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EAE6FF] text-[#5842EC] mb-2">
                Active Session
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Welcome, {displayName}!
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                You are successfully signed in to HexaAds. Manage your ad campaigns, generate reports, and analyze data.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/analytics"
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#5842EC] hover:bg-[#4632db] rounded-lg transition shadow-sm"
              >
                View Analytics
              </Link>
            </div>
          </div>
        </div>

        {/* User Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Account Email</span>
            <div className="text-base font-semibold text-gray-800 mt-1 truncate">
              {user?.email || "N/A"}
            </div>
            <span className="inline-block mt-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
              Verified
            </span>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Display Name</span>
            <div className="text-base font-semibold text-gray-800 mt-1 truncate">
              {user?.name || displayName}
            </div>
            <span className="inline-block mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
              Active Profile
            </span>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Authentication Type</span>
            <div className="text-base font-semibold text-gray-800 mt-1">
              NextAuth Session (JWT)
            </div>
            <span className="inline-block mt-2 text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-medium">
              MongoDB Synced
            </span>
          </div>
        </div>

        {/* Quick Links Section */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Navigation</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/analytics"
            className="p-5 bg-white rounded-xl border border-gray-200 hover:border-[#5842EC] hover:shadow-md transition group"
          >
            <div className="w-10 h-10 rounded-lg bg-[#EAE6FF] text-[#5842EC] flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
              📊
            </div>
            <h3 className="font-semibold text-gray-800 text-sm group-hover:text-[#5842EC] transition-colors">
              Analytics
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Track marketing campaign performance and metrics.
            </p>
          </Link>

          <Link
            href="/ai-analyst"
            className="p-5 bg-white rounded-xl border border-gray-200 hover:border-[#5842EC] hover:shadow-md transition group"
          >
            <div className="w-10 h-10 rounded-lg bg-[#EAE6FF] text-[#5842EC] flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
              🤖
            </div>
            <h3 className="font-semibold text-gray-800 text-sm group-hover:text-[#5842EC] transition-colors">
              AI Analyst
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Get AI insights and recommendations for ad campaigns.
            </p>
          </Link>

          <Link
            href="/report-builder"
            className="p-5 bg-white rounded-xl border border-gray-200 hover:border-[#5842EC] hover:shadow-md transition group"
          >
            <div className="w-10 h-10 rounded-lg bg-[#EAE6FF] text-[#5842EC] flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
              📝
            </div>
            <h3 className="font-semibold text-gray-800 text-sm group-hover:text-[#5842EC] transition-colors">
              Report Builder
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Create customized reports and client dashboards.
            </p>
          </Link>

          <Link
            href="/settings"
            className="p-5 bg-white rounded-xl border border-gray-200 hover:border-[#5842EC] hover:shadow-md transition group"
          >
            <div className="w-10 h-10 rounded-lg bg-[#EAE6FF] text-[#5842EC] flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
              ⚙️
            </div>
            <h3 className="font-semibold text-gray-800 text-sm group-hover:text-[#5842EC] transition-colors">
              Settings
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Manage account settings and connections.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}

