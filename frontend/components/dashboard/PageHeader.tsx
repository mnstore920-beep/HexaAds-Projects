export default function PageHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-14 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between ${className ?? ""}`}>
      <div>
        <h1 className="text-[32px] font-semibold leading-tight tracking-[-0.03em] text-black sm:text-[36px]">{title}</h1>
        <p className="mt-2 max-w-3xl text-[15px] leading-6 text-[#5f5f68] sm:text-[17px]">{description}</p>
      </div>
      {action}
    </div>
  );
}
