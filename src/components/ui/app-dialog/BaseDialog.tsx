import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface BaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
}

const maxWidthClasses: Record<NonNullable<BaseDialogProps["maxWidth"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
};

export const BaseDialog = ({ open, onOpenChange, children, className, maxWidth = "lg" }: BaseDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${maxWidthClasses[maxWidth]} ${className || ""}`}>
        {children}
      </DialogContent>
    </Dialog>
  );
};
