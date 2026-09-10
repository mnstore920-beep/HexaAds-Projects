import { Bell } from "lucide-react";
import EmptyState from "@/components/dashboard/EmptyState";
import PageHeader from "@/components/dashboard/PageHeader";
import ProductShell from "@/components/dashboard/ProductShell";

export default function AlertsPage() { return <ProductShell><div className="max-w-[1440px]"><PageHeader title="Alerts" description="Keep an eye on important changes across connected accounts."/><EmptyState icon={Bell} title="No alerts to show" description="Alerts need synced account performance before they can be generated." action={{label:"Connect data source",href:"/dashboard/data-sources"}}/></div></ProductShell>; }
