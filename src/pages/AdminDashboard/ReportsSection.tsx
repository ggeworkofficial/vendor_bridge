import { DollarSign, ShoppingBag, Users, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { mockProducts } from "@/lib/mock-products";

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

const ReportsSection = () => (
  <div className="space-y-6">
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Monthly Revenue" value="$24,580" change="12% vs last month" icon={DollarSign} />
      <StatCard label="Avg. Order Value" value="$68.40" change="5% increase" icon={ShoppingBag} />
      <StatCard label="Customer Retention" value="78%" change="3% improvement" icon={Users} />
      <StatCard label="Return Rate" value="2.1%" change="0.3% decrease" positive={false} icon={AlertTriangle} />
    </div>
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-card border rounded-lg p-5">
        <h3 className="font-display font-semibold mb-4">Revenue by Category</h3>
        <div className="space-y-3">
          {[
            { name: "Fashion", revenue: "$8,603", pct: 35 },
            { name: "Food & Beverages", revenue: "$6,882", pct: 28 },
            { name: "Home & Living", revenue: "$5,408", pct: 22 },
            { name: "Electronics", revenue: "$3,687", pct: 15 },
          ].map((c) => (
            <div key={c.name} className="space-y-1">
              <div className="flex justify-between text-sm"><span>{c.name}</span><span className="font-medium">{c.revenue}</span></div>
              <Progress value={c.pct} className="h-2" />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-card border rounded-lg p-5">
        <h3 className="font-display font-semibold mb-4">Monthly Trend</h3>
        <div className="space-y-3 text-sm">
          {[
            { month: "January", revenue: "$18,200", orders: 112 },
            { month: "February", revenue: "$19,800", orders: 128 },
            { month: "March", revenue: "$22,100", orders: 145 },
            { month: "April (MTD)", revenue: "$24,580", orders: 156 },
          ].map((m) => (
            <div key={m.month} className="flex items-center justify-between py-2 border-b last:border-0">
              <span>{m.month}</span>
              <div className="flex items-center gap-4"><span className="text-muted-foreground">{m.orders} orders</span><span className="font-semibold w-20 text-right">{m.revenue}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="bg-card border rounded-lg p-5">
      <h3 className="font-display font-semibold mb-4">Top Products</h3>
      <div className="space-y-3">
        {mockProducts.slice(0, 5).map((p, i) => (
          <div key={p.id} className="flex items-center gap-4 py-2 border-b last:border-0">
            <span className="text-lg font-display font-bold text-muted-foreground w-6">#{i + 1}</span>
            <img src={p.images[0]} alt={p.name} className="h-10 w-10 rounded object-cover" />
            <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{p.name}</p><p className="text-xs text-muted-foreground">{p.category}</p></div>
            <div className="text-right"><p className="font-semibold text-sm">${(p.price * (p.reviewCount / 2)).toFixed(0)}</p><p className="text-xs text-muted-foreground">{Math.floor(p.reviewCount / 2)} sold</p></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default ReportsSection;
