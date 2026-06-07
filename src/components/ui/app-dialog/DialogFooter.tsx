import React from "react";
import { Button } from "@/components/ui/button";

interface AppDialogFooterProps {
  primaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const AppDialogFooter = ({ primaryAction, secondaryAction, className }: AppDialogFooterProps) => {
  return (
    <div className={`flex items-center justify-end gap-2 mt-6 pt-4 border-t ${className || ""}`}>
      {secondaryAction && (
        <Button variant="outline" onClick={secondaryAction.onClick}>
          {secondaryAction.label}
        </Button>
      )}
      {primaryAction && (
        <Button 
          variant={primaryAction.variant || "default"} 
          onClick={primaryAction.onClick} 
          disabled={primaryAction.disabled || primaryAction.loading}
        >
          {primaryAction.loading ? "Loading..." : primaryAction.label}
        </Button>
      )}
    </div>
  );
};
