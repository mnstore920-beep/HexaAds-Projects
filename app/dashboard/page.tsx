import Link from "next/link";
import { ArrowRight, BarChart3, Database, FileText } from "lucide-react";

const nextSteps = [
  {
    title: "Connect a data source",
    description: "Bring in Google Ads or another supported source to begin collecting performance data.",
    href: "/dashboard/data-sources",
    icon: Database,
  },
  {
    title: "Create a report",
    description: "Choose a report template and select the connected account you want to analyze.",
    href: "/report-builder",
    icon: FileText,
  },
  {
    title: "Explore analytics",
    description: "Compare the metrics from your connected sources once your data is available.",
    href: "/analytics",
    icon: BarChart3,
  },
];

export default function DashboardPage() {
  return (
    <div className="max-w-[1440px]">
      <div className="mb-[72px]">
        <h1 className="text-[36px] font-semibold leading-tight text-black">Dashboard</h1>
        <p className="mt-2 max-w-[680px] text-[17px] text-[#191919]">
          Connect your marketing data to see performance insights and build reports in one place.
        </p>
      </div>

      <section className="border-b border-[#dedede] pb-[54px]" aria-labelledby="dashboard-status-title">
        <div className="flex max-w-[720px] flex-col items-start">
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#eeedff] text-[#5842ec]">
            <BarChart3 size={34} strokeWidth={1.5} />
          </div>
          <h2 id="dashboard-status-title" className="mt-7 text-[26px] font-medium text-black">
            Your dashboard is ready for data
          </h2>
          <p className="mt-3 text-[17px] leading-8 text-[#696969]">
            No performance data is connected yet. Start by adding a data source, then return here to monitor your accounts and campaigns.
          </p>
          <Link
            href="/dashboard/data-sources"
            className="mt-7 inline-flex items-center gap-3 rounded-[9px] bg-[#4b35f5] px-6 py-[14px] text-[17px] font-semibold text-white transition-colors hover:bg-[#3f2bdb]"
          >
            Add data source
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="pt-[52px]" aria-labelledby="next-steps-title">
        <div className="flex items-baseline gap-5">
          <h2 id="next-steps-title" className="text-[25px] font-medium text-black">Get started</h2>
          <span className="text-[17px] text-[#696969]">Next steps</span>
        </div>

        <div className="mt-9 grid max-w-[1240px] grid-cols-1 gap-6 md:grid-cols-3">
          {nextSteps.map(({ title, description, href, icon: Icon }) => (
            <Link
              key={title}
              href={href}
              className="group flex min-h-[188px] flex-col rounded-[9px] border border-[#d2d2d2] bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#eeedff] text-[#5842ec]">
                <Icon size={22} strokeWidth={1.6} />
              </div>
              <h3 className="mt-5 text-[18px] font-medium text-black">{title}</h3>
              <p className="mt-2 text-[14px] leading-6 text-[#696969]">{description}</p>
              <span className="mt-auto flex items-center gap-2 pt-5 text-[14px] font-semibold text-[#5842ec]">
                Open
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
