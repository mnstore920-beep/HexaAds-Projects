"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Copy, 
  Check, 
  ShieldCheck,
  Layers
} from "lucide-react";

export interface GoogleAdsAccount {
  resourceName: string;
  customerId: string;
  formattedId: string;
  name: string;
}

export default function GoogleAdsAccountsList() {
  const [accounts, setAccounts] = useState<GoogleAdsAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresAuthorization, setRequiresAuthorization] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [connectedMap, setConnectedMap] = useState<Record<string, boolean>>({});

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setRequiresAuthorization(false);

    try {
      const res = await fetch("/api/google-ads/accounts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setAccounts(data.accounts || []);
      } else {
        setRequiresAuthorization(
          data.code === "GOOGLE_ADS_AUTHORIZATION_REQUIRED"
        );
        setError(
          data.error || "Unable to fetch Google Ads accounts. Please check permissions."
        );
      }
    } catch (err: unknown) {
      console.error("Failed to load Google Ads accounts:", err);
      setError("Network error occurred while fetching Google Ads accounts.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
  // fetchAccounts updates local UI state as part of the API request lifecycle.
  // This is intentional for the initial data fetch.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  fetchAccounts();
}, [fetchAccounts]);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleConnect = (customerId: string) => {
    setConnectedMap((prev) => ({
      ...prev,
      [customerId]: !prev[customerId],
    }));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF8E7] flex items-center justify-center text-[#F59E0B]">
            <svg className="w-6 h-6" viewBox="0 0 48 48" fill="none">
              <path d="M40 40H32V16H40V40ZM28 40H20V24H28V40Z" fill="#F9AB00" />
              <circle cx="12" cy="36" r="4" fill="#E37400" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-900">
                Connected Google Ads Accounts
              </h3>
              {!isLoading && !error && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-[#EAE6FF] text-[#5842EC] rounded-full">
                  {accounts.length} {accounts.length === 1 ? "Account" : "Accounts"}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Accessible customer accounts retrieved from Google Ads API
            </p>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={fetchAccounts}
          disabled={isLoading}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#5842EC] bg-[#F5F3FF] hover:bg-[#EAE6FF] rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>{isLoading ? "Syncing..." : "Refresh Accounts"}</span>
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <div className="w-9 h-9 border-3 border-[#5842EC] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-gray-500 font-medium">
            Fetching accessible Google Ads customer accounts...
          </p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1 text-xs space-y-1">
            <p className="font-bold">
              {requiresAuthorization
                ? "Connect Google Ads"
                : "Google Ads API Notice"}
            </p>
            <p className="text-red-600 leading-relaxed">{error}</p>
            {!requiresAuthorization && (
              <button
                type="button"
                onClick={fetchAccounts}
                className="mt-2 inline-flex items-center gap-1 font-semibold text-[#5842EC] underline hover:text-[#4632db]"
              >
                Try again
              </button>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && accounts.length === 0 && (
        <div className="py-10 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-gray-100 mx-auto flex items-center justify-center text-gray-400 mb-2">
            <Layers className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-gray-700">
            No Google Ads accounts found
          </p>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Your connected Google account does not currently have access to any Google Ads client or manager accounts.
          </p>
        </div>
      )}

      {/* Accounts List Grid */}
      {!isLoading && !error && accounts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => {
            const isConnected = !!connectedMap[acc.customerId];

            return (
              <div
                key={acc.customerId}
                className="p-4 rounded-xl border border-gray-100 hover:border-[#5842EC] bg-white shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-[#F8F9FD] border border-gray-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none">
                        <path d="M40 40H32V16H40V40ZM28 40H20V24H28V40Z" fill="#F9AB00" />
                        <circle cx="12" cy="36" r="4" fill="#E37400" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">
                        {acc.name}
                      </h4>
                      <p className="text-[11px] text-gray-400 font-mono">
                        ID: {acc.formattedId}
                      </p>
                    </div>
                  </div>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={() => handleCopy(acc.customerId)}
                    title="Copy Customer ID"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-[#5842EC] hover:bg-gray-50 transition-colors"
                  >
                    {copiedId === acc.customerId ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Status and Action */}
                <div className="pt-2 border-t border-gray-50 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#5842EC]" />
                    Verified
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToggleConnect(acc.customerId)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                      isConnected
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        : "bg-[#5842EC] hover:bg-[#4632db] text-white shadow-xs"
                    }`}
                  >
                    {isConnected ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Connected
                      </>
                    ) : (
                      "Connect"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
