import { getServerSession } from "next-auth";
import Link from "next/link";
import { Plus } from "lucide-react";

import PageHeader from "@/components/dashboard/PageHeader";
import ProductShell from "@/components/dashboard/ProductShell";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { getReportsForUser } from "@/lib/reports";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);

  let reports = [];

  if (session?.user?.email) {
    const database = await getDatabase(process.env.MONGODB_DB || "hexaads");

    const user = await database.collection("users").findOne({
      email: session.user.email.toLowerCase(),
    });

    if (user?._id) {
      reports = await getReportsForUser(user._id);
    }
  }

  return (
    <ProductShell>
      <div className="w-full max-w-[1440px]">
        <div className="mb-6">
          <PageHeader
            title="Reports"
            description="Create and manage reports for your connected advertising accounts."
          />

          <div className="mt-5 flex justify-end">
            <Link
              href="/report-builder"
              className="inline-flex h-10 items-center gap-2 rounded-[6px] bg-[#1976D2] px-4 text-[13px] font-medium text-white hover:bg-[#1565C0]"
            >
              <Plus size={16} />
              Create report
            </Link>
          </div>
        </div>

        <div className="rounded-[8px] border border-[#E2E8F0] bg-white shadow-sm">
          <div className="border-b border-[#E2E8F0] px-5 py-4">
            <h2 className="text-[16px] font-medium text-[#4A5568]">
              Your reports
            </h2>
          </div>

          {reports.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-[13px] text-[#718096]">
                No reports created yet.
              </p>

              <Link
                href="/report-builder"
                className="mt-4 inline-flex h-9 items-center rounded-[5px] bg-[#1976D2] px-4 text-[12px] font-medium text-white hover:bg-[#1565C0]"
              >
                Create your first report
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#E2E8F0]">
              {reports.map((report) => (
                <div
                  key={report._id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="text-[14px] font-medium text-[#2D3748]">
                      {report.title}
                    </h3>

                    <p className="mt-1 text-[12px] text-[#718096]">
                      {report.internalName}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-[12px] font-medium text-[#4A5568]">
                      {report.googleAdsAccountName}
                    </p>

                    <p className="mt-1 text-[11px] text-[#A0AEC0]">
                      Google Ads · {report.type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProductShell>
  );
}