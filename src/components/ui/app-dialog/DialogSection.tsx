import React from "react";

interface AppDialogSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const AppDialogSection = ({ title, children, className }: AppDialogSectionProps) => {
  return (
    <div className={`space-y-4 ${className || ""}`}>
      {title && <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</h3>}
      {children}
    </div>
  );
};
