import { Sparkles } from "lucide-react";
import EmptyState from "@/components/dashboard/EmptyState";
import PageHeader from "@/components/dashboard/PageHeader";
import ProductShell from "@/components/dashboard/ProductShell";

export default function AiAnalystPage() { return <ProductShell><div className="max-w-[1440px]"><PageHeader title="AI Analyst" description="Surface useful questions and observations from the performance data you choose to connect."/><EmptyState icon={Sparkles} title="Your analyst is waiting for data" description="Connect a data source and sync account performance before requesting AI analysis." action={{label:"Connect data source",href:"/dashboard/data-sources"}}/></div></ProductShell>; }
