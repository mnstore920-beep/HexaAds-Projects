"use client";

import { useState } from "react";
import { Database, ExternalLink, Plus, X } from "lucide-react";
import GoogleAdsAccountsList from "@/components/GoogleAdsAccountsList";
import PageHeader from "@/components/dashboard/PageHeader";

function GoogleAdsMark() {
  return <svg className="h-11 w-11" viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M40 40H32V16H40V40ZM28 40H20V24H28V40Z" fill="#F9AB00"/><circle cx="12" cy="36" r="4" fill="#E37400"/></svg>;
}

export default function DataSourcesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  return <div className="max-w-[1440px]">
    <PageHeader title="Data Sources" description="Connect a marketing platform to bring your account data into HexaAds." action={<button type="button" onClick={() => setDialogOpen(true)} className="inline-flex h-12 items-center justify-center gap-2 rounded-[9px] bg-[#4b35f5] px-5 text-[15px] font-semibold text-white hover:bg-[#4231d6]"><Plus size={18}/>Add data source</button>} />
    <section aria-labelledby="available-sources" className="border-b border-[#e3e3e3] pb-14">
      <div className="mb-9 flex items-baseline gap-4"><h2 id="available-sources" className="text-[25px] font-medium text-black">Connect data source</h2><span className="text-[16px] text-[#696969]">(2 providers available)</span></div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-5">
        <article className="flex min-h-[229px] flex-col items-center rounded-[9px] border border-[#d6d6d6] bg-white px-[11px] pb-[13px] pt-8"><GoogleAdsMark/><h3 className="mt-5 text-[17px] text-[#57575e]">Google Ads</h3><a href="/api/google-ads/connect?returnTo=/dashboard/data-sources" className="mt-auto flex h-14 w-full items-center justify-center gap-2 rounded-[9px] bg-[#4b35f5] text-[17px] font-semibold text-white hover:bg-[#4231d6]"><ExternalLink size={17}/>Connect</a></article>
        <article className="flex min-h-[229px] flex-col items-center rounded-[9px] border border-[#d6d6d6] bg-white px-[11px] pb-[13px] pt-8"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eeedff] text-[#4b35f5]"><Database size={24} strokeWidth={1.5}/></div><h3 className="mt-5 text-[17px] text-[#57575e]">Google Analytics</h3><button type="button" disabled className="mt-auto h-14 w-full rounded-[9px] border border-[#dedcf1] bg-[#f5f4fb] text-[15px] font-medium text-[#888891]">Coming soon</button></article>
      </div>
    </section>
    <div className="mt-12 max-w-[1040px]"><GoogleAdsAccountsList /></div>
    {dialogOpen && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-labelledby="connect-title"><div className="relative max-h-[90vh] w-full max-w-[1040px] overflow-y-auto rounded-[30px] bg-white p-7 shadow-2xl sm:p-12"><button type="button" onClick={() => setDialogOpen(false)} className="absolute right-5 top-5 rounded-lg p-2 text-red-500 hover:bg-red-50" aria-label="Close"><X size={27}/></button><div className="mb-10 text-center"><h2 id="connect-title" className="text-[31px] font-semibold text-black">Connect data source</h2><p className="mt-1 text-[16px] text-[#696969]">Choose a provider to connect</p></div><div className="grid gap-6 sm:grid-cols-2"><div className="rounded-[9px] border border-[#d6d6d6] p-6 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center"><GoogleAdsMark/></div><h3 className="mt-4 text-[18px] font-medium">Google Ads</h3><a href="/api/google-ads/connect?returnTo=/dashboard/data-sources" className="mt-6 flex h-14 items-center justify-center rounded-[9px] bg-[#4b35f5] text-[17px] font-semibold text-white">Connect</a></div><div className="rounded-[9px] border border-[#d6d6d6] p-6 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-[#eeedff] text-[#4b35f5]"><Database size={30}/></div><h3 className="mt-4 text-[18px] font-medium">Google Analytics</h3><button type="button" disabled className="mt-6 h-14 w-full rounded-[9px] bg-[#f5f4fb] text-[16px] text-[#888891]">Coming soon</button></div></div></div></div>}
  </div>;
}
