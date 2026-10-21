import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-6 transition-colors dark:border-slate-800 dark:bg-slate-900 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
