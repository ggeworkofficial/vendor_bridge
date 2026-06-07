import { useState } from "react";
import { Search, Plus, Eye, Receipt, CheckCircle, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BaseDialog, AppDialogHeader, AppDialogFooter, AppDialogSection } from "@/components/ui/app-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getReceipts, getReceipt, createReceipt, updateReceipt } from "@/api/receipt.api";
import { useReceiptStore } from "@/features/receipt.store";
import { useToast } from "@/hooks/use-toast";
import { keepPreviousData } from "@tanstack/react-query";

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    active: "bg-success/10 text-success border-success/20",
    suspended: "bg-destructive/10 text-destructive border-destructive/20",
    open: "bg-warning/10 text-warning border-warning/20",
    investigating: "bg-primary/10 text-primary border-primary/20",
    resolved: "bg-success/10 text-success border-success/20",
    confirmed: "bg-primary/10 text-primary border-primary/20",
    pending: "bg-warning/10 text-warning border-warning/20",
    delivered: "bg-success/10 text-success border-success/20",
    out_for_delivery: "bg-secondary/10 text-secondary border-secondary/20",
    cancelled: "bg-destructive/10 text-destructive border-destructive/20",
    in_transit: "bg-primary/10 text-primary border-primary/20",
    processing: "bg-warning/10 text-warning border-warning/20",
    paid: "bg-success/10 text-success border-success/20",
    unpaid: "bg-destructive/10 text-destructive border-destructive/20",
    verified: "bg-success/10 text-success border-success/20",
    pending_review: "bg-warning/10 text-warning border-warning/20",
    approved: "bg-success/10 text-success border-success/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return (
    <Button variant="outline" className={`text-xs capitalize ${styles[status] || ""}`}>
      {status.replace(/_/g, " ")}
    </Button>
  );
};

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

const ReceiptsSection = () => {
  const [receiptSearch, setReceiptSearch] = useState("");
  const [receiptStatus, setReceiptStatus] = useState<"all" | "pending_review" | "approved" | "rejected">("all");
  const [receiptMethod, setReceiptMethod] = useState<"all" | "full" | "advance" | "cod">("all");
  const [receiptPage, setReceiptPage] = useState(1);
  const [receiptLimit] = useState(10);
  const [isReceiptViewOpen, setIsReceiptViewOpen] = useState(false);
  const [isReceiptUploadOpen, setIsReceiptUploadOpen] = useState(false);
  const [isReceiptCreating, setIsReceiptCreating] = useState(false);
  const [isReceiptSaving, setIsReceiptSaving] = useState(false);
  const [receiptUploadOrderId, setReceiptUploadOrderId] = useState("");
  const [receiptUploadAccount, setReceiptUploadAccount] = useState("");
  const [receiptUploadNote, setReceiptUploadNote] = useState("");
  const [receiptUploadFile, setReceiptUploadFile] = useState<File | null>(null);
  const [receiptEditStatus, setReceiptEditStatus] = useState<"pending_review" | "approved" | "rejected">("pending_review");
  const [receiptEditNote, setReceiptEditNote] = useState("");

  const selectedReceipt = useReceiptStore((state) => state.selectedReceipt);
  const setReceipts = useReceiptStore((state) => state.setReceipts);
  const setSelectedReceipt = useReceiptStore((state) => state.setSelectedReceipt);
  const addReceipt = useReceiptStore((state) => state.addReceipt);
  const updateReceiptInStore = useReceiptStore((state) => state.updateReceipt);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const useReceiptsQuery = (params: any) =>
    useQuery({
      queryKey: ["receipts", params],
      queryFn: async () => await getReceipts(params),
      placeholderData: keepPreviousData,
    });

  const receiptStatusParam = receiptStatus === "all" ? undefined : receiptStatus;
  const receiptMethodParam = receiptMethod === "all" ? undefined : receiptMethod;

  const receiptsResponse = useReceiptsQuery({
    page: receiptPage,
    limit: receiptLimit,
    ...(receiptSearch ? { search: receiptSearch } : {}),
    ...(receiptStatusParam ? { status: receiptStatusParam } : {}),
    ...(receiptMethodParam ? { payment_method: receiptMethodParam } : {}),
    sort: "created_at",
    order: "desc",
  });
  const receipts = receiptsResponse.data?.data?.data ?? [];
  const receiptMeta = receiptsResponse.data?.data?.meta;

  const pendingCount = receipts.filter((receipt) => receipt.status === "pending_review").length;
  const approvedCount = receipts.filter((receipt) => receipt.status === "approved").length;
  const totalCollected = receipts.reduce((sum, receipt) => sum + Number(receipt.amount || "0"), 0);

  const loadReceipt = async (id: string) => {
    try {
      const { data } = await getReceipt(id);
      setSelectedReceipt(data);
      setReceiptEditStatus(data.status);
      setReceiptEditNote(data.note);
      setIsReceiptViewOpen(true);
    } catch (error) {
      toast({ title: "Unable to load receipt", description: "Failed to retrieve receipt details.", variant: "destructive" });
    }
  };

  const handleCreateReceipt = async () => {
    if (!receiptUploadOrderId || !receiptUploadAccount || !receiptUploadFile) {
      toast({ title: "Validation error", description: "Order, account and image are required.", variant: "destructive" });
      return;
    }
    setIsReceiptCreating(true);
    try {
      const formData = new FormData();
      formData.append("order_id", receiptUploadOrderId);
      formData.append("account", receiptUploadAccount);
      formData.append("note", receiptUploadNote);
      formData.append("images", receiptUploadFile);
      const { data } = await createReceipt(formData);
      addReceipt(data);
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      toast({ title: "Receipt uploaded" });
      setIsReceiptUploadOpen(false);
      setReceiptUploadOrderId("");
      setReceiptUploadAccount("");
      setReceiptUploadNote("");
      setReceiptUploadFile(null);
    } catch (error) {
      toast({ title: "Upload failed", description: "Unable to upload receipt.", variant: "destructive" });
    } finally {
      setIsReceiptCreating(false);
    }
  };

  const handleSaveReceipt = async () => {
    if (!selectedReceipt) return;
    setIsReceiptSaving(true);
    try {
      const { data } = await updateReceipt(selectedReceipt.id, {
        status: receiptEditStatus,
        note: receiptEditNote,
      });
      updateReceiptInStore(data);
      setSelectedReceipt(data);
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      toast({ title: "Receipt updated" });
      setIsReceiptViewOpen(false);
    } catch (error) {
      toast({ title: "Update failed", description: "Unable to save receipt.", variant: "destructive" });
    } finally {
      setIsReceiptSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Pending Review" value={String(pendingCount)} change="Needs attention" positive={false} icon={Receipt} />
        <StatCard label="Approved" value={String(approvedCount)} change="This week" icon={CheckCircle} />
        <StatCard label="Total Collected" value={`$${totalCollected.toFixed(2)}`} change="From receipts" icon={DollarSign} />
      </div>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start">
          <h3 className="font-display font-semibold">Uploaded Receipts</h3>
          <Button variant="secondary" onClick={() => setIsReceiptUploadOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Upload Receipt
          </Button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={receiptSearch} onChange={(e) => setReceiptSearch(e.target.value)} className="pl-9" placeholder="Search receipts..." />
          </div>
          <Select value={receiptStatus} onValueChange={(v) => setReceiptStatus(v as any)}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending_review">Pending Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={receiptMethod} onValueChange={(v) => setReceiptMethod(v as any)}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="full">Full</SelectItem>
              <SelectItem value="advance">Advance</SelectItem>
              <SelectItem value="cod">Cash on Delivery</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt ID</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-medium">{receipt.id}</TableCell>
                  <TableCell className="font-medium">{receipt.order.id}</TableCell>
                  <TableCell>{receipt.order.user.full_name}</TableCell>
                  <TableCell className="font-medium">${receipt.amount}</TableCell>
                  <TableCell><Button variant="outline" className="text-xs capitalize">{receipt.payment_method}</Button></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{receipt.account}</TableCell>
                  <TableCell><StatusBadge status={receipt.status} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{receipt.created_at}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => loadReceipt(receipt.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {receiptMeta && receiptMeta.total > receiptMeta.limit && (
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button disabled={receiptPage === 1} onClick={() => setReceiptPage((current) => current - 1)}>Prev</Button>
            <span>Page {receiptMeta.page} of {Math.ceil(receiptMeta.total / receiptMeta.limit)}</span>
            <Button disabled={receiptPage * receiptMeta.limit >= receiptMeta.total} onClick={() => setReceiptPage((current) => current + 1)}>Next</Button>
          </div>
        )}
      </div>
      <BaseDialog open={isReceiptUploadOpen} onOpenChange={setIsReceiptUploadOpen} maxWidth="2xl">
        <AppDialogHeader title="Upload Receipt" subtitle="Upload a receipt for a customer order" />
        <AppDialogSection title="Receipt Information">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1"><Label>Order ID</Label><Input value={receiptUploadOrderId} onChange={(e) => setReceiptUploadOrderId(e.target.value)} /></div>
            <div className="col-span-2 space-y-1"><Label>Account</Label><Input value={receiptUploadAccount} onChange={(e) => setReceiptUploadAccount(e.target.value)} /></div>
            <div className="col-span-2 space-y-1"><Label>Note</Label><Textarea value={receiptUploadNote} onChange={(e) => setReceiptUploadNote(e.target.value)} rows={3} /></div>
            <div className="col-span-2 space-y-1"><Label>Receipt Image</Label><Input type="file" accept="image/*" onChange={(e) => setReceiptUploadFile(e.target.files?.[0] ?? null)} /></div>
          </div>
        </AppDialogSection>
        <AppDialogFooter
          secondaryAction={{ label: "Cancel", onClick: () => setIsReceiptUploadOpen(false) }}
          primaryAction={{
            label: "Upload",
            onClick: handleCreateReceipt,
            disabled: isReceiptCreating,
            loading: isReceiptCreating
          }}
        />
      </BaseDialog>
      <BaseDialog open={isReceiptViewOpen} onOpenChange={(open) => { if (!open) { setIsReceiptViewOpen(false); setSelectedReceipt(null); } }} maxWidth="2xl">
        <AppDialogHeader title="Receipt Details" subtitle={selectedReceipt?.id || ""} />
        {selectedReceipt ? (
          <div className="space-y-4">
            <AppDialogSection title="Receipt Information">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground text-xs">Receipt ID</p><p className="font-medium">{selectedReceipt.id}</p></div>
                <div><p className="text-muted-foreground text-xs">Order ID</p><p className="font-medium">{selectedReceipt.order.id}</p></div>
                <div><p className="text-muted-foreground text-xs">Customer Name</p><p className="font-medium">{selectedReceipt.order.user.full_name}</p></div>
                <div><p className="text-muted-foreground text-xs">Customer ID</p><p className="font-medium text-xs">{selectedReceipt.order.user.id}</p></div>
                <div><p className="text-muted-foreground text-xs">Amount</p><p className="font-medium">${selectedReceipt.amount}</p></div>
                <div><p className="text-muted-foreground text-xs">Payment Method</p><p className="font-medium capitalize">{selectedReceipt.payment_method}</p></div>
                <div><p className="text-muted-foreground text-xs">Account</p><p className="font-medium">{selectedReceipt.account}</p></div>
                <div><p className="text-muted-foreground text-xs">Status</p><Button variant="outline" className="text-xs capitalize">{selectedReceipt.status}</Button></div>
                <div><p className="text-muted-foreground text-xs">Created At</p><p className="font-medium text-xs">{selectedReceipt.created_at}</p></div>
                <div><p className="text-muted-foreground text-xs">Updated At</p><p className="font-medium text-xs">{selectedReceipt.updated_at}</p></div>
              </div>
            </AppDialogSection>
            <AppDialogSection title="Review & Update">
              <div className="space-y-4">
                <div className="space-y-1"><Label>Status</Label><Select value={receiptEditStatus} onValueChange={(v: any) => setReceiptEditStatus(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending_review">Pending Review</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent></Select></div>
                <div className="space-y-1"><Label>Note</Label><Textarea value={receiptEditNote} onChange={(e) => setReceiptEditNote(e.target.value)} rows={3} /></div>
                <div><p className="text-muted-foreground text-xs">Receipt Image</p><img src={selectedReceipt.file_url} alt="Receipt" className="w-full rounded-lg border" /></div>
              </div>
            </AppDialogSection>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Loading...</p>
        )}
        <AppDialogFooter
          secondaryAction={{ label: "Close", onClick: () => { setIsReceiptViewOpen(false); setSelectedReceipt(null); } }}
          primaryAction={{
            label: "Save Changes",
            onClick: handleSaveReceipt,
            disabled: isReceiptSaving || !selectedReceipt,
            loading: isReceiptSaving
          }}
        />
      </BaseDialog>
    </div>
  );
};

export default ReceiptsSection;
