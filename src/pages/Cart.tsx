import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { useCart } from "@/lib/cart-context";
import { motion } from "framer-motion";

const Cart = () => {
  const { items, updateQuantity, removeItem, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-2xl font-display font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Browse our marketplace to find great products.</p>
          <Button asChild><Link to="/">Continue Shopping</Link></Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> Continue Shopping</Link>
        </Button>

        <h1 className="text-3xl font-display font-bold mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, i) => (
              <motion.div
                key={item.product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-4 bg-card border rounded-lg p-4"
              >
                <div className="h-20 w-20 bg-muted rounded flex items-center justify-center shrink-0">
                  <span className="text-2xl font-display font-bold text-muted-foreground/20">
                    {item.product.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.product.id}`} className="font-display font-semibold hover:text-primary transition-colors line-clamp-1">
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{item.product.location}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="font-medium w-6 text-center">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive ml-auto" onClick={() => removeItem(item.product.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-display font-bold">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-card border rounded-lg p-6 h-fit space-y-4">
            <h3 className="font-display font-bold text-lg">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="text-success">Free</span>
              </div>
            </div>
            <div className="border-t pt-4 flex justify-between font-display font-bold text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <Button className="w-full" size="lg" asChild>
              <Link to="/checkout">Proceed to Checkout</Link>
            </Button>
            <Button variant="ghost" size="sm" className="w-full text-destructive" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
