"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  RefreshCw, 
  AlertCircle, 
  Copy, 
  Check, 
  ShieldCheck,
  Layers,
  ExternalLink,
} from "lucide-react";

export interface GoogleAdsAccount {
  resourceName: string;
  customerId: string;
  formattedId: string;
  name: string;
}

interface GoogleAdsStatusResponse {
  connected?: boolean;
  provider?: "google_ads" | null;
  googleEmail?: string | null;
  connectedAt?: string | null;
  updatedAt?: string | null;
  error?: string;
}

interface GoogleAdsAccountsResponse {
  success?: boolean;
  accounts?: GoogleAdsAccount[];
  error?: string;
  code?: string;
}

export default function GoogleAdsAccountsList() {
  const [accounts, setAccounts] = useState<GoogleAdsAccount[]>([]);
  const [isStatusLoading, setIsStatusLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requiresAuthorization, setRequiresAuthorization] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
      const response = data as GoogleAdsAccountsResponse;

      if (res.ok && response.success) {
        setAccounts(response.accounts || []);
      } else {
        setRequiresAuthorization(
          response.code === "GOOGLE_ADS_AUTHORIZATION_REQUIRED" ||
            response.code === "GOOGLE_ADS_REAUTH_REQUIRED"
        );
        setError(
          response.error ||
            "Unable to fetch Google Ads accounts. Please check permissions."
        );
      }
    } catch (err: unknown) {
      console.error("Failed to load Google Ads accounts:", err);
      setError("Network error occurred while fetching Google Ads accounts.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStatusAndAccounts = useCallback(async () => {
    setIsStatusLoading(true);
    setError(null);
    setRequiresAuthorization(false);

    try {
      const res = await fetch("/api/google-ads/status", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
      const data = (await res.json()) as GoogleAdsStatusResponse;

      if (!res.ok) {
        setIsConnected(false);
        setError(data.error || "Unable to check Google Ads connection status.");
        return;
      }

      const connected = data.connected === true;
      setIsConnected(connected);
      setGoogleEmail(data.googleEmail || null);

      if (connected) {
        await fetchAccounts();
      }
    } catch (err: unknown) {
      console.error("Failed to load Google Ads connection status:", err);
      setIsConnected(false);
      setError("Network error occurred while checking Google Ads status.");
    } finally {
      setIsStatusLoading(false);
    }
  }, [fetchAccounts]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const returnedFromOAuth = params.get("googleAds") === "connected";

    if (params.has("googleAds")) {
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${window.location.hash}`
      );
    }

    // The status request is the single source of truth for the initial UI state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStatusAndAccounts();

    if (returnedFromOAuth) {
      setIsConnected(true);
    }
  }, [fetchStatusAndAccounts]);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
                Google Ads Accounts
              </h3>
              {!isStatusLoading && isConnected && !isLoading && !error && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-[#EAE6FF] text-[#5842EC] rounded-full">
                  {accounts.length} {accounts.length === 1 ? "Account" : "Accounts"}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {isConnected
                ? googleEmail || "Accessible customer accounts retrieved from Google Ads API"
                : "Connect Google Ads to load accessible customer accounts"}
            </p>
          </div>
        </div>

        {/* Refresh Button */}
        {isConnected && (
          <button
            type="button"
            onClick={fetchAccounts}
            disabled={isLoading || isStatusLoading}
            className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#5842EC] bg-[#F5F3FF] hover:bg-[#EAE6FF] rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>{isLoading ? "Syncing..." : "Refresh Accounts"}</span>
          </button>
        )}
      </div>

      {/* Loading State */}
      {(isStatusLoading || (isConnected && isLoading)) && (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <div className="w-9 h-9 border-3 border-[#5842EC] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-gray-500 font-medium">
            {isStatusLoading
              ? "Checking Google Ads connection..."
              : "Fetching accessible Google Ads customer accounts..."}
          </p>
        </div>
      )}

      {!isStatusLoading && !isConnected && !error && (
        <div className="py-10 text-center space-y-3">
          <p className="text-sm font-semibold text-gray-700">
            Google Ads is not connected
          </p>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Authorize Google Ads to load the customer accounts available to you.
          </p>
          <a
            href="/api/google-ads/connect"
            onClick={() => setIsConnecting(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#5842EC] hover:bg-[#4632db] rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {isConnecting ? "Opening Google..." : "Connect Google Ads"}
          </a>
        </div>
      )}

      {/* Error State */}
      {!isStatusLoading && !isLoading && error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1 text-xs space-y-1">
            <p className="font-bold">
              {requiresAuthorization
                ? "Reconnect Google Ads"
                : "Google Ads API Notice"}
            </p>
            <p className="text-red-600 leading-relaxed">{error}</p>
            {requiresAuthorization ? (
              <a
                href="/api/google-ads/connect"
                onClick={() => setIsConnecting(true)}
                className="mt-2 inline-flex items-center gap-1 font-semibold text-[#5842EC] underline hover:text-[#4632db] disabled:opacity-50"
              >
                {isConnecting ? "Opening Google..." : "Reconnect Google Ads"}
              </a>
            ) : (
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
      {!isStatusLoading && isConnected && !isLoading && !error && accounts.length === 0 && (
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
      {!isStatusLoading && isConnected && !isLoading && !error && accounts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => {
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
                    Available
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
