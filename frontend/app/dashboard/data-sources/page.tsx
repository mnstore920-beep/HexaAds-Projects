"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { CheckCircle2 } from 'lucide-react';
import GoogleAdsAccountsList from '@/components/GoogleAdsAccountsList';

export default function DataSourcesPage() {
  const { data: session } = useSession();

  const [userAccounts, setUserAccounts] = useState([
    { id: 1, name: "Google Analytics", propertyId: "UA-1029381-1", isConnected: false }
  ]);

  const handleConnect = (id: number) => {
    setUserAccounts((prev) =>
      prev.map((acc) =>
        acc.id === id ? { ...acc, isConnected: !acc.isConnected } : acc
      )
    );
  };

  return (
    <div className="px-6 lg:px-8 py-8 space-y-8">
      
      {/* Sub Header info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Connect Data Source</h2>
          <p className="text-xs text-gray-400 font-normal mt-0.5">
            {userAccounts.length} data sources available for {session?.user?.email || "your account"}
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {userAccounts.map((acc) => (
          <div 
            key={acc.id} 
            className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col items-center py-3 space-y-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
                  <path d="M40 40H32V16H40V40ZM28 40H20V24H28V40Z" fill="#F9AB00" />
                  <circle cx="12" cy="36" r="4" fill="#E37400" />
                </svg>
              </div>

              <span className="text-xs text-gray-600 font-semibold tracking-wide text-center">
                {acc.name}
              </span>
            </div>

            <button 
              type="button"
              onClick={() => handleConnect(acc.id)}
              className={`w-full text-xs font-medium py-2 rounded-xl transition-all mt-2 cursor-pointer flex items-center justify-center gap-1.5 ${
                acc.isConnected 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                  : 'bg-[#5842EC] hover:bg-[#4632db] text-white shadow-sm'
              }`}
            >
              {acc.isConnected ? (
                <>
                  <CheckCircle2 size={14} /> Connected
                </>
              ) : (
                "Connect"
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Google Ads Accounts Live Component */}
      <div className="pt-2">
        <GoogleAdsAccountsList />
      </div>

    </div>
  );
}