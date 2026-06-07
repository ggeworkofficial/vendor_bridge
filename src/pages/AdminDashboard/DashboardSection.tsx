import { DollarSign, ShoppingBag, Package, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const StatCard = ({ label, value, change, positive = true, icon: Icon }: { label: string; value: string; change: string; positive?: boolean; icon?: React.ElementType }) => (
  <div className="bg-card border rounded-lg p-5">
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">{label}</p>
      {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
    </div>
    <p className="text-2xl font-display font-bold mt-1">{value}</p>
    <p className={`text-xs mt-1 flex items-center gap-1 ${positive ? "text-success" : "text-destructive"}`}>
      {positive ? <span className="text-success">▲</span> : <span className="text-destructive">▼</span>}
      {change}
    </p>
  </div>
);

const DashboardSection = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard label="Total Revenue" value="$24,580" change="12% this month" icon={DollarSign} />
      <StatCard label="Active Orders" value="156" change="8% this week" icon={ShoppingBag} />
      <StatCard label="Total Products" value="432" change="12 pending review" icon={Package} />
      <StatCard label="Registered Users" value="1,847" change="23 today" icon={Users} />
    </div>
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-card border rounded-lg p-5">
        <h3 className="font-display font-semibold mb-4">Recent Orders</h3>
        <div className="space-y-3 text-sm">
          {/* Orders will be fetched from backend */}
        </div>
      </div>
      <div className="bg-card border rounded-lg p-5">
        <h3 className="font-display font-semibold mb-4">Pending Actions</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2 border-b"><span>Products awaiting verification</span><Badge>5</Badge></div>
          <div className="flex items-center justify-between py-2 border-b"><span>Receipts pending review</span><Badge variant="destructive">0</Badge></div>
          <div className="flex items-center justify-between py-2 border-b"><span>Unresolved complaints</span><Badge variant="destructive">2</Badge></div>
          <div className="flex items-center justify-between py-2"><span>Seller verification requests</span><Badge>4</Badge></div>
        </div>
      </div>
    </div>
  </div>
);

export default DashboardSection;
