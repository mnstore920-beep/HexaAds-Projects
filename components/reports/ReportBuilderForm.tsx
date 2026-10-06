"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

type GoogleAdsAccount = {
    customerId: string;
    formattedId: string;
    name: string;
};

export default function ReportBuilderForm() {
    const [accounts, setAccounts] = useState<GoogleAdsAccount[]>([]);
    const [selectedAccount, setSelectedAccount] =
        useState<GoogleAdsAccount | null>(null);

    const [internalName, setInternalName] = useState("");
    const [title, setTitle] = useState("");

    const [loadingAccounts, setLoadingAccounts] = useState(true);
    const [accountOpen, setAccountOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        async function loadAccounts() {
            try {
                const response = await fetch("/api/google-ads/accounts", {
                    cache: "no-store",
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.error || "Unable to load Google Ads accounts."
                    );
                }

                setAccounts(data.accounts || []);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load Google Ads accounts."
                );
            } finally {
                setLoadingAccounts(false);
            }
        }

        loadAccounts();
    }, []);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!internalName.trim()) {
            setError("Please enter an internal name.");
            return;
        }

        if (!title.trim()) {
            setError("Please enter a report title.");
            return;
        }

        if (!selectedAccount) {
            setError("Please select a Google Ads account.");
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch("/api/reports", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    internalName: internalName.trim(),
                    title: title.trim(),
                    type: "template",
                    googleAdsAccountId: selectedAccount.customerId,
                    googleAdsAccountName: selectedAccount.name,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Unable to create report.");
            }

            setSuccess("Report created successfully.");
            setInternalName("");
            setTitle("");
            setSelectedAccount(null);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to create report."
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-[8px] border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6"
        >
            <h2 className="text-[18px] font-medium text-[#4A5568]">
                Google Ads report template
            </h2>

            <label className="mt-8 block text-[12px] font-medium text-[#4A5568]">
                Internal name*
                <input
                    required
                    value={internalName}
                    onChange={(event) => setInternalName(event.target.value)}
                    placeholder="e.g. September campaign overview"
                    className="mt-2 h-[36px] w-full rounded-[5px] border border-[#CBD5E0] bg-white px-3 text-[12px] text-[#2D3748] outline-none placeholder:text-[#A0AEC0] focus:border-[#3182CE]"
                />
            </label>

            <label className="mt-6 block text-[12px] font-medium text-[#4A5568]">
                Report Title*
                <input
                    required
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="e.g. September performance report"
                    className="mt-2 h-[36px] w-full rounded-[5px] border border-[#CBD5E0] bg-white px-3 text-[12px] text-[#2D3748] outline-none placeholder:text-[#A0AEC0] focus:border-[#3182CE]"
                />
            </label>

            <label className="mt-6 block text-[12px] font-medium text-[#4A5568]">
                Choose Account(s)

                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setAccountOpen((open) => !open)}
                        disabled={loadingAccounts}
                        className="mt-2 flex h-[36px] w-full items-center justify-between rounded-[5px] border border-[#CBD5E0] bg-white px-3 text-left text-[12px] text-[#A0AEC0] hover:border-[#3182CE] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <span>
                            {loadingAccounts
                                ? "Loading Google Ads accounts..."
                                : selectedAccount
                                    ? `${selectedAccount.name} (${selectedAccount.formattedId})`
                                    : accounts.length
                                        ? "Select a Google Ads account"
                                        : "No Google Ads accounts available"}
                        </span>

                        <ChevronDown size={16} />
                    </button>

                    {accountOpen && !loadingAccounts && accounts.length > 0 && (
                        <div className="absolute left-0 right-0 top-[42px] z-20 max-h-48 overflow-y-auto rounded-[5px] border border-[#CBD5E0] bg-white shadow-lg">
                            {accounts.map((account) => (
                                <button
                                    key={account.customerId}
                                    type="button"
                                    onClick={() => {
                                        setSelectedAccount(account);
                                        setAccountOpen(false);
                                        setError("");
                                    }}
                                    className="block w-full px-3 py-2 text-left text-[12px] text-[#2D3748] hover:bg-[#F7FAFC]"
                                >
                                    {account.name} ({account.formattedId})
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </label>

            {error && (
                <p className="mt-4 rounded-[5px] bg-[#FFF5F5] px-3 py-2 text-[12px] text-[#C53030]">
                    {error}
                </p>
            )}

            {success && (
                <p className="mt-4 rounded-[5px] bg-[#F0FFF4] px-3 py-2 text-[12px] text-[#276749]">
                    {success}
                </p>
            )}

            <div className="mt-8 flex items-center justify-between gap-3">
                <button
                    type="button"
                    className="h-[34px] min-w-[80px] rounded-[5px] border border-[#CBD5E0] bg-white px-4 text-[12px] font-medium text-[#4A5568] hover:bg-[#F7FAFC]"
                >
                    Back
                </button>

                <button
                    type="submit"
                    disabled={submitting}
                    className="h-[34px] rounded-[5px] bg-[#1976D2] px-5 text-[12px] font-medium text-white hover:bg-[#1565C0] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {submitting ? "Generating..." : "Generate report"}
                </button>
            </div>
        </form>
    );
}