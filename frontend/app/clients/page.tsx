import { Users } from "lucide-react";
import EmptyState from "@/components/dashboard/EmptyState";
import PageHeader from "@/components/dashboard/PageHeader";
import ProductShell from "@/components/dashboard/ProductShell";

export default function ClientsPage() { return <ProductShell><div className="max-w-[1440px]"><PageHeader title="Clients" description="Organize client accounts and the reports you create for them."/><EmptyState icon={Users} title="No clients yet" description="Client management will become available when client records are connected to your workspace."/></div></ProductShell>; }
