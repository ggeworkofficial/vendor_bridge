import { useState } from "react";
import {
  BarChart3, Package, Truck, ShoppingBag, Users, Store,
  AlertTriangle, TrendingUp, Home, MoreHorizontal,
  ChevronLeft, ChevronRight, Receipt, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";
import DashboardSection from "./DashboardSection";
import InventorySection from "./InventorySection";
import CategorySection from "./CategorySection";
import SellerSection from "./SellerSection";
import LogisticsSection from "./LogisticsSection";
import OrdersSection from "./OrdersSection";
import ReceiptsSection from "./ReceiptsSection";
import UsersSection from "./UsersSection";
import PaymentAccountsSection from "./PaymentAccountsSection";
import ContactAdminSection from "./ContactAdminSection";
import ReportsSection from "./ReportsSection";

const sections = [
  { key: "dashboard", label: "Dashboard", icon: BarChart3 },
  { key: "inventory", label: "Inventory", icon: Package },
  { key: "categories", label: "Categories", icon: Receipt },
  { key: "orders", label: "Orders", icon: ShoppingBag },
  { key: "payments", label: "Payments & Receipts", icon: Receipt },
  { key: "logistics", label: "Logistics", icon: Truck },
  { key: "users", label: "Users", icon: Users },
  { key: "sellers", label: "Sellers", icon: Store },
// Temporarily disabled - Complaints page not implemented yet.
  // { key: "complaints", label: "Complaints", icon: AlertTriangle },
  { key: "contact", label: "Contact & Social", icon: Globe },
  { key: "reports", label: "Reports", icon: TrendingUp },
];

const AdminDashboard = () => {
  const [active, setActive] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sectionContent: Record<string, React.ReactNode> = {
    dashboard: <DashboardSection />,
    inventory: <InventorySection />,
    categories: <CategorySection />,
    orders: <OrdersSection />,
    payments: (
      <div className="space-y-6">
        <PaymentAccountsSection />
        <ReceiptsSection />
      </div>
    ),
    logistics: <LogisticsSection />,
    users: <UsersSection />,
    sellers: <SellerSection />,
    // complaints: <ComplaintsSection />,
    contact: <ContactAdminSection />,
    reports: <ReportsSection />,
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-card border-r flex flex-col transition-all duration-300 ${
          collapsed ? "w-[68px]" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 p-4 border-b h-16 shrink-0">
          <img src={logo} alt="VendorBridge" className="h-8 w-8 shrink-0" width={32} height={32} />
          {!collapsed && <span className="font-display font-bold text-sm whitespace-nowrap">Admin Panel</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => { setActive(s.key); setMobileOpen(false); }}
              title={collapsed ? s.label : undefined}
              className={`flex items-center gap-3 w-full rounded-md text-sm font-medium transition-colors ${
                collapsed ? "px-2 py-2.5 justify-center" : "px-3 py-2.5"
              } ${
                active === s.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <s.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{s.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-2 border-t space-y-1">
          <Button variant="ghost" size="sm" asChild className={`w-full ${collapsed ? "justify-center px-2" : "justify-start"}`}>
            <Link to="/">
              <Home className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="ml-2">Back to Store</span>}
            </Link>
          </Button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center gap-2 w-full px-3 py-2 rounded-md text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors justify-center"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>Collapse</span></>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-foreground/30 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main */}
      <div className={`flex-1 min-w-0 transition-all duration-300 ${collapsed ? "lg:ml-[68px]" : "lg:ml-64"}`}>
        <header className="sticky top-0 z-30 border-b bg-card/80 backdrop-blur-lg px-6 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <MoreHorizontal className="h-5 w-5" />
          </Button>
          <h1 className="font-display font-bold text-lg capitalize">{sections.find(s => s.key === active)?.label || active}</h1>
          <Badge className="ml-auto bg-success text-success-foreground">System Online</Badge>
        </header>

        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {sectionContent[active]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
