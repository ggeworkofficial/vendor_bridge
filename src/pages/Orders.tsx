import { Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { mockOrders } from "@/lib/mock-data";
import { OrderStatus } from "@/lib/types";

const statusConfig: Record<OrderStatus, { icon: React.ReactNode; color: string; label: string }> = {
  pending: { icon: <Clock className="h-4 w-4" />, color: "bg-muted text-muted-foreground", label: "Pending" },
  confirmed: { icon: <Package className="h-4 w-4" />, color: "bg-primary text-primary-foreground", label: "Confirmed" },
  out_for_delivery: { icon: <Truck className="h-4 w-4" />, color: "bg-secondary text-secondary-foreground", label: "Out for Delivery" },
  delivered: { icon: <CheckCircle className="h-4 w-4" />, color: "bg-success text-success-foreground", label: "Delivered" },
  cancelled: { icon: <XCircle className="h-4 w-4" />, color: "bg-destructive text-destructive-foreground", label: "Cancelled" },
};

const statusSteps: OrderStatus[] = ["pending", "confirmed", "out_for_delivery", "delivered"];

const Orders = () => (
  <Layout>
    <div className="container py-8">
      <h1 className="text-3xl font-display font-bold mb-8">My Orders</h1>

      {mockOrders.length === 0 ? (
        <p className="text-muted-foreground text-center py-20">No orders yet.</p>
      ) : (
        <div className="space-y-6">
          {mockOrders.map((order) => {
            const config = statusConfig[order.status];
            const currentStep = statusSteps.indexOf(order.status);
            return (
              <div key={order.id} className="bg-card border rounded-lg p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-display font-bold text-lg">{order.id}</span>
                    <span className="text-sm text-muted-foreground ml-3">Placed: {order.createdAt}</span>
                  </div>
                  <Badge className={config.color + " gap-1"}>{config.icon} {config.label}</Badge>
                </div>

                {/* Progress */}
                {order.status !== "cancelled" && (
                  <div className="flex items-center gap-1">
                    {statusSteps.map((step, i) => (
                      <div key={step} className="flex items-center flex-1">
                        <div className={`h-2 flex-1 rounded-full ${i <= currentStep ? "bg-primary" : "bg-muted"}`} />
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-1">
                  {order.items.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <span>{item.product.name} × {item.quantity}</span>
                      <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap justify-between text-sm border-t pt-3">
                  <span className="text-muted-foreground">Est. delivery: {order.estimatedDelivery}</span>
                  <span className="font-display font-bold">Total: ${order.total.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </Layout>
);

export default Orders;
