"use client";

import { ClassicLayout } from "@/components/resume-layouts/classic-layout";
import { MinimalLayout } from "@/components/resume-layouts/minimal-layout";
import { ModernLayout } from "@/components/resume-layouts/modern-layout";

export function ResumePreview({ data, layout = "modern" }) {
  const renderLayout = () => {
    switch (layout) {
      case "modern":
        return <ModernLayout data={data} />;
      case "classic":
        return <ClassicLayout data={data} />;
      case "minimal":
        return <MinimalLayout data={data} />;
      default:
        return <ModernLayout data={data} />;
    }
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-[800px] rounded-lg border bg-white p-8 shadow-sm text-gray-900">
        {renderLayout()}
      </div>
    </div>
  );
}
