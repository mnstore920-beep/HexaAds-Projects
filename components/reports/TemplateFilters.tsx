"use client";

import { useMemo, useState } from "react";
import TemplateCard from "@/components/reports/TemplateCard";

type Template = {
    title: string;
    description: string;
    tags: {
        label: string;
        color: string;
    }[];
};

type TemplateFiltersProps = {
    templates: Template[];
};

export default function TemplateFilters({
    templates,
}: TemplateFiltersProps) {
    const [source, setSource] = useState("");
    const [type, setType] = useState("");
    const [category, setCategory] = useState("");
    const [search, setSearch] = useState("");

    const filteredTemplates = useMemo(() => {
        return templates.filter((template) => {
            const searchableText = [
                template.title,
                template.description,
                ...template.tags.map((tag) => tag.label),
            ]
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                search.trim() === "" ||
                searchableText.includes(search.trim().toLowerCase());

            const matchesSource =
                source === "" ||
                template.tags.some(
                    (tag) => tag.label.toLowerCase() === source.toLowerCase(),
                );

            const matchesType =
                type === "" ||
                template.tags.some(
                    (tag) => tag.label.toLowerCase() === type.toLowerCase(),
                );

            const matchesCategory =
                category === "" ||
                template.tags.some(
                    (tag) => tag.label.toLowerCase() === category.toLowerCase(),
                );

            return (
                matchesSearch &&
                matchesSource &&
                matchesType &&
                matchesCategory
            );
        });
    }, [templates, source, type, category, search]);

    return (
        <>
            <div className="flex items-center justify-between gap-6">
                <div className="shrink-0 font-['Poppins'] text-[24px] font-normal leading-[40px] text-black">
                    {filteredTemplates.length} Templates
                </div>

                <div className="flex items-center gap-4">
                    <select
                        value={source}
                        onChange={(event) => setSource(event.target.value)}
                        className="h-[56px] w-[190px] rounded-[10px] border border-[#ACACAC] bg-white px-5 font-['Poppins'] text-[17px] font-light text-[#ACACAC] outline-none"
                    >
                        <option value="">Source</option>
                        <option value="Google Ads">Google Ads</option>
                        <option value="Meta">Meta</option>
                        <option value="SEO">SEO</option>
                    </select>

                    <select
                        value={type}
                        onChange={(event) => setType(event.target.value)}
                        className="h-[56px] w-[190px] rounded-[10px] border border-[#ACACAC] bg-white px-5 font-['Poppins'] text-[17px] font-light text-[#ACACAC] outline-none"
                    >
                        <option value="">Type</option>
                        <option value="Performance">Performance</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Campaign">Campaign</option>
                    </select>

                    <select
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        className="h-[56px] w-[190px] rounded-[10px] border border-[#ACACAC] bg-white px-5 font-['Poppins'] text-[17px] font-light text-[#ACACAC] outline-none"
                    >
                        <option value="">Category</option>
                        <option value="Ads">Ads</option>
                        <option value="SEO">SEO</option>
                        <option value="Social Media">Social Media</option>
                    </select>

                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search"
                        className="h-[56px] w-[190px] rounded-[10px] border border-[#ACACAC] bg-white px-5 font-['Poppins'] text-[17px] font-light text-[#555555] outline-none placeholder:text-[#ACACAC]"
                    />
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 justify-items-center gap-x-[33px] gap-y-[86px] md:grid-cols-2 xl:grid-cols-3">
                {filteredTemplates.map((template, index) => (
                    <TemplateCard
                        key={`${template.title}-${index}`}
                        title={template.title}
                        description={template.description}
                        tags={template.tags}
                    />
                ))}
            </div>
        </>
    );
}