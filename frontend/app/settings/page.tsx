import { Settings } from "lucide-react";
import EmptyState from "@/components/dashboard/EmptyState";
import PageHeader from "@/components/dashboard/PageHeader";
import ProductShell from "@/components/dashboard/ProductShell";

export default function SettingsPage() { return <ProductShell><div className="max-w-[1440px]"><PageHeader title="Settings" description="Manage workspace preferences and account settings."/><EmptyState icon={Settings} title="Workspace settings" description="Workspace-level settings are not available yet. Your account and connected data remain unchanged."/></div></ProductShell>; }
