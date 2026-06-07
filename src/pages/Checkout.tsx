import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Building2, Smartphone, Upload, CheckCircle2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { useCart } from "@/lib/cart-context";
import { mockPaymentAccounts } from "@/lib/contact-data";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { createOrder } from "@/api/order.api";
import { createReceipt } from "@/api/receipt.api";
import { useOrderStore } from "@/features/order/order.store";

type PaymentMethod = "cod" | "advance" | "full";

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const addOrder = useOrderStore((state) => state.addOrder);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptAccount, setReceiptAccount] = useState("");
  const [receiptNote, setReceiptNote] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [zip, setZip] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onload = () => setReceiptPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Account number copied to clipboard." });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((paymentMethod === "advance" || paymentMethod === "full") && !receiptFile) {
      toast({ title: "Receipt Required", description: "Please upload your payment receipt.", variant: "destructive" });
      return;
    }

    if (!addressLine.trim() || !city.trim() || !region.trim()) {
      toast({ title: "Address Required", description: "Please provide a complete delivery address.", variant: "destructive" });
      return;
    }

    setLoading(true);

    const address = [addressLine.trim(), city.trim(), region.trim(), zip.trim()].filter(Boolean).join(", ");
    const products = items.map((item) => ({ product_id: item.product.id, quantity: item.quantity }));

    try {
      // Step 1: Create the order
      const { data: orderData } = await createOrder({ products, payment_method: paymentMethod, address });
      addOrder(orderData);

      // Step 2: Create receipt if payment method is not COD
      if (paymentMethod !== "cod" && receiptFile) {
        try {
          const formData = new FormData();
          formData.append("order_id", orderData.id);
          formData.append("account", receiptAccount);
          formData.append("note", receiptNote);
          formData.append("images", receiptFile);
          
          await createReceipt(formData);
          
          // Success: clear cart and redirect
          clearCart();
          toast({ title: "Order Placed! 🎉", description: "Your order and receipt have been submitted for review." });
          navigate("/orders");
        } catch (receiptError: any) {
          // Receipt creation failed: show error, don't clear cart, don't redirect
          const receiptMessage = receiptError?.response?.data?.message || receiptError?.message || "Unable to upload receipt.";
          toast({ title: "Receipt Upload Failed", description: `Order created but receipt upload failed: ${receiptMessage}. Please try again or contact support.`, variant: "destructive" });
          // Don't clear cart or redirect so user can try again
        }
      } else {
        // COD payment: clear cart and redirect immediately
        clearCart();
        toast({ title: "Order Placed! 🎉", description: "Your order has been confirmed. Track it in Orders." });
        navigate("/orders");
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Unable to place order.";
      toast({ title: "Order failed", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Button asChild className="mt-4"><Link to="/">Go Shopping</Link></Button>
        </div>
      </Layout>
    );
  }

  const advanceAmount = (total * 0.3).toFixed(2);

  return (
    <Layout>
      <div className="container py-8 max-w-2xl">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/cart"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Cart</Link>
        </Button>
        <h1 className="text-3xl font-display font-bold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Delivery Address */}
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <h3 className="font-display font-semibold">Delivery Address</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Full Name</Label><Input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" /></div>
              <div><Label>Phone</Label><Input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+251 911 000 000" /></div>
            </div>
            <div><Label>Address</Label><Input required value={addressLine} onChange={(e) => setAddressLine(e.target.value)} placeholder="123 Bole Road" /></div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div><Label>City</Label><Input required value={city} onChange={(e) => setCity(e.target.value)} placeholder="Addis Ababa" /></div>
              <div><Label>State/Region</Label><Input required value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Addis Ababa" /></div>
              <div><Label>Zip</Label><Input value={zip} onChange={(e) => setZip(e.target.value)} placeholder="1000" /></div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <h3 className="font-display font-semibold">Payment Method</h3>

            <div className="grid gap-3">
              {/* Cash on Delivery */}
              <label
                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="sr-only"
                />
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "cod" ? "border-primary" : "border-muted-foreground/50"}`}>
                  {paymentMethod === "cod" && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                </div>
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Cash on Delivery</p>
                  <p className="text-xs text-muted-foreground">Pay when your order arrives</p>
                </div>
              </label>

              {/* Advance Payment (30%) */}
              <label
                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  paymentMethod === "advance" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="advance"
                  checked={paymentMethod === "advance"}
                  onChange={() => setPaymentMethod("advance")}
                  className="sr-only"
                />
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "advance" ? "border-primary" : "border-muted-foreground/50"}`}>
                  {paymentMethod === "advance" && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                </div>
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Advance Payment (30%)</p>
                  <p className="text-xs text-muted-foreground">Pay ${advanceAmount} now, rest on delivery</p>
                </div>
                <Badge variant="outline" className="text-xs">${advanceAmount}</Badge>
              </label>

              {/* Full Payment */}
              <label
                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  paymentMethod === "full" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="full"
                  checked={paymentMethod === "full"}
                  onChange={() => setPaymentMethod("full")}
                  className="sr-only"
                />
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "full" ? "border-primary" : "border-muted-foreground/50"}`}>
                  {paymentMethod === "full" && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                </div>
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Full Payment</p>
                  <p className="text-xs text-muted-foreground">Pay the full amount in advance</p>
                </div>
                <Badge variant="outline" className="text-xs">${total.toFixed(2)}</Badge>
              </label>
            </div>

            {/* Bank / Telebirr account details */}
            {(paymentMethod === "advance" || paymentMethod === "full") && (
              <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="bg-accent/50 rounded-lg p-4">
                  <p className="text-sm font-medium mb-1">
                    Transfer {paymentMethod === "advance" ? `$${advanceAmount} (30%)` : `$${total.toFixed(2)} (Full)`} to one of the accounts below:
                  </p>
                  <p className="text-xs text-muted-foreground">After payment, upload a screenshot of your receipt.</p>
                </div>

                <div className="space-y-3">
                  {mockPaymentAccounts.map((acc) => (
                    <div key={acc.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {acc.type === "bank" ? <Building2 className="h-4 w-4 text-primary" /> : <Smartphone className="h-4 w-4 text-secondary" />}
                          <span className="font-medium text-sm">{acc.label}</span>
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">{acc.type.replace("_", " ")}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Account Name</p>
                          <p className="font-medium">{acc.accountName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Account Number</p>
                          <div className="flex items-center gap-1">
                            <p className="font-medium font-mono">{acc.accountNumber}</p>
                            <button type="button" onClick={() => copyToClipboard(acc.accountNumber)} className="text-muted-foreground hover:text-primary">
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                      {acc.details && <p className="text-xs text-muted-foreground">{acc.details}</p>}
                    </div>
                  ))}
                </div>

                {/* Receipt Upload */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-semibold">Upload Payment Receipt *</Label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        receiptPreview ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      {receiptPreview ? (
                        <div className="space-y-2">
                          <CheckCircle2 className="h-8 w-8 text-primary mx-auto" />
                          <p className="text-sm font-medium text-primary">{receiptFile?.name}</p>
                          {receiptPreview.startsWith("data:image") && (
                            <img src={receiptPreview} alt="Receipt" className="max-h-32 mx-auto rounded-md" />
                          )}
                          <p className="text-xs text-muted-foreground">Click to change</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                          <p className="text-sm text-muted-foreground">Click to upload receipt (image or PDF)</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Optional Account Field */}
                  <div className="space-y-1">
                    <Label>Account Used (Optional)</Label>
                    <Input 
                      value={receiptAccount} 
                      onChange={(e) => setReceiptAccount(e.target.value)} 
                      placeholder="e.g., CBE Birr - 1000123456789"
                    />
                  </div>
                  
                  {/* Optional Note Field */}
                  <div className="space-y-1">
                    <Label>Note (Optional)</Label>
                    <Textarea 
                      value={receiptNote} 
                      onChange={(e) => setReceiptNote(e.target.value)} 
                      placeholder="Add any additional information about your payment..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-card border rounded-lg p-6 space-y-3">
            <h3 className="font-display font-semibold">Order Summary</h3>
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span>{item.product.name} × {item.quantity}</span>
                <span>${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              {paymentMethod === "advance" && (
                <>
                  <div className="flex justify-between text-sm text-primary font-medium">
                    <span>Advance (30%)</span>
                    <span>${advanceAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Due on Delivery</span>
                    <span>${(total - parseFloat(advanceAmount)).toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between font-display font-bold text-lg pt-1">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Placing Order..." : "Place Order"}
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default Checkout;
