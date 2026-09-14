import ProductShell from "@/components/dashboard/ProductShell";
import PageHeader from "@/components/dashboard/PageHeader";
import ReportBuilderForm from "@/components/reports/ReportBuilderForm";

export default function ReportBuilderPage() {
    return (
        <ProductShell>
            <div className="w-full max-w-[1440px]">
                <PageHeader
                    title="Create Report"
                    description="Set up a report from a connected advertising account."
                />

                <div className="grid gap-8 xl:grid-cols-[minmax(0,780px)_minmax(260px,1fr)] xl:gap-10">
                    <ReportBuilderForm />

                    <aside className="space-y-5 pt-2 xl:pt-8">
                        <div className="relative rounded-[7px] border border-[#E2E8F0] bg-[#F7F8FF] p-4 text-[12px] leading-5 text-[#4A5568]">
                            Give this report a recognizable internal name. It is only visible
                            to your workspace.
                        </div>

                        <div className="relative rounded-[7px] border border-[#E2E8F0] bg-[#F7F8FF] p-4 text-[12px] leading-5 text-[#4A5568]">
                            Accounts become available after Google Ads has been connected in
                            Data Sources.
                        </div>
                    </aside>
                </div>
            </div>
        </ProductShell>
    );
}