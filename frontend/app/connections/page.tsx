import { PlugZap } from "lucide-react";
import GoogleAdsAccountsList from "@/components/GoogleAdsAccountsList";
import PageHeader from "@/components/dashboard/PageHeader";
import ProductShell from "@/components/dashboard/ProductShell";

export default function ConnectionsPage() { return <ProductShell><div className="max-w-[1440px]"><PageHeader title="Connections" description="Review the marketing platforms connected to this workspace."/><section className="max-w-[1040px] rounded-[28px] border border-[#ecebf3] bg-[#fafaff] p-5 sm:p-8"><div className="mb-7 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eeedff] text-[#4b35f5]"><PlugZap size={21}/></span><div><h2 className="text-[19px] font-medium">Google Ads</h2><p className="text-[14px] text-[#696969]">Connection status and available customer accounts</p></div></div><GoogleAdsAccountsList/></section></div></ProductShell>; }
