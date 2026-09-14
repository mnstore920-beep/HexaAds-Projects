import Link from "next/link";

type TemplateCardProps = {
  title: string;
  description: string;
  tags: {
    label: string;
    color: string;
  }[];
  image?: string;
};

export default function TemplateCard({
  title,
  description,
  tags,
  image,
}: TemplateCardProps) {
  return (
    <article className="w-full max-w-[430px] rounded-[20px] border-[0.5px] border-[#6F72F2] bg-white p-[29px]">
      <div className="h-[232px] w-full overflow-hidden rounded-[10px] bg-[#EEEEFB]">
        {image ? (
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[16px] text-[#ACACAC]">
            Google Ads Report
          </div>
        )}
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-['Poppins'] text-[24px] font-normal leading-[40px] text-[#000000]">
            {title}
          </h2>

          <Link
            href="#"
            className="shrink-0 font-['Poppins'] text-[14px] font-light leading-[21px] text-[#6F72F2] underline"
          >
            Preview
          </Link>
        </div>

        <p className="mt-1 min-h-[75px] font-['Poppins'] text-[17px] font-light leading-[25px] text-[#555555]">
          {description}
        </p>

        <div className="mt-4 flex min-h-[22px] flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={`${ tag.label } -${ index }`}
              className="inline-flex h-[22px] items-center justify-center rounded-[11px] px-3 font-['Poppins'] text-[14px] font-light leading-[21px] text-[#FAFAFA]"
              style={{ backgroundColor: tag.color }}
            >
              {tag.label}
            </span>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            className="h-[36px] w-[140px] rounded-[10px] bg-[#4F39F6] font-['Montserrat'] text-[14px] font-semibold leading-[17px] text-[#FAFAFA]"
          >
            Use Template
          </button>
        </div>
      </div>
    </article>
  );
}