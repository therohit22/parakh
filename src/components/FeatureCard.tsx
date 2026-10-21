import React from "react";
import Card from "@/components/ui/Card";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function FeatureCard({
  title,
  description,
  icon,
}: FeatureCardProps) {
  return (
    <Card>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-gray-500 dark:text-slate-400">
        {description}
      </p>
    </Card>
  );
}
