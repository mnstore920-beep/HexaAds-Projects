import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import EmptyState from "@/components/dashboard/EmptyState";
import PageHeader from "@/components/dashboard/PageHeader";
import ProductShell from "@/components/dashboard/ProductShell";

export default function ReportsPage() {
  return <ProductShell><div className="max-w-[1440px]"><PageHeader title="Reports" description="Create and manage reports for your connected advertising accounts." action={<Link href="/report-builder" className="inline-flex h-12 items-center gap-2 rounded-[9px] bg-[#4b35f5] px-5 text-[15px] font-semibold text-white hover:bg-[#4231d6]"><Plus size={18}/>Create report</Link>}/><EmptyState icon={FileText} title="No reports yet" description="When you create a report, it will appear here. Start with a template and a connected Google Ads account." action={{label:"Create report",href:"/report-builder"}}/></div></ProductShell>;
}
