import { BarChart3 } from "lucide-react";
import EmptyState from "@/components/dashboard/EmptyState";
import PageHeader from "@/components/dashboard/PageHeader";
import ProductShell from "@/components/dashboard/ProductShell";

export default function AnalyticsPage() { return <ProductShell><div className="max-w-[1440px]"><PageHeader title="Analytics" description="Explore performance once a data source has been connected and synced."/><EmptyState icon={BarChart3} title="Analytics will appear here" description="Connect Google Ads to start bringing campaign performance into your analytics workspace." action={{label:"Connect data source",href:"/dashboard/data-sources"}}/></div></ProductShell>; }
