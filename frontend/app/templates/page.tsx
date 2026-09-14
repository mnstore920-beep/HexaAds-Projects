import ProductShell from "@/components/dashboard/ProductShell";
import TemplateCard from "@/components/reports/TemplateCard";
import TemplateFilters from "@/components/reports/TemplateFilters";

const templates = [
  {
    title: "Monthly SEO report",
    description:
      "Track your monthly SEO performance with key metrics, trends, and actionable insights.",
    tags: [
      { label: "SEO", color: "#F47A13" },
      { label: "Monthly", color: "#66C127" },
    ],
  },
  {
    title: "Meta report",
    description:
      "Review your Meta advertising performance, campaign results, and important account metrics.",
    tags: [
      { label: "Meta", color: "#6F72F2" },
      { label: "Ads", color: "#000000" },
    ],
  },
  {
    title: "Google Ads report",
    description:
      "Analyze Google Ads performance with campaign metrics, conversions, spend, and key insights.",
    tags: [
      { label: "Google Ads", color: "#F47A13" },
      { label: "Performance", color: "#66C127" },
    ],
  },
  {
    title: "Monthly SEO report",
    description:
      "Track your monthly SEO performance with key metrics, trends, and actionable insights.",
    tags: [
      { label: "SEO", color: "#F47A13" },
      { label: "Monthly", color: "#66C127" },
    ],
  },
  {
    title: "Meta report",
    description:
      "Review your Meta advertising performance, campaign results, and important account metrics.",
    tags: [
      { label: "Meta", color: "#6F72F2" },
      { label: "Ads", color: "#000000" },
    ],
  },
  {
    title: "Google Ads report",
    description:
      "Analyze Google Ads performance with campaign metrics, conversions, spend, and key insights.",
    tags: [
      { label: "Google Ads", color: "#F47A13" },
      { label: "Performance", color: "#66C127" },
    ],
  },
  {
    title: "Google Ads report",
    description:
      "Analyze Google Ads performance with campaign metrics, conversions, spend, and key insights.",
    tags: [
      { label: "Google Ads", color: "#F47A13" },
      { label: "Performance", color: "#66C127" },
    ],
  },
];

export default function TemplatesPage() {
  return (
    <ProductShell>
      <div className="w-full">
        <div className="mb-8">
          <h1 className="font-['Montserrat'] text-[36px] font-semibold leading-[44px] text-black">
            Template Catalog
          </h1>

          <p className="mt-3 font-['Poppins'] text-[17px] font-light leading-[25px] text-[#555555]">
            Start with a proven reporting structure, then customize it for your connected account.
          </p>
        </div>

        <section>
          <TemplateFilters templates={templates} />
        </section>
      </div>
    </ProductShell>
  );
}
