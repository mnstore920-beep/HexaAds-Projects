import Link from "next/link";
import { type LucideIcon } from "lucide-react";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; href: string };
}) {
  return (
    <section className="rounded-[28px] border border-[#ecebf3] bg-[#fafaff] px-6 py-14 text-center sm:px-12">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eeedff] text-[#4b35f5]"><Icon size={26} strokeWidth={1.6} /></div>
      <h2 className="mt-5 text-[22px] font-medium text-[#202024]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-[15px] leading-6 text-[#696969]">{description}</p>
      {action && <Link href={action.href} className="mt-7 inline-flex rounded-[9px] bg-[#4b35f5] px-5 py-3 text-[15px] font-semibold text-white hover:bg-[#4231d6]">{action.label}</Link>}
    </section>
  );
}
