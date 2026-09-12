"use client";

import { useState } from "react";
import { Database, ExternalLink, X } from "lucide-react";
import GoogleAdsAccountsList from "@/components/GoogleAdsAccountsList";

function GoogleAdsMark() {
  return <svg className="h-11 w-11" viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M40 40H32V16H40V40ZM28 40H20V24H28V40Z" fill="#F9AB00"/><circle cx="12" cy="36" r="4" fill="#E37400"/></svg>;
}

export default function DataSourcesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="max-w-[1440px] font-poppins">
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        className="sr-only"
        aria-label="Add data source"
      >
        Add data source
      </button>

      <div>
        <h1 className="font-montserrat text-[36px] font-semibold leading-[44px] text-black">Data Sources</h1>
        <p className="mt-[8px] max-w-[760px] text-[17px] font-light leading-[30px] text-black">
          Connect a marketing platform to bring your account data into HexaAds.
        </p>
      </div>

      <section aria-labelledby="available-sources" className="mt-[73px]">
        <div className="mb-[41px] flex items-baseline gap-[12px]">
          <h2 id="available-sources" className="text-[24px] font-normal leading-[40px] text-black">Connect data source</h2>
          <span className="text-[17px] font-light leading-[30px] text-[#555555]">(2 providers available)</span>
        </div>

        <div className="grid grid-cols-[repeat(5,252px)] gap-x-[45px] gap-y-[73px]">
          <article className="flex h-[228px] w-[252px] flex-col items-center rounded-[10px] border-[0.5px] border-[#ACACAC] bg-white px-[11px] pb-[12px] pt-[32px] shadow-none">
            <div className="flex h-[64px] w-[64px] items-center justify-center"><GoogleAdsMark /></div>
            <h3 className="mt-[10px] text-center text-[17px] font-light leading-[30px] text-[#555555]">Google Ads</h3>
            <a href="/api/google-ads/connect?returnTo=/dashboard/data-sources" className="mt-auto flex h-[56px] w-[230px] items-center justify-center gap-2 rounded-[10px] bg-[#4F39F6] font-montserrat text-[18px] font-semibold leading-[22px] text-[#FAFAFA] hover:bg-[#3d2ed0]">
              <ExternalLink size={15} />
              Connect
            </a>
          </article>

          <article className="flex h-[228px] w-[252px] flex-col items-center rounded-[10px] border-[0.5px] border-[#ACACAC] bg-white px-[11px] pb-[12px] pt-[32px] shadow-none">
            <div className="flex h-[64px] w-[64px] items-center justify-center rounded-xl bg-[#EEEDFF] text-[#4B35F5]">
              <Database size={32} strokeWidth={1.5} />
            </div>
            <h3 className="mt-[10px] text-center text-[17px] font-light leading-[30px] text-[#555555]">Google Analytics</h3>
            <button type="button" disabled className="mt-auto h-[56px] w-[230px] rounded-[10px] border border-[#D1D5DB] bg-[#F5F4FB] font-montserrat text-[18px] font-semibold leading-[22px] text-[#888891]">
              Coming soon
            </button>
          </article>
        </div>
      </section>

      <div className="mt-12 max-w-[1040px]">
        <GoogleAdsAccountsList />
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-labelledby="connect-title">
          <div className="relative max-h-[90vh] w-full max-w-[1040px] overflow-y-auto rounded-[30px] bg-white p-7 shadow-2xl sm:p-12">
            <button type="button" onClick={() => setDialogOpen(false)} className="absolute right-5 top-5 rounded-lg p-2 text-red-500 hover:bg-red-50" aria-label="Close">
              <X size={27} />
            </button>
            <div className="mb-10 text-center">
              <h2 id="connect-title" className="text-[31px] font-semibold text-black">Connect data source</h2>
              <p className="mt-1 text-[16px] text-[#696969]">Choose a provider to connect</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-[9px] border border-[#d6d6d6] p-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center"><GoogleAdsMark /></div>
                <h3 className="mt-4 text-[18px] font-medium">Google Ads</h3>
                <a href="/api/google-ads/connect?returnTo=/dashboard/data-sources" className="mt-6 flex h-14 items-center justify-center rounded-[9px] bg-[#4b35f5] text-[17px] font-semibold text-white">Connect</a>
              </div>
              <div className="rounded-[9px] border border-[#d6d6d6] p-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-[#eeedff] text-[#4b35f5]"><Database size={30} /></div>
                <h3 className="mt-4 text-[18px] font-medium">Google Analytics</h3>
                <button type="button" disabled className="mt-6 h-14 w-full rounded-[9px] bg-[#f5f4fb] text-[16px] text-[#888891]">Coming soon</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
