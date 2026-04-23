import { Badge } from "@/components/ui/badge";
import { QualityLabel } from "@/lib/types";
import { Shield } from "lucide-react";

const qualityConfig: Record<QualityLabel, { label: string; className: string }> = {
  high: { label: "Premium Quality", className: "bg-success text-success-foreground" },
  medium: { label: "Standard Quality", className: "bg-warning text-warning-foreground" },
  low: { label: "Basic Quality", className: "bg-destructive text-destructive-foreground" },
};

const QualityBadge = ({ quality }: { quality: QualityLabel }) => {
  const config = qualityConfig[quality];
  return (
    <Badge className={config.className + " gap-1"}>
      <Shield className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

export default QualityBadge;
