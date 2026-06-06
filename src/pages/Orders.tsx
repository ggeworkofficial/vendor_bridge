import { useState, useEffect } from "react";
import { Package, Truck, CheckCircle, Clock, XCircle, Loader } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getOrders } from "@/api/order.api";
import { useOrderStore } from "@/features/order/order.store";
import type { OrderStatus } from "@/types/order";

const statusConfig: Record<OrderStatus, { icon: React.ReactNode; color: string; label: string }> = {
  pending: { icon: <Clock className="h-4 w-4" />, color: "bg-muted text-muted-foreground", label: "Pending" },
  confirmed: { icon: <Package className="h-4 w-4" />, color: "bg-primary text-primary-foreground", label: "Confirmed" },
  out_for_delivery: { icon: <Truck className="h-4 w-4" />, color: "bg-secondary text-secondary-foreground", label: "Out for Delivery" },
  delivered: { icon: <CheckCircle className="h-4 w-4" />, color: "bg-success text-success-foreground", label: "Delivered" },
  cancelled: { icon: <XCircle className="h-4 w-4" />, color: "bg-destructive text-destructive-foreground", label: "Cancelled" },
  rejected: { icon: <XCircle className="h-4 w-4" />, color: "bg-destructive text-destructive-foreground", label: "Rejected" },
};

const statusSteps: OrderStatus[] = ["pending", "confirmed", "out_for_delivery", "delivered"];

const Orders = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const setOrders = useOrderStore((s) => s.setOrders);

  const { data: response, isLoading, error, refetch } = useQuery({
    queryKey: ["orders", { page, limit }],
    queryFn: async () => await getOrders({ page, limit }),
    placeholderData: keepPreviousData,
  });

  const orders = response?.data?.data ?? [];
  const meta = response?.data?.meta;

  useEffect(() => {
    setOrders(orders);
  }, [orders, setOrders]);

  if (isLoading && orders.length === 0) {
    return (
      <Layout>
        <div className="container py-20 flex justify-center items-center">
          <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <p className="text-muted-foreground mb-4">Unable to load orders.</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-display font-bold mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <p className="text-muted-foreground text-center py-20">No orders yet.</p>
        ) : (
          <>
            <div className="space-y-6">
              {orders.map((order) => {
                const config = statusConfig[order.status];
                const currentStep = statusSteps.indexOf(order.status as OrderStatus);
                return (
                  <div key={order.id} className="bg-card border rounded-lg p-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-display font-bold text-lg">{order.id}</span>
                        <span className="text-sm text-muted-foreground ml-3">Placed: {new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={config.color + " gap-1"}>{config.icon} {config.label}</Badge>
                        <Badge variant="outline" className="text-xs capitalize">{order.payment_status}</Badge>
                      </div>
                    </div>

                    {/* Progress */}
                    {order.status !== "cancelled" && order.status !== "rejected" && (
                      <div className="flex items-center gap-1">
                        {statusSteps.map((step, i) => (
                          <div key={step} className="flex items-center flex-1">
                            <div className={`h-2 flex-1 rounded-full ${i <= currentStep ? "bg-primary" : "bg-muted"}`} />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-1">
                      {order.products.map((product) => (
                        <div key={product.id} className="flex justify-between text-sm">
                          <span>
                            Product: {product.id.substring(0, 8)}... × {product.quantity}
                          </span>
                          <span>${(Number(product.price) * product.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap justify-between text-sm border-t pt-3">
                      <div className="text-muted-foreground">
                        <span className="capitalize">Payment: {order.payment_method}</span>
                      </div>
                      <span className="font-display font-bold">Total: ${Number(order.total_amount).toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {meta && meta.total > meta.limit && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button disabled={page === 1} onClick={() => setPage((current) => current - 1)}>
                  Prev
                </Button>
                <span className="text-sm">
                  Page {meta.page} of {Math.ceil(meta.total / meta.limit)}
                </span>
                <Button
                  disabled={page * meta.limit >= meta.total}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
