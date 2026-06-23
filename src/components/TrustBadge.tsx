import { Badge } from "@/components/ui/badge";
import { Crown, Store } from "lucide-react";
import type { PostedBy } from "@/types/inventory";

interface TrustBadgeProps {
  postedBy: PostedBy;
  sellerName?: string;
  className?: string;
}

export const TrustBadge = ({ postedBy, sellerName, className = "" }: TrustBadgeProps) => {
  if (postedBy === "vendorbridge") {
    return (
      <Badge className={`gap-1 bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-amber-400 ${className}`}>
        <Crown className="h-3 w-3" />
        VendorBridge Curated
      </Badge>
    );
  }

  return (
    <Badge className={`gap-1 bg-gradient-to-r from-slate-400 to-slate-500 text-white border-slate-300 ${className}`}>
      <Store className="h-3 w-3" />
      {sellerName ? `Verified Vendor: ${sellerName}` : "Verified Vendor"}
    </Badge>
  );
};
