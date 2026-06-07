import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppDialogHeaderProps {
  title: string;
  subtitle?: string;
  onClose?: () => void;
}

export const AppDialogHeader = ({ title, subtitle, onClose }: AppDialogHeaderProps) => {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold font-display">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {onClose && (
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
